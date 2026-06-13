import "./globals.css";
import { ToastProvider } from "@/components/Toast";
import { InquiriesProvider } from "@/components/InquiriesProvider";

export const metadata = {
  title: "Clans Machina | Admin Panel",
  description: "Manage solar inquiries and blog content",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <InquiriesProvider>{children}</InquiriesProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
