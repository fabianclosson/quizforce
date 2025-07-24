import { createClient, createServerSupabaseClient } from "./supabase";

// Generic database response type
export interface DatabaseResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
}

// Filter types for database operations
export interface DatabaseFilters {
  [key: string]:
    | string
    | number
    | boolean
    | (string | number | boolean)[]
    | null;
}

export interface SelectOptions {
  select?: string;
  filters?: DatabaseFilters;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  offset?: number;
}

// Client-side database operations
export class DatabaseClient {
  private supabase = createClient();

  // Generic select with filters
  async select(
    table: string,
    options?: SelectOptions
  ): Promise<DatabaseResponse<unknown[]>> {
    try {
      let query = this.supabase.from(table).select(options?.select || "*");

      // Apply filters
      if (options?.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            query = query.in(key, value);
          } else if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }

      // Apply ordering
      if (options?.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending ?? true,
        });
      }

      // Apply pagination
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      if (options?.offset) {
        query = query.range(
          options.offset,
          options.offset + (options?.limit || 10) - 1
        );
      }

      const { data, error, count } = await query;

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [], count: count || undefined };
    } catch {
      return { success: false, error: "An unexpected error occurred" };
    }
  }

  // Get single record by ID
  async getById(
    table: string,
    id: string,
    select?: string
  ): Promise<DatabaseResponse<unknown>> {
    try {
      const { data, error } = await this.supabase
        .from(table)
        .select(select || "*")
        .eq("id", id)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch {
      return { success: false, error: "An unexpected error occurred" };
    }
  }

  // Insert single record
  async insertOne(
    table: string,
    data: Record<string, unknown>
  ): Promise<DatabaseResponse<unknown>> {
    try {
      const { data: result, error } = await this.supabase
        .from(table)
        .insert(data)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: result };
    } catch {
      return { success: false, error: "An unexpected error occurred" };
    }
  }

  // Insert multiple records
  async insertMany(
    table: string,
    data: Record<string, unknown>[]
  ): Promise<DatabaseResponse<unknown[]>> {
    try {
      const { data: result, error } = await this.supabase
        .from(table)
        .insert(data)
        .select();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: result || [] };
    } catch {
      return { success: false, error: "An unexpected error occurred" };
    }
  }

  // Update record by ID
  async update(
    table: string,
    id: string,
    data: Record<string, unknown>
  ): Promise<DatabaseResponse<unknown>> {
    try {
      const { data: result, error } = await this.supabase
        .from(table)
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: result };
    } catch {
      return { success: false, error: "An unexpected error occurred" };
    }
  }

  // Delete record by ID
  async delete(table: string, id: string): Promise<DatabaseResponse<boolean>> {
    try {
      const { error } = await this.supabase.from(table).delete().eq("id", id);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: true };
    } catch {
      return { success: false, error: "An unexpected error occurred" };
    }
  }

  // Count records with optional filters
  async count(
    table: string,
    filters?: DatabaseFilters
  ): Promise<DatabaseResponse<number>> {
    try {
      let query = this.supabase
        .from(table)
        .select("*", { count: "exact", head: true });

      // Apply filters
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            query = query.in(key, value);
          } else if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }

      const { count, error } = await query;

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: count || 0 };
    } catch {
      return { success: false, error: "An unexpected error occurred" };
    }
  }
}

// Server-side database operations (for Server Components and API routes)
export class ServerDatabaseClient {
  private async getSupabase() {
    return await createServerSupabaseClient();
  }

  // Generic select with filters (server-side)
  async select(
    table: string,
    options?: SelectOptions
  ): Promise<DatabaseResponse<unknown[]>> {
    try {
      const supabase = await this.getSupabase();
      let query = supabase.from(table).select(options?.select || "*");

      // Apply filters
      if (options?.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            query = query.in(key, value);
          } else if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }

      // Apply ordering
      if (options?.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending ?? true,
        });
      }

      // Apply pagination
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      if (options?.offset) {
        query = query.range(
          options.offset,
          options.offset + (options?.limit || 10) - 1
        );
      }

      const { data, error, count } = await query;

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [], count: count || undefined };
    } catch {
      return { success: false, error: "An unexpected error occurred" };
    }
  }
}

// Create instances for easy use
export const db = new DatabaseClient();
export const serverDb = new ServerDatabaseClient();

// Helper function to handle database errors consistently
export const handleDatabaseError = (error: unknown): string => {
  if (typeof error === "object" && error !== null) {
    const err = error as { code?: string; message?: string };
    if (err.code === "PGRST116") {
      return "Record not found";
    }
    if (err.code === "23505") {
      return "A record with this information already exists";
    }
    if (err.code === "23503") {
      return "Cannot delete record - it is referenced by other data";
    }
    return err.message || "An unexpected database error occurred";
  }
  return "An unexpected database error occurred";
};
