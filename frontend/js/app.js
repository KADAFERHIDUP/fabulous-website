// Fabulous: satu objek 3D yang berpindah tempat mengikuti scroll (hero → fitur → warna), lalu menghilang.
import * as api from './api.js';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

const SHOP_PRICE = 1299000;
const SHOP = { whatsapp: '6282276078880' };
// data bawaan; kalau backend aktif, harga, stok, dan daftar warna diambil dari database
let COLORS = [
  { id: 2, slug: 'teal-laut', name: 'Teal Laut', hex: '#344d52' },
  { id: 1, slug: 'cokelat-kopi', name: 'Cokelat Kopi', hex: '#4e3b37' },
  { id: 3, slug: 'biru-denim', name: 'Biru Denim', hex: '#5e6c79' },
  { id: 4, slug: 'hijau-hutan', name: 'Hijau Hutan', hex: '#0c221f' },
  { id: 5, slug: 'hijau-sage', name: 'Hijau Sage', hex: '#4d7764' },
  { id: 6, slug: 'biru-malam', name: 'Biru Malam', hex: '#0d2b3f' },
  { id: 7, slug: 'hitam-kulit', name: 'Hitam Kulit', hex: '#3a3b3f' },
  { id: 8, slug: 'emas-zaitun', name: 'Emas Zaitun', hex: '#aea572' },
].map(c => ({ ...c, price: SHOP_PRICE, stock: null }));
const rp = n => 'Rp ' + n.toLocaleString('id-ID');
const img = c => `img/case-${c.id >= 1 && c.id <= 8 ? c.id : 2}.png`;
const wa = c => `https://wa.me/${SHOP.whatsapp}?text=${encodeURIComponent(`Halo Fabulous, saya mau pesan ${MODELS[model]} warna ${c.name} (${rp(c.price)}). Apakah stoknya ada?`)}`;
const stills = new Map(); // render HD per warna (hex → data URL)
const picture = c => stills.get(c.hex) || img(c);
function makeStills() {
  if (!pods) return;
  COLORS.forEach(c => { if (!stills.has(c.hex)) stills.set(c.hex, pods.still(c.hex)); });
  $$('.item img').forEach((im, k) => { if (COLORS[k]) { im.src = picture(COLORS[k]); im.classList.add('render'); } });
}
const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

let pods = null;
let model = 'pods';
const MODELS = { pods: 'Fabulous Pods', mini: 'Fabulous Mini' };
let color = COLORS[0];

// ---------------------------------------------------------------- 3D
async function start3D() {
  try {
    const { createPods } = await import('./pods3d.js');
    pods = await createPods($('#stage'), { color: color.hex });
    document.body.classList.add('has-3d');
    // ganti foto kecil di katalog dengan render HD dari model 3D (satu per warna, latar transparan)
    setTimeout(makeStills, 600);
  } catch (e) {
    document.body.classList.add('no-3d');
    console.info('3D dimatikan:', e.message);
  }
}

// posisi dan ukuran objek dihitung dari kotak "spot" tiap bagian, jadi selalu pas dengan tata letak
const WORLD_H = 2 * Math.tan(15 * Math.PI / 180) * 9; // tinggi layar dalam satuan 3D (fov 30, jarak 9)
const MODEL_W = 3.4;
function place(spot, widthPx) {
  const r = spot.getBoundingClientRect();
  const s = widthPx / (MODEL_W * innerHeight / WORLD_H);
  return { x: (r.left + r.width / 2 - innerWidth / 2) / innerWidth, y: -(r.top + r.height / 2 - innerHeight / 2) / innerHeight, s };
}
const STEP_POSE = [
  { ry: 0.6, rx: 0.16, lid: 0, lift: 0, xray: 0, glow: 0 },       // desain: case tertutup rapat, sedikit miring
  { ry: -0.35, rx: 0.3, lid: 1, lift: 1, xray: 1, glow: 0 },      // akustik: tutup terbuka, earbuds terangkat, case tembus pandang
  { ry: 0.2, rx: 0.12, lid: 0, lift: 0, xray: 0, glow: 1 },       // baterai: tertutup, lampu hijau berdenyut
];

let step = -1;
function storyProgress() {
  const st = $('#fitur'), r = st.getBoundingClientRect();
  const len = st.offsetHeight - innerHeight;
  return Math.min(1, Math.max(0, -r.top / len));
}
function setStep(i) {
  if (i === step) return;
  step = i;
  $$('.card').forEach((c, k) => { c.classList.toggle('active', k === i); c.classList.toggle('done', k < i); });
  $$('.node').forEach((n, k) => { n.classList.toggle('active', k === i); n.classList.toggle('done', k < i); n.classList.toggle('next', k === i + 1); });
  const fb = $('#story-fallback');
  fb.src = i === 0 ? img(color) : i === 1 ? 'img/buds-closeup.png' : 'img/case-white-buds.png';
}
function layoutNodes() {
  const track = $('#track'), t = track.getBoundingClientRect();
  $$('.card').forEach((c, k) => {
    const r = c.getBoundingClientRect();
    $(`.node[data-node="${k}"]`).style.top = `${r.top + r.height / 2 - t.top}px`;
  });
}

function tick() {
  requestAnimationFrame(tick);
  const vh = innerHeight, mobile = innerWidth <= 960;
  const story = $('#fitur'), colors = $('#warna');
  const sr = story.getBoundingClientRect(), cr = colors.getBoundingClientRect();
  const p = storyProgress();
  const i = p < 0.34 ? 0 : p < 0.67 ? 1 : 2;
  setStep(i);
  $('#track-fill').style.transform = `scaleY(${sr.top > 0 ? 0 : Math.min(1, p * 1.05)})`;
  if (!pods) return;

  let target;
  if (sr.top > vh * 0.45) {
    // hero: objek besar di tengah, berputar pelan
    const spot = $('#hero-spot').getBoundingClientRect();
    target = { ...place($('#hero-spot'), Math.min(innerWidth * (mobile ? 0.5 : 0.25), spot.height * 0.8, 400)), ry: 0.4, rx: 0.2, lid: 1, lift: 0, xray: 0, glow: 0, op: 1, spin: 1 };
  } else if (sr.bottom > vh * 0.55) {
    const spot = $('#story-spot').getBoundingClientRect();
    const pose = STEP_POSE[i], at = place($('#story-spot'), Math.min(spot.width * 0.8, spot.height * (mobile ? 1.15 : 1.05), 460));
    // earbuds yang terangkat membuat objek lebih tinggi, jadi diperkecil sedikit supaya tidak menabrak judul
    target = { ...at, s: at.s * (1 - pose.lift * (mobile ? 0.3 : 0.12)), y: at.y - pose.lift * (mobile ? 0.05 : 0.02), ...pose, op: 1, spin: 0 };
  } else if (cr.bottom > vh * 0.45) {
    const spot = $('#colors-spot').getBoundingClientRect();
    target = { ...place($('#colors-spot'), Math.min(spot.width * 0.78, (mobile ? 0.6 : 0.32) * innerWidth, 440)), ry: -0.45, rx: 0.2, lid: model === 'mini' ? 1 : 0.75, lift: 0, xray: 0, glow: 0, op: 1, spin: 0 };
  } else {
    target = { op: 0, spin: 0 };
  }
  pods.set(target);
}

// ---------------------------------------------------------------- warna dan katalog
function setColor(c, from3D = true) {
  color = c;
  $$('.swatch').forEach(s => s.setAttribute('aria-checked', String(s.dataset.slug === c.slug)));
  $('#pick-name').textContent = c.name;
  $$('.pick-price [data-price]').forEach(el => { el.textContent = rp(c.price); });
  const oc = $('#order-color');
  if (api.online()) { oc.removeAttribute('href'); oc.setAttribute('role', 'button'); oc.dataset.order = c.slug; oc.textContent = c.stock === 0 ? 'Stok habis' : 'Pesan warna ini'; }
  else oc.href = wa(c);
  $('#color-fallback').src = img(c);
  $('#color-fallback').alt = `Case Fabulous Pods warna ${c.name}`;
  $('#hero-spot img').src = img(c);
  if (step === 0) $('#story-fallback').src = img(c);
  if (from3D && pods) pods.color(c.hex);
}
function setupModels() {
  const box = $('#models');
  box.addEventListener('click', async e => {
    const b = e.target.closest('[data-model]');
    if (!b || b.dataset.model === model) return;
    model = b.dataset.model;
    $$('[data-model]', box).forEach(x => x.setAttribute('aria-checked', String(x === b)));
    $('#model-name').textContent = MODELS[model];
    setColor(color, false);
    if (pods) {
      box.setAttribute('aria-busy', 'true');
      try { await pods.model(model); } finally { box.removeAttribute('aria-busy'); }
    }
  });
}
function setupColors() {
  const box = $('#swatches');
  box.innerHTML = COLORS.map(c => `<button type="button" class="swatch" role="radio" data-slug="${c.slug}" style="--c:${c.hex}" aria-label="${c.name}" aria-checked="false"></button>`).join('');
  if (box.dataset.ready) return finishColors();
  box.dataset.ready = '1';
  box.addEventListener('click', e => { const b = e.target.closest('.swatch'); if (b) setColor(COLORS.find(c => c.slug === b.dataset.slug)); });
  box.addEventListener('keydown', e => {
    if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(e.key)) return;
    e.preventDefault();
    const k = COLORS.indexOf(color), n = COLORS[(k + (e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : COLORS.length - 1)) % COLORS.length];
    setColor(n); $(`.swatch[data-slug="${n.slug}"]`).focus();
  });
  finishColors();
}
function finishColors() {
  renderShop();
  const from = Math.min(...COLORS.map(c => c.price));
  $$('[data-price]').forEach(el => { el.textContent = rp(from); });
  setColor(color, !!pods);
}

function renderShop() {
  const on = api.online();
  $('#shop-grid').innerHTML = COLORS.map(c => {
    const out = on && c.stock === 0;
    const btn = on
      ? `<button type="button" class="btn btn-light" data-order="${c.slug}" ${out ? 'disabled' : ''}>${out ? 'Habis' : 'Pesan'}</button>`
      : `<a class="btn btn-light" href="${wa(c)}" target="_blank" rel="noopener">Pesan</a>`;
    const note = on ? `<span class="stock-note${out ? ' out' : ''}">${out ? 'Stok habis' : c.stock <= 3 ? `Sisa ${c.stock} unit` : 'Tersedia'}</span>` : '';
    return `<li class="item">
      <img src="${picture(c)}" alt="Case Fabulous Pods warna ${c.name} dengan earbuds putih" width="224" height="195" loading="lazy"${stills.has(c.hex) ? ' class="render"' : ''}>
      <h3><i style="--c:${c.hex}"></i>${c.name}</h3>${note}
      <div class="item-row"><span>${rp(c.price)}</span>${btn}</div>
    </li>`;
  }).join('');
}

// ---------------------------------------------------------------- pesanan ke backend
function setupOrder() {
  const dlg = $('#order-sheet'), form = $('#order-form'), sel = $('#order-color-select');
  const current = () => COLORS.find(c => String(c.pid) === sel.value) || COLORS[0];
  const refresh = () => {
    const c = current(), q = Math.max(1, Math.min(5, Number(form.qty.value) || 1));
    $('#order-img').src = picture(c); $('#order-img').alt = `Fabulous Pods ${c.name}`;
    $('#order-total').textContent = rp(c.price * q);
    const st = $('#order-stock');
    st.textContent = c.stock === 0 ? 'Stok habis' : c.stock <= 3 ? `Sisa ${c.stock} unit` : `Stok tersedia (${c.stock} unit)`;
    st.classList.toggle('low', c.stock <= 3);
    form.qty.max = Math.min(5, c.stock || 1);
    $('#order-address').hidden = form.delivery.value !== 'antar';
    $('#order-submit').disabled = c.stock === 0;
  };
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-order]');
    if (b && api.online()) {
      e.preventDefault();
      const c = COLORS.find(x => x.slug === b.dataset.order) || color;
      sel.innerHTML = COLORS.map(x => `<option value="${x.pid}" ${x.stock === 0 ? 'disabled' : ''}>${x.name}${x.stock === 0 ? ' (habis)' : ''}</option>`).join('');
      sel.value = String(c.pid);
      form.hidden = false; $('#order-done').hidden = true; $('#order-msg').textContent = '';
      refresh();
      dlg.showModal();
    }
    if (e.target.closest('[data-close]')) dlg.close();
  });
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  form.addEventListener('input', refresh);
  form.addEventListener('change', refresh);
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const msg = $('#order-msg'), btn = $('#order-submit');
    $$('.field', form).forEach(f => f.classList.remove('bad'));
    const data = Object.fromEntries(new FormData(form));
    if (model !== 'pods') data.note = `Model: ${MODELS[model]}.` + (data.note ? ' ' + data.note : '');
    btn.disabled = true; btn.textContent = 'Mengirim…'; msg.className = 'form-msg'; msg.textContent = '';
    try {
      const r = await api.order(data);
      $('#done-code').textContent = r.code;
      $('#done-text').textContent = `${MODELS[model]} ${r.product} × ${r.qty}, total ${rp(r.total)}. Simpan kode ini, lalu konfirmasi lewat WhatsApp supaya pesananmu cepat diproses.`;
      $('#done-wa').href = r.whatsapp;
      form.hidden = true; $('#order-done').hidden = false;
      form.reset();
      await loadProducts(); renderShop(); setColor(color, false);
    } catch (err) {
      msg.className = 'form-msg err'; msg.textContent = err.message;
      Object.keys(err.fields || {}).forEach(k => form[k]?.closest('.field')?.classList.add('bad'));
      if (err.status === 409) { await loadProducts(); refresh(); renderShop(); }
    } finally { btn.textContent = 'Kirim pesanan'; refresh(); }
  });
}
async function loadProducts() {
  try {
    const list = await api.products();
    if (!list.length) return;
    COLORS = list.map(p => {
      const known = COLORS.find(c => c.slug === p.slug || c.hex === p.hex);
      return { id: known ? known.id : 0, slug: p.slug, pid: p.id, name: p.name, hex: p.hex, price: p.price, stock: p.stock };
    });
    color = COLORS.find(c => c.hex === color.hex) || COLORS[0];
  } catch { /* tetap pakai data bawaan */ }
}

// ---------------------------------------------------------------- header, menu, muncul saat terlihat
function setupChrome() {
  const header = $('#header');
  const onScroll = () => header.classList.toggle('scrolled', scrollY > 20);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const nav = $('#nav'), btn = $('#nav-toggle');
  const open = v => { nav.classList.toggle('open', v); btn.setAttribute('aria-expanded', String(v)); btn.setAttribute('aria-label', v ? 'Tutup menu' : 'Buka menu'); };
  btn.addEventListener('click', () => open(!nav.classList.contains('open')));
  nav.addEventListener('click', e => { if (e.target.closest('a')) open(false); });
  addEventListener('keydown', e => { if (e.key === 'Escape') open(false); });
  const links = $$('.nav a');
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) links.forEach(a => a.setAttribute('aria-current', String(a.hash === '#' + en.target.id))); }), { rootMargin: '-45% 0px -50% 0px' });
  ['fitur', 'warna', 'spesifikasi', 'beli'].forEach(id => io.observe($('#' + id)));
  const rv = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); rv.unobserve(en.target); } }), { rootMargin: '0px 0px -10% 0px' });
  $$('.reveal').forEach(el => (calm() || el.closest('.hero')) ? el.classList.add('in') : rv.observe(el));
  $('#f-wa').href = `https://wa.me/${SHOP.whatsapp}`;
  $('#year').textContent = new Date().getFullYear();
}

setupChrome();
setupModels();
setupColors();
setStep(0);
layoutNodes();
addEventListener('resize', layoutNodes);
new ResizeObserver(layoutNodes).observe($('#cards'));
setupOrder();
start3D().then(() => requestAnimationFrame(tick));
// sambungkan ke backend di belakang layar; tanpa backend semuanya tetap jalan lewat WhatsApp
api.connect().then(async base => {
  if (!base) return;
  document.body.classList.add('online');
  await loadProducts();
  setupColors();
  makeStills();
});
