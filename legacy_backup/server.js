const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DB_FILE = path.join(__dirname, 'database.json');

// Helper to determine content type
const getContentType = (filePath) => {
    const extname = path.extname(filePath);
    switch (extname) {
        case '.js': return 'text/javascript';
        case '.css': return 'text/css';
        case '.json': return 'application/json';
        case '.png': return 'image/png';
        case '.jpg': return 'image/jpg';
        case '.html': return 'text/html';
        default: return 'text/plain';
    }
};

const server = http.createServer((req, res) => {
    // Enable CORS for frontend flexibility later
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // --- API ROUTES ---
    if (req.url === '/api/data') {
        if (req.method === 'GET') {
            fs.readFile(DB_FILE, 'utf8', (err, data) => {
                if (err) {
                    if (err.code === 'ENOENT') {
                        // DB file doesn't exist yet, return empty/default indication
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true, data: null }));
                    } else {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, message: 'Gagal membaca database.' }));
                    }
                } else {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, data: JSON.parse(data) }));
                }
            });
        } else if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                try {
                    const parsedData = JSON.parse(body);
                    fs.writeFile(DB_FILE, JSON.stringify(parsedData, null, 2), (err) => {
                        if (err) {
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: false, message: 'Gagal menyimpan ke database.' }));
                        } else {
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: true, message: 'Berhasil tersimpan permanen!' }));
                        }
                    });
                } catch (e) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, message: 'Format data tidak valid.' }));
                }
            });
        }
        return;
    }

    // --- STATIC FILE SERVING ---
    let filePath = req.url === '/' ? '/index.html' : req.url;
    // Strip query strings if any
    filePath = filePath.split('?')[0];
    
    const absPath = path.join(__dirname, filePath);

    fs.readFile(absPath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end(`File ${filePath} tidak ditemukan.`);
            } else {
                res.writeHead(500);
                res.end('Server error: ' + err.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': getContentType(absPath) });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`Server Backend Berjalan di: http://localhost:${PORT}`);
    console.log(`Aplikasi Civil Dashboard siap digunakan.`);
    console.log(`Data Anda otomatis tersimpan di database.json`);
    console.log(`=================================================`);
});
