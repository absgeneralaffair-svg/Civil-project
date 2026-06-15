import './globals.css';

export const metadata = {
  title: 'PT. ARTA BUMI SAKTI - Civil Construction Dashboard',
  description: 'Sistem Informasi Manajemen Konstruksi Sipil Interaktif',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <script src="https://unpkg.com/lucide@latest" async></script>
      </head>
      <body className="theme-dark antialiased">
        {children}
      </body>
    </html>
  );
}
