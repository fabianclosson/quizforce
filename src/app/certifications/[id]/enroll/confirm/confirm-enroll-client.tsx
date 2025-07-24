"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { enrollInCertification } from "@/app/actions/enrollment";

interface Props {
  certificationId: string;
  certificationName: string;
}

export function ConfirmEnrollClient({
  certificationId,
  certificationName,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleConfirm = async () => {
    startTransition(async () => {
      const result = await enrollInCertification(certificationId);
      if (result.success) {
        toast.success(`Successfully enrolled in ${certificationName}!`);
        router.push("/practice-exams");
      } else {
        toast.error(result.message || "Failed to enroll. Please try again.");
      }
    });
  };

  return (
    <Button
      onClick={handleConfirm}
      disabled={isPending}
      className="w-full md:w-auto"
    >
      {isPending ? "Enrolling..." : "Confirm & Start Learning"}
    </Button>
  );
}
