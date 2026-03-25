export const metadata = {
  title: "Formulaire MongoDB Atlas",
  description: "Enregistrement d'un utilisateur avec Next.js et MongoDB Atlas.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          backgroundColor: "#f3f4f6",
          color: "#111827",
        }}
      >
        {children}
      </body>
    </html>
  );
}
