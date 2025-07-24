import { toast } from "sonner";

export function useToast() {
  return {
    toast: (message: string | { title?: string; description?: string }) => {
      if (typeof message === "string") {
        toast(message);
      } else {
        toast(message.title || message.description || "Notification");
      }
    },
    success: (message: string) => toast.success(message),
    error: (message: string) => toast.error(message),
    warning: (message: string) => toast.warning(message),
    info: (message: string) => toast.info(message),
  };
}
