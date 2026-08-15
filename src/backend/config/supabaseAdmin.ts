const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ivklipmqwrzzgeabmndd.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2a2xpcG1xd3J6emdlYWJtbmRkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTkyMTc2MSwiZXhwIjoyMTAxNDk3NzYxfQ.zFQvpaMjZWMKdazYgKCpIFkx534hRfSS06sTNpJ3dMc';

// Light-weight Server-Side DB REST Helper
export const supabaseAdmin = {
  from(table: string) {
    return {
      select: async (query: string = '*') => {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=${encodeURIComponent(query)}`, {
          headers: {
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json'
          },
          cache: 'no-store'
        });
        const data = await res.json();
        return { data: Array.isArray(data) ? data : [], error: res.ok ? null : data };
      },
      insert: async (records: any[]) => {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(records)
        });
        const data = await res.json();
        return { data, error: res.ok ? null : data };
      },
      update: (payload: any) => ({
        eq: async (column: string, value: any) => {
          const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${column}=eq.${encodeURIComponent(value)}`, {
            method: 'PATCH',
            headers: {
              'apikey': SUPABASE_SERVICE_ROLE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            },
            body: JSON.stringify(payload)
          });
          const data = await res.json();
          return { data, error: res.ok ? null : data };
        }
      })
    };
  }
};
