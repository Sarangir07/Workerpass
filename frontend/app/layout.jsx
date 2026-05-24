import "./globals.css";

export const metadata = {
  title: "WorkCred Auth",
  description: "Authentication UI for the WorkCred worker verification portal"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
