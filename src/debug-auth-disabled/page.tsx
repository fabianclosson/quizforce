"use client";

import { createClient } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

export default function DebugAuthPage() {
  const handleTestAuth = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getSession();

      console.log("🔍 Raw session data:", data);
      console.log("🔍 Raw session error:", error);

      setRawSession(data);
      if (error) {
        setSessionError(error.message);
      }
    } catch (err) {
      console.error("🔍 Error getting raw session:", err);
      setSessionError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSessionLoading(false);
    }
  };

  const [rawSession, setRawSession] = useState<{
    session: Session | null;
  } | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);

  useEffect(() => {
    const checkRawSession = async () => {
      try {
        console.log("🔍 Checking raw session...");
        const supabase = createClient();
        const { data, error } = await supabase.auth.getSession();

        console.log("🔍 Raw session data:", data);
        console.log("🔍 Raw session error:", error);

        setRawSession(data);
        if (error) {
          setSessionError(error.message);
        }
      } catch (err) {
        console.error("🔍 Error getting raw session:", err);
        setSessionError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setSessionLoading(false);
      }
    };

    checkRawSession();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Auth Debug</h1>

      <div className="space-y-6">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Auth Context State</h2>
          <p>
            <strong>authLoading:</strong> {authLoading.toString()}
          </p>
          <p>
            <strong>user:</strong> {user ? user.id : "null"}
          </p>
          <p>
            <strong>userRole:</strong> {userRole || "null"}
          </p>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Raw Session Check</h2>
          <p>
            <strong>sessionLoading:</strong> {sessionLoading.toString()}
          </p>
          {sessionError && (
            <p className="text-red-600">
              <strong>Error:</strong> {sessionError}
            </p>
          )}
          {rawSession && (
            <div>
              <p>
                <strong>Session user:</strong>{" "}
                {rawSession.session?.user?.id || "null"}
              </p>
              <p>
                <strong>Session exists:</strong> {!!rawSession.session}
              </p>
            </div>
          )}
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Expected Behavior</h2>
          <p>authLoading should be false after initial check.</p>
          <p>If no user, should show Sign In Required.</p>
          <p>If user exists, should show practice exams.</p>
        </div>
      </div>
    </div>
  );
}
