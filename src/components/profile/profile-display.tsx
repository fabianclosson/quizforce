"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProfileEditForm } from "./profile-edit-form";
import { PasswordChangeForm } from "./password-change-form";
import { User, Mail, Calendar, Shield, Edit2, Lock } from "lucide-react";

export function ProfileDisplay() {
  const { user } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  if (!user) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">
            Please sign in to view your profile.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Extract user information
  const displayName =
    user.user_metadata?.full_name ||
    `${user.user_metadata?.first_name || ""} ${user.user_metadata?.last_name || ""}`.trim() ||
    user.email?.split("@")[0] ||
    "User";

  const firstName = user.user_metadata?.first_name || "";
  const lastName = user.user_metadata?.last_name || "";
  const email = user.email || "";
  const avatarUrl =
    user.user_metadata?.avatar_url || user.user_metadata?.picture;
  const provider = user.app_metadata?.provider || "email";
  const createdAt = user.created_at
    ? new Date(user.created_at).toLocaleDateString()
    : "";

  // Get initials for avatar fallback
  const initials = displayName
    .split(" ")
    .map((name: string) => name.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (isEditingProfile) {
    return (
      <ProfileEditForm
        user={user}
        onCancel={() => setIsEditingProfile(false)}
        onSuccess={() => setIsEditingProfile(false)}
      />
    );
  }

  if (isChangingPassword) {
    return (
      <PasswordChangeForm
        onCancel={() => setIsChangingPassword(false)}
        onSuccess={() => setIsChangingPassword(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Information Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Your personal information and account details
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditingProfile(true)}
              className="flex items-center gap-2"
            >
              <Edit2 className="h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Picture and Basic Info */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={avatarUrl} alt={displayName} />
              <AvatarFallback className="text-lg font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h3 className="text-2xl font-semibold">{displayName}</h3>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={provider === "email" ? "default" : "secondary"}>
                  <Shield className="h-3 w-3 mr-1" />
                  {provider === "email"
                    ? "Email Account"
                    : `${provider.charAt(0).toUpperCase() + provider.slice(1)} Account`}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Detailed Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  First Name
                </label>
                <p className="text-sm mt-1">{firstName || "Not provided"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Last Name
                </label>
                <p className="text-sm mt-1">{lastName || "Not provided"}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Email Address
                </label>
                <p className="text-sm mt-1">{email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Member Since
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{createdAt}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings Card */}
      {provider === "email" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Security Settings
            </CardTitle>
            <CardDescription>
              Manage your account security and authentication
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Password</h4>
                <p className="text-sm text-muted-foreground">
                  Change your account password
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsChangingPassword(true)}
                className="flex items-center gap-2"
              >
                <Lock className="h-4 w-4" />
                Change Password
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
