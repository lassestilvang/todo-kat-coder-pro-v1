"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TaskCard } from "./TaskCard";
import { TaskWithRelations } from "@/types/task";

interface AnimatedTaskCardProps {
  task: TaskWithRelations;
  index: number;
  onToggle: (id: number) => void;
  onEdit: (task: TaskWithRelations) => void;
  onDelete: (id: number) => void;
  className?: string;
}

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 120,
      delay: index * 0.05,
    },
  }),
  hover: {
    scale: 1.02,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 300,
    },
  },
  tap: {
    scale: 0.98,
  },
};

const priorityColors = {
  low: "from-green-400 to-emerald-500",
  medium: "from-yellow-400 to-orange-500",
  high: "from-red-400 to-pink-500",
  urgent: "from-purple-400 to-violet-500",
  none: "from-gray-400 to-gray-500",
};

export function AnimatedTaskCard({
  task,
  index,
  onToggle,
  onEdit,
  onDelete,
  className,
}: AnimatedTaskCardProps) {
  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
      className={className}
    >
      <TaskCard
        task={task}
        onToggle={onToggle}
        onEdit={onEdit}
        onDelete={onDelete}
        className={`group hover:shadow-lg transition-all duration-300 ${
          task.isCompleted ? "opacity-75" : ""
        }`}
      />
    </motion.div>
  );
}

interface AnimatedTaskListProps {
  tasks: TaskWithRelations[];
  onToggle: (id: number) => void;
  onEdit: (task: TaskWithRelations) => void;
  onDelete: (id: number) => void;
  className?: string;
}

export function AnimatedTaskList({
  tasks,
  onToggle,
  onEdit,
  onDelete,
  className,
}: AnimatedTaskListProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {tasks.map((task, index) => (
        <AnimatedTaskCard
          key={task.id}
          task={task}
          index={index}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </motion.div>
  );
}

interface AnimatedPageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedPageWrapper({
  children,
  className,
}: AnimatedPageWrapperProps) {
  const pageVariants = {
    initial: {
      opacity: 0,
      y: 20,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3,
        ease: "easeIn",
      },
    },
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export function AnimatedButton({
  children,
  onClick,
  className,
  disabled = false,
}: AnimatedButtonProps) {
  const buttonVariants = {
    rest: {
      scale: 1,
      boxShadow: "0 2px 0 rgba(0,0,0,0.1)",
    },
    hover: {
      scale: 1.05,
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300,
      },
    },
    tap: {
      scale: 0.95,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300,
      },
    },
  };

  return (
    <motion.button
      variants={buttonVariants}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </motion.button>
  );
}

interface AnimatedModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export function AnimatedModal({
  isOpen,
  onClose,
  children,
  className,
}: AnimatedModalProps) {
  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.9,
      y: 20,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 120,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      y: 20,
      transition: {
        duration: 0.2,
      },
    },
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 0.5,
      transition: {
        duration: 0.3,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.2,
      },
    },
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black z-50"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={onClose}
      />
      <motion.div
        className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 ${className}`}
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

interface LoadingSkeletonProps {
  className?: string;
  count?: number;
}

export function LoadingSkeleton({
  className,
  count = 3,
}: LoadingSkeletonProps) {
  const skeletonVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        repeat: Infinity,
        repeatType: "reverse",
      },
    },
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          variants={skeletonVariants}
          initial="hidden"
          animate="visible"
          className={`h-20 bg-gray-200 rounded-lg animate-pulse ${className}`}
          transition={{ delay: index * 0.1 }}
        />
      ))}
    </>
  );
}
