"use client";

import React from "react";
import Link from "next/link";
import { Download } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useDownloadReceipt,
  enrollmentUtils,
  ExtendedEnrollmentHistoryItem,
} from "@/hooks/use-enrollment-history";

interface EnrollmentListProps {
  enrollments: ExtendedEnrollmentHistoryItem[];
}

export function EnrollmentList({ enrollments }: EnrollmentListProps) {
  const downloadReceipt = useDownloadReceipt();

  const handleDownloadReceipt = async (paymentId: string) => {
    try {
      await downloadReceipt.mutateAsync(paymentId);
    } catch (error) {
      console.error("Failed to download receipt:", error);
    }
  };

  const formatPrice = (item: ExtendedEnrollmentHistoryItem): string => {
    if (item.payment) {
      return enrollmentUtils.formatCurrency(
        item.payment.final_amount_cents,
        item.payment.currency
      );
    }
    return "Free";
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
            <TableHead className="font-semibold text-gray-900 dark:text-gray-100">
              Enrolled Date
            </TableHead>
            <TableHead className="font-semibold text-gray-900 dark:text-gray-100">
              Certification Bundle
            </TableHead>
            <TableHead className="font-semibold text-gray-900 dark:text-gray-100">
              Status
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {enrollments.map(item => (
            <TableRow
              key={item.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                {enrollmentUtils.formatDate(item.enrolled_at)}
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <Link
                    href={`/catalog/certifications/${item.certification.id}`}
                    className="font-medium hover:underline text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                  >
                    {item.certification.name}
                  </Link>
                  {item.package && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Part of: {item.package.name}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={enrollmentUtils.getStatusColor(item.access_status)}
                >
                  {enrollmentUtils.getStatusLabel(item.access_status)}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
