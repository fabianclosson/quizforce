"use client";

import { useEffect } from "react";
import {
  initializePerformanceOptimizations,
  PERFORMANCE_MONITORING,
} from "@/lib/performance-optimization";

interface PerformanceMonitorProps {
  children: React.ReactNode;
}

export function PerformanceMonitor({ children }: PerformanceMonitorProps) {
  useEffect(() => {
    // Initialize performance optimizations
    initializePerformanceOptimizations();

    // Start monitoring Web Vitals
    PERFORMANCE_MONITORING.measureWebVitals();

    console.log("Performance monitoring initialized");
  }, []);

  return <>{children}</>;
}
