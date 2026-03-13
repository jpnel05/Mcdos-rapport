import './globals.css'
export const metadata = {
  title: "Rapport de Quart – McDonald's Alma",
  manifest: '/manifest.json',
}
export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#b91c1c" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Rapport Quart" />
      </head>
      <body>{children}</body>
    </html>
  )
}
