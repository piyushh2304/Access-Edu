"use client";
import React, { useRef } from "react";
import { useSpeechOnHover } from "@/app/hooks/useSpeechOnHover";

const DashboardWidgets = ({ open }: { open: boolean }) => {
  const headingRef = useSpeechOnHover<HTMLHeadingElement>('Dashboard Widgets heading');
  const paragraphRef = useSpeechOnHover<HTMLParagraphElement>('This is a placeholder for the dashboard widgets.');

  return (
    <div>
      <h1 ref={headingRef} tabIndex={0}>Dashboard Widgets</h1>
      <p ref={paragraphRef} tabIndex={0}>This is a placeholder for the dashboard widgets.</p>
    </div>
  );
};

export default DashboardWidgets;
