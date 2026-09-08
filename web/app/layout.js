import './globals.css';
export const metadata = {
  title: 'Traducteur France Turquie',
  description: 'Deux assistants de traduction franco-turcs installables sur iPhone',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent' }
};
export const viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#0b1220' };
export default function RootLayout({ children }) {
  return <html lang="fr"><body>{children}</body></html>;
}
