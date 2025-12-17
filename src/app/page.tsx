"use client";

import * as React from "react";
import { TodayView } from "@/components/views/TodayView";
import { Next7DaysView } from "@/components/views/Next7DaysView";
import { UpcomingView } from "@/components/views/UpcomingView";
import { AllView } from "@/components/views/AllView";
import { InboxView } from "@/components/views/InboxView";
import { TaskManagement } from "@/components/views/TaskManagement";
import { useUIStore } from "@/store/uiStore";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const [view, setView] = React.useState("today");
  const [showManagement, setShowManagement] = React.useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <div className="flex">
        <Sidebar open={true} onClose={() => {}} />

        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Task Planner
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Manage your tasks efficiently
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant={view === "today" ? "secondary" : "outline"}
                  onClick={() => {
                    setView("today");
                    setShowManagement(false);
                  }}
                >
                  Today
                </Button>
                <Button
                  variant={view === "next7days" ? "secondary" : "outline"}
                  onClick={() => {
                    setView("next7days");
                    setShowManagement(false);
                  }}
                >
                  Next 7 Days
                </Button>
                <Button
                  variant={view === "upcoming" ? "secondary" : "outline"}
                  onClick={() => {
                    setView("upcoming");
                    setShowManagement(false);
                  }}
                >
                  Upcoming
                </Button>
                <Button
                  variant={view === "all" ? "secondary" : "outline"}
                  onClick={() => {
                    setView("all");
                    setShowManagement(false);
                  }}
                >
                  All
                </Button>
                <Button
                  variant={view === "inbox" ? "secondary" : "outline"}
                  onClick={() => {
                    setView("inbox");
                    setShowManagement(false);
                  }}
                >
                  Inbox
                </Button>
                <Button
                  variant={showManagement ? "secondary" : "outline"}
                  onClick={() => setShowManagement(true)}
                >
                  Management
                </Button>
              </div>
            </div>

            {!showManagement && view === "today" && <TodayView />}
            {!showManagement && view === "next7days" && <Next7DaysView />}
            {!showManagement && view === "upcoming" && <UpcomingView />}
            {!showManagement && view === "all" && <AllView />}
            {!showManagement && view === "inbox" && <InboxView />}
            {showManagement && <TaskManagement />}
          </div>
        </main>
      </div>
    </div>
  );
}
