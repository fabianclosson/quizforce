import { Card, CardContent } from "@/components/ui/card";
import { BookOpenCheck } from "lucide-react";

export function EnrollmentEmptyState() {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <BookOpenCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No Enrollments Yet</h3>
        <p className="text-muted-foreground">
          You haven&apos;t enrolled in any certifications yet. Explore our catalog to
          get started!
        </p>
      </CardContent>
    </Card>
  );
}
