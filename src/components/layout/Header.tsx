"use client";

import * as React from "react";
import { Button } from "../ui/button";

interface HeaderProps {
  title?: string;
  description?: string;
  onSidebarToggle?: () => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  actions?: React.ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export function Header({ 
  title, 
  description,
  onSidebarToggle,
  searchValue,
  onSearchChange,
  actions,
  breadcrumbs
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur-md dark:bg-gray-900/80">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onSidebarToggle}
            className="lg:hidden"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="sr-only">Toggle sidebar</span>
          </Button>
          
          <div>
            <h1 className="text-lg font-semibold">{title}</h1>
            {description && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-4">
          <div className="w-full max-w-2xl">
            <div className="relative">
              <input
                type="text"
                value={searchValue || ""}
                onChange={(e) => onSearchChange?.(e.target.value)}
                placeholder="Search tasks, lists, labels..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
              <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.07 2.82l3.1 3.1a2.006 2.006 0 0 1 0 2.83l-4.9 4.9a2.006 2.006 0 0 1-2.83 0l-3.1-3.1a2.006 2.006 0 0 1 0-2.83l4.9-4.9a2.006 2.006 0 0 1 2.83 0z" />
            </svg>
            <span className="sr-only">Theme toggle</span>
          </Button>
          
          <Button variant="ghost" size="icon">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10 18a8 8 0 100-16 8 8 0 000 16z" />
            </svg>
            <span className="sr-only">Notifications</span>
          </Button>
          
          <Button variant="ghost" size="icon">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="sr-only">Account</span>
          </Button>

          {actions}
        </div>
      </div>

      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="container border-t bg-gray-50/50 px-6 py-3 dark:bg-gray-800/50">
          <nav className="text-sm text-gray-600 dark:text-gray-300">
            {breadcrumbs.map((crumb, index) => (
              <span key={crumb.label}>
                {index > 0 && <span className="mx-2">/</span>}
                {crumb.href ? (
                  <a href={crumb.href} className="hover:text-primary">
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-primary">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
