const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ncuyrsorvwguqfdnhbza.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jdXlyc29ydndndXFmZG5oYnphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2MDI1NjQsImV4cCI6MjA5MzE3ODU2NH0.EgVwmkXonCyhPBN8pCq_qMtJ2ZdEiESTFEJvo0Wxpfw';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';

function getAuthHeaders() {
  const key = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  };
}

async function supabaseRequest(path, init = {}) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    ...init,
    headers: {
      ...getAuthHeaders(),
      ...(init.headers || {}),
    },
  });

  const text = await response.text();
  let body = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!response.ok) {
    throw new Error(`Supabase ${init.method || 'GET'} ${path} failed (${response.status}): ${typeof body === 'string' ? body : JSON.stringify(body)}`);
  }

  return { response, body };
}

module.exports = async function handler(req, res) {
  const table = 'keepalive_events';
  const slug = `keepalive-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const payload = {
    slug,
    created_at: new Date().toISOString(),
  };

  try {
    const inserted = await supabaseRequest(`/${table}`, {
      method: 'POST',
      body: JSON.stringify([payload]),
    });

    const rows = Array.isArray(inserted.body) ? inserted.body : [];
    const insertedId = rows[0]?.id ?? null;

    const selected = await supabaseRequest(`/${table}?select=id,slug,created_at&slug=eq.${encodeURIComponent(slug)}`, {
      method: 'GET',
    });

    const foundRows = Array.isArray(selected.body) ? selected.body : [];

    if (insertedId) {
      await supabaseRequest(`/${table}?id=eq.${insertedId}`, {
        method: 'DELETE',
      });
    }

    res.status(200).json({
      ok: true,
      table,
      insertedId,
      rowsFound: foundRows.length,
      deleted: insertedId !== null,
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('keepalive error', error);
    res.status(500).json({ ok: false, error: error.message });
  }
};
