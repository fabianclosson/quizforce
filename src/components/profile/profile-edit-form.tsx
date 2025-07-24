"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  User as UserIcon,
  Save,
  X,
  Upload,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const profileSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters"),
  email: z.string().email("Please enter a valid email address"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileEditFormProps {
  user: User;
  onCancel: () => void;
  onSuccess: () => void;
}

export function ProfileEditForm({
  user,
  onCancel,
  onSuccess,
}: ProfileEditFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const supabase = createClient();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user.user_metadata?.first_name || "",
      lastName: user.user_metadata?.last_name || "",
      email: user.email || "",
    },
  });

  const currentAvatarUrl =
    user.user_metadata?.avatar_url || user.user_metadata?.picture;
  const displayName =
    user.user_metadata?.full_name ||
    `${user.user_metadata?.first_name || ""} ${user.user_metadata?.last_name || ""}`.trim() ||
    user.email?.split("@")[0] ||
    "User";

  // Get initials for avatar fallback
  const initials = displayName
    .split(" ")
    .map((name: string) => name.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Avatar image must be less than 5MB");
        return;
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }

      setAvatarFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    try {
      // Defensive check for user ID
      if (!user?.id) {
        console.error("User ID is missing:", { user });
        setError("User session invalid. Please sign out and sign back in.");
        return null;
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      console.log("Attempting to upload avatar:", {
        fileName,
        fileSize: file.size,
        fileType: file.type,
        userId: user.id,
        userEmail: user.email,
      });

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        console.error("Upload error details:", {
          error: uploadError,
          message: uploadError.message,
          statusCode: (uploadError as any)?.statusCode,
          errorData: JSON.stringify(uploadError, null, 2), // Better logging
        });

        // Check for specific error patterns
        const errorMessage = uploadError.message?.toLowerCase() || "";
        const statusCode = (uploadError as any)?.statusCode;

        if (
          errorMessage.includes("bucket") ||
          errorMessage.includes("not found") ||
          errorMessage.includes("does not exist") ||
          statusCode === "404" ||
          statusCode === 404
        ) {
          setError(
            "❌ Storage bucket not found. The avatars storage bucket needs to be created in Supabase. Please run the storage setup script in your Supabase dashboard."
          );
        } else if (
          errorMessage.includes("policy") ||
          errorMessage.includes("permission") ||
          errorMessage.includes("unauthorized") ||
          statusCode === "403" ||
          statusCode === 403
        ) {
          setError(
            "❌ Upload permissions not configured. Storage policies need to be set up in Supabase."
          );
        } else if (
          errorMessage.includes("size") ||
          errorMessage.includes("too large") ||
          statusCode === "413" ||
          statusCode === 413
        ) {
          setError("❌ File is too large. Please choose an image under 5MB.");
        } else if (
          errorMessage.includes("mime") ||
          errorMessage.includes("type") ||
          errorMessage.includes("format") ||
          errorMessage.includes("invalid mime type")
        ) {
          setError(
            "❌ File type not supported. Please use JPEG, PNG, WebP, or GIF format."
          );
        } else if (statusCode === "400" || statusCode === 400) {
          setError(
            "❌ Bad request - This usually means the storage bucket hasn't been set up yet. Please run the setup_avatar_storage.sql script in your Supabase dashboard."
          );
        } else {
          setError(
            `❌ Upload failed: ${uploadError.message || "Unknown error"}. Check the console for more details.`
          );
        }
        return null;
      }

      console.log("Upload successful:", uploadData);

      const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
      console.log("Generated public URL:", data.publicUrl);

      return data.publicUrl;
    } catch (err) {
      console.error("Avatar upload error (catch block):", err);
      setError(
        `Failed to upload profile picture: ${err instanceof Error ? err.message : "Unknown error"}. Please try again or contact support if the problem persists.`
      );
      return null;
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let avatarUrl = currentAvatarUrl;
      let avatarUploadFailed = false;

      // Upload new avatar if selected
      if (avatarFile) {
        const uploadedUrl = await uploadAvatar(avatarFile);
        if (uploadedUrl) {
          avatarUrl = uploadedUrl;
        } else {
          avatarUploadFailed = true;
          // Clear the previous error set by uploadAvatar and set a more user-friendly message
          setError(null);
        }
      }

      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        email: data.email,
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          full_name: `${data.firstName} ${data.lastName}`,
          avatar_url: avatarUrl,
        },
      });

      if (updateError) {
        throw updateError;
      }

      // Set success message with appropriate context
      if (avatarUploadFailed) {
        setSuccess(
          "Profile updated successfully! However, the profile picture could not be uploaded. Please try uploading it again or contact support if the issue persists."
        );
      } else {
        setSuccess("Profile updated successfully!");
      }

      // Wait a moment to show success message, then call onSuccess
      setTimeout(() => {
        onSuccess();
      }, 2000); // Extended time for longer message
    } catch (err) {
      console.error("Profile update error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update profile. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserIcon className="h-5 w-5" />
          Edit Profile
        </CardTitle>
        <CardDescription>
          Update your personal information and profile picture
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Avatar Section */}
            <div className="space-y-4">
              <Label>Profile Picture</Label>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={avatarPreview || currentAvatarUrl}
                    alt={displayName}
                  />
                  <AvatarFallback className="text-lg font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Label htmlFor="avatar-upload" className="cursor-pointer">
                    <div className="flex items-center gap-2 px-3 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md text-sm">
                      <Upload className="h-4 w-4" />
                      Choose Image
                    </div>
                  </Label>
                  <Input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG or GIF. Max size 5MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your first name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Error/Success Messages */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
