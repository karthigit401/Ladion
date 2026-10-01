import "./globals.css";
import { ToastProvider } from "@/components/Toast";

export const metadata = {
  title: "Ladion Services Platform",
  description: "Browse services, submit a project, and track it through delivery.",
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
