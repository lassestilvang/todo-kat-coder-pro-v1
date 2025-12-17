"use client";

import * as React from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  footer?: React.ReactNode;
  theme?: "light" | "dark" | "system";
  className?: string;
}

export function Layout({
  children,
  title,
  description,
  header,
  sidebar,
  footer,
  theme = "system",
  className,
}: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  React.useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (theme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      // system theme - let the system decide
    }
  }, [theme]);

  return (
    <div
      className={cn("min-h-screen bg-background text-foreground", className)}
    >
      <Header
        title={title}
        description={description}
        onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>

      {footer && (
        <footer className="border-t bg-muted/50">
          <div className="container py-6">{footer}</div>
        </footer>
      )}
    </div>
  );
}
