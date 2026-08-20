const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const lines = env.split('\n');
let key = '';
for (const l of lines) {
  if (l.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY')) {
    key = l.split('=')[1].replace(/"/g, '').trim();
  }
}

async function test() {
  const res = await fetch('https://ivklipmqwrzzgeabmndd.supabase.co/rest/v1/admins?select=*', {
    headers: {
      'apikey': key,
      'Authorization': 'Bearer ' + key
    }
  });
  const data = await res.json();
  console.log('ADMINS:', data);
}

test();
