import { createHealthCheck } from "@/lib/monitoring-middleware";

// Export the health check endpoint
export const GET = createHealthCheck(); 