// Local DB Persistence Layer using localStorage & sync for persistent offline & online DB operations

export function getLocalDB<T>(key: string, defaultData: T[]): T[] {
  if (typeof window === 'undefined') return defaultData;
  try {
    const data = localStorage.getItem(`aarfin_db_${key}`);
    return data ? JSON.parse(data) : defaultData;
  } catch (e) {
    return defaultData;
  }
}

export function setLocalDB<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`aarfin_db_${key}`, JSON.stringify(data));
  } catch (e) {
    console.error("Local DB Store Error:", e);
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ivklipmqwrzzgeabmndd.supabase.co';
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2a2xpcG1xd3J6emdlYWJtbmRkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTkyMTc2MSwiZXhwIjoyMTAxNDk3NzYxfQ.zFQvpaMjZWMKdazYgKCpIFkx534hRfSS06sTNpJ3dMc";

export const supabase = {
  from(table: string) {
    return {
      select: async (query: string = '*') => {
        try {
          const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=${encodeURIComponent(query)}`, {
            headers: {
              'apikey': SERVICE_ROLE_KEY,
              'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
            }
          });
          if (!res.ok) {
            const localData = getLocalDB(table, []);
            return { data: localData, error: null };
          }
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setLocalDB(table, data);
          }
          const finalData = Array.isArray(data) ? data : getLocalDB(table, []);
          return { data: finalData, error: null };
        } catch (error) {
          const localData = getLocalDB(table, []);
          return { data: localData, error: null };
        }
      },
      insert: async (records: any[]) => {
        const existing = getLocalDB(table, []);
        const formattedRecords = records.map((r) => ({
          id: r.id || `id_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          created_at: new Date().toISOString(),
          ...r
        }));
        const updated = [...formattedRecords, ...existing];
        setLocalDB(table, updated);

        // Background fetch with sanitized keys matching standard DB schema
        try {
          const cleanRecords = records.map((r) => {
            const copy = { ...r };
            delete copy.id;
            // Clean invalid non-UUID strings before DB insert
            if (copy.batch_id && (typeof copy.batch_id !== 'string' || !copy.batch_id.includes('-'))) {
              delete copy.batch_id;
            }
            if (copy.group_id && (typeof copy.group_id !== 'string' || !copy.group_id.includes('-'))) {
              delete copy.group_id;
            }
            return copy;
          });

          fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
            method: 'POST',
            headers: {
              'apikey': SERVICE_ROLE_KEY,
              'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify(cleanRecords)
          }).then((res) => {
            if (!res.ok) {
              res.text().then((txt) => console.warn("Supabase background sync notice:", txt));
            }
          }).catch(() => {});
        } catch (err) {}

        return { data: formattedRecords, error: null };
      },
      update: (updates: any) => ({
        eq: async (column: string, value: any) => {
          const existing: any[] = getLocalDB(table, []);
          const updated = existing.map((item) => {
            if (item[column] === value || item.id === value) {
              return { ...item, ...updates, updated_at: new Date().toISOString() };
            }
            return item;
          });
          setLocalDB(table, updated);

          try {
            fetch(`${SUPABASE_URL}/rest/v1/${table}?${column}=eq.${encodeURIComponent(value)}`, {
              method: 'PATCH',
              headers: {
                'apikey': SERVICE_ROLE_KEY,
                'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
              },
              body: JSON.stringify(updates)
            }).catch(() => {});
          } catch (err) {}

          return { data: updated, error: null };
        }
      })
    };
  },
  rpc: async (fnName: string, params: any) => {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fnName}`, {
        method: 'POST',
        headers: {
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
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
