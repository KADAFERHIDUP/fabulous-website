/* Penghubung ke backend CodeIgniter (opsional).
 * Kalau halaman dibuka dari server backend, harga/stok diambil dari database dan pesanan disimpan.
 * Kalau tidak ada backend (GitHub Pages, Live Server), website tetap jalan dan pesanan lewat WhatsApp.
 * Untuk memakai backend di alamat lain, isi window.FABULOUS_API = 'https://domain-kamu/api' sebelum app.js. */
let base = null;

async function probe(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 2500);
  try {
    const r = await fetch(url.replace(/\/$/, '') + '/health', { signal: ctrl.signal, cache: 'no-store' });
    if (!r.ok) return false;
    const j = await r.json();
    return j && j.ok === true;
  } catch { return false; } finally { clearTimeout(t); }
}

export async function connect() {
  if (base !== null) return base;
  const want = window.FABULOUS_API ?? 'auto';
  const auto = new URL('api', location.href).href.replace(/\/$/, '');
  if (want === 'auto') base = location.protocol.startsWith('http') && await probe(auto) ? auto : '';
  else base = want && await probe(want) ? want.replace(/\/$/, '') : '';
  return base;
}
export const online = () => !!base;

async function call(path, opts = {}) {
  const r = await fetch(base + path, { headers: { Accept: 'application/json', ...(opts.body ? { 'Content-Type': 'application/json' } : {}) }, ...opts });
  let j = null;
  try { j = await r.json(); } catch { /* bukan JSON */ }
  if (!r.ok) {
    const e = new Error((j && j.message) || `Server menjawab ${r.status}`);
    e.status = r.status; e.fields = (j && j.errors) || {};
    throw e;
  }
  return j;
}
export const products = async () => (await call('/products')).data;
export const order = data => call('/orders', { method: 'POST', body: JSON.stringify(data) });
