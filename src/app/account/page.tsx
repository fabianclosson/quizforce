import { Suspense } from "react";
import { ProfileDisplay } from "@/components/profile/profile-display";
import { ProfileLoadingState } from "@/components/profile/profile-loading-state";

export default function AccountPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Account Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your profile information and account preferences.
          </p>
        </div>

        <Suspense fallback={<ProfileLoadingState />}>
          <ProfileDisplay />
        </Suspense>
      </div>
    </div>
  );
}
