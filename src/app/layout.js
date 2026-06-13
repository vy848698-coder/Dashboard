import "./globals.css";
import { ToastProvider } from "@/components/Toast";

export const metadata = {
  title: "Clans Machina | Admin Panel",
  description: "Manage solar inquiries and blog content",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
