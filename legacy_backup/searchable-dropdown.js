/**
 * Searchable Dropdown Component
 * Converts all <select> elements into custom searchable dropdowns
 * with dark-themed styling that matches the PT. ARTA BUMI SAKTI design system.
 * 
 * Features:
 * - Type to search/filter options
 * - Dark themed dropdown (not white)
 * - Preserves original <select> .value, change events, and innerHTML updates
 * - Auto-syncs via MutationObserver
 */

(function () {
    'use strict';

    const WRAPPER_CLASS = 'sd-wrapper';
    const DISPLAY_CLASS = 'sd-display';
    const SEARCH_CLASS = 'sd-search';
    const DROPDOWN_CLASS = 'sd-dropdown';
    const OPTION_CLASS = 'sd-option';
    const OPTION_ACTIVE_CLASS = 'sd-option-active';
    const OPEN_CLASS = 'sd-open';

    // Store all initialized wrappers
    const wrapperMap = new WeakMap();

    /**
     * Create a searchable dropdown wrapper for a <select> element.
     */
    function createSearchableDropdown(selectEl) {
        if (wrapperMap.has(selectEl)) return; // Already initialized

        // Hide original select but keep it in DOM for form submission
        selectEl.style.position = 'absolute';
        selectEl.style.opacity = '0';
        selectEl.style.pointerEvents = 'none';
        selectEl.style.width = '0';
        selectEl.style.height = '0';
        selectEl.style.overflow = 'hidden';
        selectEl.setAttribute('tabindex', '-1');
        selectEl.setAttribute('aria-hidden', 'true');

        // Create wrapper
        const wrapper = document.createElement('div');
        wrapper.className = WRAPPER_CLASS;

        // Create display area (shows selected option text)
        const display = document.createElement('div');
        display.className = DISPLAY_CLASS;
        display.setAttribute('tabindex', '0');

        const displayText = document.createElement('span');
        displayText.className = 'sd-display-text';

        const chevron = document.createElement('span');
        chevron.className = 'sd-chevron';
        chevron.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`;

        display.appendChild(displayText);
        display.appendChild(chevron);

        // Create dropdown panel
        const dropdown = document.createElement('div');
        dropdown.className = DROPDOWN_CLASS;

        // Search input inside dropdown
        const searchInput = document.createElement('input');
        searchInput.className = SEARCH_CLASS;
        searchInput.type = 'text';
        searchInput.placeholder = 'Ketik untuk mencari...';
        searchInput.setAttribute('autocomplete', 'off');

        const optionsList = document.createElement('div');
        optionsList.className = 'sd-options-list';

        dropdown.appendChild(searchInput);
        dropdown.appendChild(optionsList);

        // Insert wrapper after select
        selectEl.parentNode.insertBefore(wrapper, selectEl.nextSibling);
        wrapper.appendChild(display);
        wrapper.appendChild(dropdown);

        // Store references
        const state = {
            selectEl,
            wrapper,
            display,
            displayText,
            dropdown,
            searchInput,
            optionsList,
            isOpen: false,
            activeIndex: -1
        };
        wrapperMap.set(selectEl, state);

        // Populate options
        syncOptions(state);
        updateDisplayText(state);

        // --- Event Handlers ---

        // Toggle open/close on display click
        display.addEventListener('click', (e) => {
            e.stopPropagation();
            if (state.isOpen) {
                closeDropdown(state);
            } else {
                openDropdown(state);
            }
        });

        // Keyboard on display
        display.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
                e.preventDefault();
                openDropdown(state);
            }
        });

        // Search input filter
        searchInput.addEventListener('input', () => {
            filterOptions(state, searchInput.value);
        });

        // Keyboard navigation inside dropdown
        searchInput.addEventListener('keydown', (e) => {
            const visibleOptions = optionsList.querySelectorAll(`.${OPTION_CLASS}:not(.sd-hidden)`);
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                state.activeIndex = Math.min(state.activeIndex + 1, visibleOptions.length - 1);
                highlightOption(state, visibleOptions);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                state.activeIndex = Math.max(state.activeIndex - 1, 0);
                highlightOption(state, visibleOptions);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (state.activeIndex >= 0 && state.activeIndex < visibleOptions.length) {
                    selectOption(state, visibleOptions[state.activeIndex]);
                }
            } else if (e.key === 'Escape') {
                closeDropdown(state);
                display.focus();
            }
        });

        // Observe original select for innerHTML/option changes
        const observer = new MutationObserver(() => {
            syncOptions(state);
            updateDisplayText(state);
        });
        observer.observe(selectEl, { childList: true, subtree: true, characterData: true });

        // Intercept programmatic .value changes on the original select
        const originalDescriptor = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
        const proxySelect = selectEl;

        // We use a polling approach to detect programmatic .value changes
        // that bypass the setter, since many patterns use direct assignment after innerHTML
        let lastKnownValue = selectEl.value;
        const valueCheckInterval = setInterval(() => {
            if (!document.body.contains(selectEl)) {
                clearInterval(valueCheckInterval);
                return;
            }
            if (selectEl.value !== lastKnownValue) {
                lastKnownValue = selectEl.value;
                updateDisplayText(state);
                syncActiveState(state);
            }
        }, 200);

        // Also listen for native change events on the select
        selectEl.addEventListener('change', () => {
            lastKnownValue = selectEl.value;
            updateDisplayText(state);
            syncActiveState(state);
        });
    }

    function syncOptions(state) {
        const { selectEl, optionsList } = state;
        optionsList.innerHTML = '';

        Array.from(selectEl.options).forEach((opt, index) => {
            const optDiv = document.createElement('div');
            optDiv.className = OPTION_CLASS;
            optDiv.setAttribute('data-value', opt.value);
            optDiv.setAttribute('data-index', index);
            optDiv.textContent = opt.textContent;

            if (opt.disabled) {
                optDiv.classList.add('sd-disabled');
            }

            // Mark selected
            if (opt.selected && !opt.disabled) {
                optDiv.classList.add(OPTION_ACTIVE_CLASS);
            }

            optDiv.addEventListener('click', (e) => {
                e.stopPropagation();
                if (opt.disabled) return;
                selectOption(state, optDiv);
            });

            optDiv.addEventListener('mouseenter', () => {
                // Remove active from all on hover
                optionsList.querySelectorAll(`.${OPTION_CLASS}`).forEach(o => o.classList.remove('sd-hover'));
                optDiv.classList.add('sd-hover');
            });

            optionsList.appendChild(optDiv);
        });

        state.activeIndex = -1;
    }

    function syncActiveState(state) {
        const { selectEl, optionsList } = state;
        const currentVal = selectEl.value;

        optionsList.querySelectorAll(`.${OPTION_CLASS}`).forEach(opt => {
            opt.classList.remove(OPTION_ACTIVE_CLASS);
            if (opt.getAttribute('data-value') === currentVal) {
                opt.classList.add(OPTION_ACTIVE_CLASS);
            }
        });
    }

    function updateDisplayText(state) {
        const { selectEl, displayText } = state;
        const selectedOption = selectEl.options[selectEl.selectedIndex];

        if (selectedOption && !selectedOption.disabled) {
            displayText.textContent = selectedOption.textContent;
            displayText.classList.remove('sd-placeholder');
        } else if (selectedOption) {
            displayText.textContent = selectedOption.textContent;
            displayText.classList.add('sd-placeholder');
        } else {
            displayText.textContent = '-- Pilih --';
            displayText.classList.add('sd-placeholder');
        }
    }

    function openDropdown(state) {
        const { wrapper, dropdown, searchInput, optionsList } = state;
        state.isOpen = true;
        wrapper.classList.add(OPEN_CLASS);

        // Reset search
        searchInput.value = '';
        filterOptions(state, '');
        state.activeIndex = -1;

        // Position dropdown
        positionDropdown(state);

        // Focus search
        setTimeout(() => searchInput.focus(), 30);
    }

    function closeDropdown(state) {
        const { wrapper } = state;
        state.isOpen = false;
        wrapper.classList.remove(OPEN_CLASS);
        state.activeIndex = -1;
    }

    function positionDropdown(state) {
        const { wrapper, dropdown } = state;
        const rect = wrapper.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;

        dropdown.classList.remove('sd-dropdown-above');

        if (spaceBelow < 250 && spaceAbove > spaceBelow) {
            dropdown.classList.add('sd-dropdown-above');
        }
    }

    function filterOptions(state, query) {
        const { optionsList } = state;
        const normalizedQuery = query.toLowerCase().trim();

        optionsList.querySelectorAll(`.${OPTION_CLASS}`).forEach(opt => {
            const text = opt.textContent.toLowerCase();
            if (normalizedQuery === '' || text.includes(normalizedQuery)) {
                opt.classList.remove('sd-hidden');
            } else {
                opt.classList.add('sd-hidden');
            }
        });

        // Show "no results" message
        const visibleCount = optionsList.querySelectorAll(`.${OPTION_CLASS}:not(.sd-hidden)`).length;
        let noResultMsg = optionsList.querySelector('.sd-no-result');
        if (visibleCount === 0) {
            if (!noResultMsg) {
                noResultMsg = document.createElement('div');
                noResultMsg.className = 'sd-no-result';
                noResultMsg.textContent = 'Tidak ditemukan';
                optionsList.appendChild(noResultMsg);
            }
            noResultMsg.style.display = 'block';
        } else if (noResultMsg) {
            noResultMsg.style.display = 'none';
        }

        state.activeIndex = -1;
    }

    function highlightOption(state, visibleOptions) {
        const { optionsList } = state;
        optionsList.querySelectorAll(`.${OPTION_CLASS}`).forEach(o => o.classList.remove('sd-hover'));

        if (state.activeIndex >= 0 && state.activeIndex < visibleOptions.length) {
            visibleOptions[state.activeIndex].classList.add('sd-hover');
            visibleOptions[state.activeIndex].scrollIntoView({ block: 'nearest' });
        }
    }

    function selectOption(state, optDiv) {
        const { selectEl, optionsList } = state;
        const value = optDiv.getAttribute('data-value');

        // Update original select
        selectEl.value = value;

        // Dispatch change event on the original select
        const event = new Event('change', { bubbles: true });
        selectEl.dispatchEvent(event);

        // Update visual
        optionsList.querySelectorAll(`.${OPTION_CLASS}`).forEach(o => o.classList.remove(OPTION_ACTIVE_CLASS));
        optDiv.classList.add(OPTION_ACTIVE_CLASS);

        updateDisplayText(state);
        closeDropdown(state);
        state.display.focus();
    }

    // --- Close dropdown on outside click ---
    document.addEventListener('click', (e) => {
        document.querySelectorAll(`.${WRAPPER_CLASS}.${OPEN_CLASS}`).forEach(wrapper => {
            if (!wrapper.contains(e.target)) {
                const selectEl = wrapper.previousElementSibling;
                if (selectEl && wrapperMap.has(selectEl)) {
                    closeDropdown(wrapperMap.get(selectEl));
                }
            }
        });
    });

    // --- Public API ---
    window.SearchableDropdown = {
        /**
         * Initialize all <select> elements on the page.
         */
        initAll: function () {
            document.querySelectorAll('select').forEach(sel => {
                createSearchableDropdown(sel);
            });
        },

        /**
         * Initialize a specific <select> element.
         */
        init: function (selectEl) {
            if (selectEl instanceof HTMLSelectElement) {
                createSearchableDropdown(selectEl);
            }
        },

        /**
         * Refresh/re-sync a specific select's custom dropdown.
         * Useful after programmatic option changes.
         */
        refresh: function (selectEl) {
            if (wrapperMap.has(selectEl)) {
                const state = wrapperMap.get(selectEl);
                syncOptions(state);
                updateDisplayText(state);
            }
        },

        /**
         * Refresh all initialized dropdowns.
         */
        refreshAll: function () {
            document.querySelectorAll('select').forEach(sel => {
                if (wrapperMap.has(sel)) {
                    const state = wrapperMap.get(sel);
                    syncOptions(state);
                    updateDisplayText(state);
                }
            });
        }
    };
})();
