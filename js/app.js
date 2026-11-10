// Fabulous: satu objek 3D yang berpindah tempat mengikuti scroll (hero → fitur → warna), lalu menghilang.
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

const SHOP = { whatsapp: '6282276078880', price: 1299000 };
const COLORS = [
  { id: 2, name: 'Teal Laut', hex: '#344d52' },
  { id: 1, name: 'Cokelat Kopi', hex: '#4e3b37' },
  { id: 3, name: 'Biru Denim', hex: '#5e6c79' },
  { id: 4, name: 'Hijau Hutan', hex: '#0c221f' },
  { id: 5, name: 'Hijau Sage', hex: '#4d7764' },
  { id: 6, name: 'Biru Malam', hex: '#0d2b3f' },
  { id: 7, name: 'Hitam Kulit', hex: '#3a3b3f' },
  { id: 8, name: 'Emas Zaitun', hex: '#aea572' },
];
const rp = n => 'Rp ' + n.toLocaleString('id-ID');
const img = c => `img/case-${c.id}.png`;
const wa = c => `https://wa.me/${SHOP.whatsapp}?text=${encodeURIComponent(`Halo Fabulous, saya mau pesan Fabulous Pods warna ${c.name} (${rp(SHOP.price)}). Apakah stoknya ada?`)}`;
const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

let pods = null;
let color = COLORS[0];

// ---------------------------------------------------------------- 3D
async function start3D() {
  try {
    const { createPods } = await import('./pods3d.js');
    pods = createPods($('#stage'), { color: color.hex });
    document.body.classList.add('has-3d');
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
  { ry: 0.55, rx: 0.14, lid: 0, lift: 0, xray: 0, glow: 0 },      // desain: tertutup, sedikit miring
  { ry: -0.3, rx: 0.32, lid: 1, lift: 1, xray: 1, glow: 0 },      // akustik: tutup terbuka, earbuds naik, tembus pandang
  { ry: 0.25, rx: 0.1, lid: 0.18, lift: 0, xray: 0, glow: 1 },    // baterai: lampu hijau mengisi
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
    target = { ...place($('#hero-spot'), Math.min(innerWidth * (mobile ? 0.62 : 0.34), spot.height * 1.25, 520)), ry: 0.4, rx: 0.18, lid: 0, lift: 0, xray: 0, glow: 0, op: 1, spin: 1 };
  } else if (sr.bottom > vh * 0.55) {
    const spot = $('#story-spot').getBoundingClientRect();
    const pose = STEP_POSE[i], at = place($('#story-spot'), Math.min(spot.width * 0.8, spot.height * (mobile ? 1.15 : 1.05), 460));
    // earbuds yang terangkat membuat objek lebih tinggi, jadi diperkecil sedikit supaya tidak menabrak judul
    target = { ...at, s: at.s * (1 - pose.lift * (mobile ? 0.3 : 0.12)), y: at.y - pose.lift * (mobile ? 0.05 : 0.02), ...pose, op: 1, spin: 0 };
  } else if (cr.bottom > vh * 0.45) {
    const spot = $('#colors-spot').getBoundingClientRect();
    target = { ...place($('#colors-spot'), Math.min(spot.width * 0.85, (mobile ? 0.62 : 0.4) * innerWidth, 500)), ry: -0.45, rx: 0.16, lid: 0, lift: 0, xray: 0, glow: 0, op: 1, spin: 0 };
  } else {
    target = { op: 0, spin: 0 };
  }
  pods.set(target);
}

// ---------------------------------------------------------------- warna dan katalog
function setColor(c, from3D = true) {
  color = c;
  $$('.swatch').forEach(s => s.setAttribute('aria-checked', String(Number(s.dataset.id) === c.id)));
  $('#pick-name').textContent = c.name;
  $('#order-color').href = wa(c);
  $('#color-fallback').src = img(c);
  $('#color-fallback').alt = `Case Fabulous Pods warna ${c.name}`;
  $('#hero-spot img').src = img(c);
  if (step === 0) $('#story-fallback').src = img(c);
  if (from3D && pods) pods.color(c.hex);
}
function setupColors() {
  const box = $('#swatches');
  box.innerHTML = COLORS.map(c => `<button type="button" class="swatch" role="radio" data-id="${c.id}" style="--c:${c.hex}" aria-label="${c.name}" aria-checked="false"></button>`).join('');
  box.addEventListener('click', e => { const b = e.target.closest('.swatch'); if (b) setColor(COLORS.find(c => c.id === Number(b.dataset.id))); });
  box.addEventListener('keydown', e => {
    if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(e.key)) return;
    e.preventDefault();
    const k = COLORS.indexOf(color), n = COLORS[(k + (e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : COLORS.length - 1)) % COLORS.length];
    setColor(n); $(`.swatch[data-id="${n.id}"]`).focus();
  });
  $('#shop-grid').innerHTML = COLORS.map(c => `<li class="item">
      <img src="${img(c)}" alt="Case Fabulous Pods warna ${c.name} dengan earbuds putih" width="224" height="195" loading="lazy">
      <h3><i style="--c:${c.hex}"></i>${c.name}</h3>
      <div class="item-row"><span>${rp(SHOP.price)}</span><a class="btn btn-light" href="${wa(c)}" target="_blank" rel="noopener">Pesan</a></div>
    </li>`).join('');
  $$('[data-price]').forEach(el => { el.textContent = rp(SHOP.price); });
  setColor(COLORS[0], false);
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
setupColors();
setStep(0);
layoutNodes();
addEventListener('resize', layoutNodes);
new ResizeObserver(layoutNodes).observe($('#cards'));
start3D().then(() => requestAnimationFrame(tick));
