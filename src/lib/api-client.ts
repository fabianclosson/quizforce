import { createBrowserClient } from "@supabase/ssr";
import { config } from "./config";

async function getSupabaseAccessToken() {
  const supabase = createBrowserClient(
    config.supabase.url,
    config.supabase.anonKey
  );
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error("Error getting Supabase session:", error);
    return null;
  }

  return data.session?.access_token || null;
}

interface ApiClientOptions extends RequestInit {
  // We can add custom options here in the future
}

async function apiClient<T>(
  url: string,
  options: ApiClientOptions = {}
): Promise<T> {
  const token = await getSupabaseAccessToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { error: "An unexpected error occurred." };
    }
    throw new Error(
      errorData.error || `Request failed with status ${response.status}`
    );
  }

  // Handle cases with no content
  const contentType = response.headers.get("content-type");
  if (
    response.status === 204 ||
    !contentType ||
    !contentType.includes("application/json")
  ) {
    return {} as T;
  }

  return response.json();
}

export default apiClient;
