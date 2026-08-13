// Lightweight custom Supabase DB Client wrapper supporting direct REST RPC & table operations

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ivklipmqwrzzgeabmndd.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

export const supabase = {
  from(table: string) {
    return {
      select: async (query: string = '*') => {
        try {
          const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=${encodeURIComponent(query)}`, {
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
          });
          const data = await res.json();
          return { data: Array.isArray(data) ? data : [], error: null };
        } catch (error) {
          return { data: [], error };
        }
      },
      insert: async (records: any[]) => {
        try {
          const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            },
            body: JSON.stringify(records)
          });
          const data = await res.json();
          return { data, error: null };
        } catch (error) {
          return { data: null, error };
        }
      },
      update: (updates: any) => ({
        eq: async (column: string, value: any) => {
          try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${column}=eq.${encodeURIComponent(value)}`, {
              method: 'PATCH',
              headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
              },
              body: JSON.stringify(updates)
            });
            const data = await res.json();
            return { data, error: null };
          } catch (error) {
            return { data: null, error };
          }
        }
      })
    };
  },
  rpc: async (fnName: string, params: any) => {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fnName}`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });
      const data = await res.json();
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
};
