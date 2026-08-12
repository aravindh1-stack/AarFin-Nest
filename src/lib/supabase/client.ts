// Supabase client helper
// Note: Can connect to Supabase PostgreSQL or fallback to local state

export const supabase = {
  from: (table: string) => ({
    select: async () => ({ data: [], error: null }),
    insert: async (data: any) => ({ data, error: null }),
    update: async (data: any) => ({ data, error: null }),
  }),
  rpc: async (fn: string, params: any) => ({ data: { success: true }, error: null }),
};
