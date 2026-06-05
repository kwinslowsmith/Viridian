/**
 * Card component
 */

import React from "react";
import { colors } from "@/app/modules/improv/design/colors";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated";
  children: React.ReactNode;
}

export function Card({
  variant = "default",
  className = "",
  children,
  ...props
}: CardProps) {
  const variantClasses = {
    default: `bg-white border border-gray-200 rounded-xl`,
    elevated: `bg-white border border-gray-200 rounded-xl shadow-sm`,
  };

  return (
    <div
      className={`${variantClasses[variant]} ${className}`}
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
