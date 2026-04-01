import "./globals.css";
import Sidebar from "../components/layout/sidebar";
import Header from "../components/layout/header";
import { cn } from "../lib/utils";
import Providers from "./providers";
import Fab from "../components/ui/fab";

export const metadata = {
  title: "Clinic Patient Portal",
  description: "Patient Management Portal for Dental Clinic",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={cn("antialiased bg-app-bg text-app-foreground")}>
        <Providers>
          <div className="min-h-dvh grid grid-cols-[auto_1fr] grid-rows-[auto_1fr] md:grid-rows-[auto_1fr] md:grid-cols-[280px_1fr]">
            <Header className="col-span-2" />
            <Sidebar className="row-start-2 hidden md:block" />
            <main className="row-start-2 p-4 md:p-6 bg-app-surface rounded-t-2xl md:rounded-none shadow-none">
              {children}
            </main>
            <Fab />
          </div>
        </Providers>
      </body>
    </html>
  );
}
