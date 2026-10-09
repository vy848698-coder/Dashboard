import "./globals.css";
import { ToastProvider } from "@/components/Toast";
import { InquiriesProvider } from "@/components/InquiriesProvider";
import { SaathiProvider } from "@/components/SaathiProvider";

export const metadata = {
  title: "Clans Machina | Admin Panel",
  description: "Manage solar inquiries and blog content",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <InquiriesProvider>
            <SaathiProvider>{children}</SaathiProvider>
          </InquiriesProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
