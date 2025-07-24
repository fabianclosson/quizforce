"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  User,
  Mail,
  Calendar,
  BookOpen,
  Trophy,
  Target,
  TrendingUp,
  ArrowLeft,
  Shield,
  ShieldCheck,
  Clock,
  CheckCircle,
  XCircle,
  Trash2,
  CreditCard,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  account_status: string;
  created_at: string;
  updated_at: string;
  avatar_url: string | null;
}

interface Enrollment {
  id: string;
  enrolled_at: string;
  status: string;
  certifications: {
    id: string;
    name: string;
    slug: string;
    description: string;
    price_cents: number;
    category: string;
  };
}

interface ExamAttempt {
  id: string;
  score: number | null;
  passed: boolean;
  started_at: string;
  completed_at: string | null;
  time_taken_seconds: number | null;
  practice_exams: {
    id: string;
    name: string;
    total_questions: number;
    passing_score: number;
    certifications: {
      name: string;
      slug: string;
    };
  };
}

interface Purchase {
  id: string;
  stripe_payment_intent_id: string;
  product_type: string;
  product_id: string;
  product_name: string;
  amount_cents: number;
  currency: string;
  discount_amount_cents: number;
  final_amount_cents: number;
  status: string;
  coupon_code: string | null;
  created_at: string;
  completed_at: string | null;
}

interface UserStatistics {
  totalEnrollments: number;
  totalExamAttempts: number;
  passedExams: number;
  totalPurchases: number;
  totalSpent: number;
  averageScore: number;
  successRate: number;
}

interface UserDetailData {
  user: UserProfile;
  enrollments: Enrollment[];
  examAttempts: ExamAttempt[];
  purchases: Purchase[];
  statistics: UserStatistics;
}

interface UserDetailProps {
  userId: string;
}

export function UserDetail({ userId }: UserDetailProps) {
  const [data, setData] = useState<UserDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const fetchUserDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/users/${userId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch user details");
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetail();
  }, [userId]);

  const handleRoleChange = async (newRole: string) => {
    if (!data) return;

    try {
      setUpdating(true);

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user role");
      }

      setData({
        ...data,
        user: { ...data.user, role: newRole },
      });

      toast.success("User role updated successfully");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update user role"
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!data) return;

    try {
      setDeleting(true);

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to delete user");
      }

      toast.success("User deleted successfully");
      router.push("/admin/users");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      setDeleting(false);
    }
  };

  const handleAccountStatusChange = async (newStatus: string) => {
    if (!data) return;

    try {
      setUpdating(true);

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ account_status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update account status");
      }

      setData({
        ...data,
        user: { ...data.user, account_status: newStatus },
      });

      toast.success(
        `Account ${newStatus === "active" ? "activated" : newStatus} successfully`
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update account status"
      );
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!data) return;

    try {
      setUpdating(true);

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "reset_password" }),
      });

      if (!response.ok) {
        throw new Error("Failed to send password reset email");
      }

      toast.success("Password reset email sent successfully");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to send password reset email"
      );
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "N/A";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatPrice = (priceCents: number) => {
    if (priceCents === 0) return "Free";
    return `$${(priceCents / 100).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">{error || "User not found"}</p>
        <Button asChild className="mt-4">
          <Link href="/admin/users">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Link>
        </Button>
      </div>
    );
  }

  const { user, enrollments, examAttempts, purchases, statistics } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/users">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Users
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">User Details</h1>
            <p className="text-muted-foreground">
              Detailed information and activity for{" "}
              {user.full_name || user.email}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Select
            value={user.role}
            onValueChange={handleRoleChange}
            disabled={updating}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                disabled={user.role === "admin"}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete User
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete User</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete user "
                  {user.full_name || user.email}"? This action cannot be undone
                  and will remove all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteUser}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Delete User"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* User Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Profile Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback className="text-lg">
                {user.full_name?.charAt(0) ||
                  user.email.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Name:</span>
                  <span>{user.full_name || "Not provided"}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Email:</span>
                  <span>{user.email}</span>
                </div>

                <div className="flex items-center space-x-2">
                  {user.role === "admin" ? (
                    <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Shield className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="font-medium">Role:</span>
                  <Badge
                    variant={
                      user.role === "admin" ? "destructive" : "secondary"
                    }
                  >
                    {user.role}
                  </Badge>
                </div>

                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Joined:</span>
                  <span>{formatDate(user.created_at)}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Status:</span>
                  <Badge
                    variant={
                      user.account_status === "active"
                        ? "default"
                        : user.account_status === "suspended"
                          ? "secondary"
                          : user.account_status === "banned"
                            ? "destructive"
                            : "outline"
                    }
                  >
                    {user.account_status}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Account Actions</span>
          </CardTitle>
          <CardDescription>
            Administrative actions for user account management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Account Status Actions */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Account Status</h4>
              <Select
                value={user.account_status}
                onValueChange={handleAccountStatusChange}
                disabled={updating}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Password Reset */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Password Management</h4>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={updating}
                  >
                    Reset Password
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reset Password</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will send a password reset email to {user.email}. The
                      user will receive instructions to create a new password.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handlePasswordReset}>
                      Send Reset Email
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Quick Actions</h4>
              {user.account_status === "active" ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleAccountStatusChange("suspended")}
                  disabled={updating}
                >
                  Suspend Account
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleAccountStatusChange("active")}
                  disabled={updating}
                >
                  Activate Account
                </Button>
              )}
            </div>

            {/* Danger Zone */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-destructive">
                Danger Zone
              </h4>
              <Button
                variant="outline"
                className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => handleAccountStatusChange("banned")}
                disabled={updating || user.account_status === "banned"}
              >
                Ban Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">
                  {statistics.totalEnrollments}
                </p>
                <p className="text-sm text-muted-foreground">Enrollments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">
                  {statistics.totalExamAttempts}
                </p>
                <p className="text-sm text-muted-foreground">Exam Attempts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Trophy className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{statistics.passedExams}</p>
                <p className="text-sm text-muted-foreground">Passed Exams</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{statistics.successRate}%</p>
                <p className="text-sm text-muted-foreground">Success Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-8 w-8 text-indigo-500" />
              <div>
                <p className="text-2xl font-bold">
                  {statistics.totalPurchases}
                </p>
                <p className="text-sm text-muted-foreground">Purchases</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-emerald-500" />
              <div>
                <p className="text-2xl font-bold">
                  {formatPrice(statistics.totalSpent)}
                </p>
                <p className="text-sm text-muted-foreground">Total Spent</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enrollments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Enrollments ({enrollments.length})</span>
          </CardTitle>
          <CardDescription>
            Certification bundles the user has enrolled in
          </CardDescription>
        </CardHeader>
        <CardContent>
          {enrollments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No enrollments found
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Certification</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Enrolled</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrollments.map(enrollment => (
                  <TableRow key={enrollment.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {enrollment.certifications.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {enrollment.certifications.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {enrollment.certifications.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatPrice(enrollment.certifications.price_cents)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          enrollment.status === "active"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {enrollment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(enrollment.enrolled_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Exam Attempts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Exam Attempts ({examAttempts.length})</span>
          </CardTitle>
          <CardDescription>
            Practice exam history and performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {examAttempts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No exam attempts found
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exam</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {examAttempts.map(attempt => (
                  <TableRow key={attempt.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {attempt.practice_exams.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {attempt.practice_exams.certifications.name}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">
                          {attempt.score || 0}%
                        </span>
                        <span className="text-sm text-muted-foreground">
                          (Pass: {attempt.practice_exams.passing_score}%)
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {attempt.passed ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <Badge
                          variant={attempt.passed ? "default" : "destructive"}
                        >
                          {attempt.passed ? "Passed" : "Failed"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {formatDuration(attempt.time_taken_seconds)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(attempt.started_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Purchase History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Purchase History ({purchases.length})</span>
          </CardTitle>
          <CardDescription>
            Payment transactions and purchase details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {purchases.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No purchases found
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Coupon</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.map(purchase => (
                  <TableRow key={purchase.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{purchase.product_name}</p>
                        <p className="text-sm text-muted-foreground">
                          ID: {purchase.stripe_payment_intent_id.slice(-8)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{purchase.product_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {formatPrice(purchase.final_amount_cents)}
                        </p>
                        {purchase.discount_amount_cents > 0 && (
                          <p className="text-sm text-muted-foreground line-through">
                            {formatPrice(purchase.amount_cents)}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {purchase.status === "completed" ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : purchase.status === "failed" ? (
                          <XCircle className="h-4 w-4 text-red-500" />
                        ) : (
                          <Clock className="h-4 w-4 text-orange-500" />
                        )}
                        <Badge
                          variant={
                            purchase.status === "completed"
                              ? "default"
                              : purchase.status === "failed"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {purchase.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {purchase.coupon_code ? (
                        <Badge variant="outline" className="text-green-600">
                          {purchase.coupon_code}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(purchase.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
