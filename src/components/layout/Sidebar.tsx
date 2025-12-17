"use client";

import * as React from "react";
import { Button } from "../ui/button";
// import { X } from "lucide-react";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const navigation = [
    { name: "Today", href: "/today", icon: "📅" },
    { name: "Next 7 Days", href: "/next-7-days", icon: "📆" },
    { name: "Upcoming", href: "/upcoming", icon: "🗓️" },
    { name: "All", href: "/all", icon: "📋" },
    { name: "Inbox", href: "/inbox", icon: "📥" },
  ];

  const lists = [
    { name: "Personal", color: "#FF5733", emoji: "🏠" },
    { name: "Work", color: "#33FF57", emoji: "💼" },
    { name: "Shopping", color: "#3357FF", emoji: "🛒" },
  ];

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-black/50 transition-opacity lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-30 h-full w-64 transform border-r bg-white shadow-lg transition-transform lg:static lg:translate-x-0 dark:bg-gray-900 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          <h2 className="text-lg font-semibold">Menu</h2>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onClose}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="sr-only">Close menu</span>
          </Button>
        </div>

        <nav className="space-y-1 p-4">
          <div className="mb-4">
            <h3 className="px-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Views
            </h3>
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="flex items-center space-x-3 rounded-md px-2 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </a>
            ))}
          </div>

          <div>
            <h3 className="px-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Lists
            </h3>
            {lists.map((list) => (
              <a
                key={list.name}
                href={`/lists/${list.name.toLowerCase()}`}
                className="flex items-center space-x-3 rounded-md px-2 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                <span
                  className="inline-block h-6 w-6 rounded"
                  style={{ backgroundColor: list.color }}
                >
                  <span className="ml-1">{list.emoji}</span>
                </span>
                <span>{list.name}</span>
              </a>
            ))}
          </div>
        </nav>
      </aside>
    </>
  );
}
