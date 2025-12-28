import { cn } from "@/app/utils/cn"; // Assuming cn utility exists, otherwise I'll define it or use template literals
import React from "react";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200 dark:bg-gray-700 ${className}`}
      {...props}
    />
  );
}

export { Skeleton };
