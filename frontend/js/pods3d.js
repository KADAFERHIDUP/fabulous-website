// Objek 3D Fabulous dari file model (.glb) di folder models/.
// Case bisa diganti warnanya, tutupnya bisa terbuka/tertutup, dan earbuds bisa terangkat.
// Model: "Anker Soundcore Liberty Air 2" oleh standso dan "Earphones" oleh nurhadimli (Sketchfab, CC BY 4.0), warna diubah.
import * as THREE from 'three';
import { RoomEnvironment } from '../vendor/RoomEnvironment.js';
import { loadGLB } from './glb.js';

const MODEL_SPAN = 3.4; // lebar case dalam satuan 3D, dipakai app.js untuk mengatur ukuran di layar

// Data tiap model. Engsel dan sudut tutup dihitung dari bentuk modelnya (tutup di file dalam keadaan terbuka).
const KITS = {
  pods: {
    url: 'models/anker.glb',
    lid: 'Final_cap', hinge: [0, 1.215, -0.035], axis: [1, 0, 0], close: 1.5,
    body: ['Final_Body'], buds: ['Earpods_L', 'Earpods_R'],
    caseMats: ['D_Textured_Plastic'], ledMats: ['RS_Material'],
    budsInside: true, lift: 0.5, sink: 0.38,
  },
  mini: {
    url: 'models/earphones.glb',
    lid: 'Kapak', hinge: [-0.8819, 1.1226, 0.1311], axis: [0, -0.427, 0.904], close: -1.08,
    body: ['Yuva'], buds: ['Kulak', 'Kuak', 'Kat', 'kat'],
    caseMats: ['Plastik1'], ledMats: [],
    // case di file miring: sumbu panjang U, sumbu V, dan sumbu "atas" W (dari analisis bentuk)
    orient: { U: [0, -0.427, 0.904], V: [-0.962, 0.248, 0.117], W: [0.274, 0.87, 0.41] },
    budsInside: false, lift: 0.45, sink: 0,
  },
};

const startsWithAny = (name, list) => list.some(p => (name || '').startsWith(p));
const ancestorIn = (o, list) => { for (let p = o; p; p = p.parent) if (startsWithAny(p.name, list)) return p; return null; };

async function buildKit(cfg, mats) {
  const raw = await loadGLB(cfg.url);
  raw.updateMatrixWorld(true);
  const find = list => { const out = []; raw.traverse(o => { if (o.children.length && startsWithAny(o.name, list) && !ancestorIn(o.parent, list)) out.push(o); }); return out; };

  // tutup: dipindah ke engsel supaya bisa diputar
  const lidNode = find([cfg.lid])[0];
  const hinge = new THREE.Group();
  hinge.position.fromArray(cfg.hinge);
  raw.add(hinge); hinge.updateMatrixWorld(true);
  hinge.attach(lidNode);
  const axis = new THREE.Vector3().fromArray(cfg.axis).normalize();

  // earbuds: disimpan posisi aslinya untuk animasi
  const buds = find(cfg.buds).filter(n => !ancestorIn(n, [cfg.lid]) && !ancestorIn(n, cfg.body));
  buds.forEach(b => { b.userData.home = b.position.clone(); b.userData.homeScale = b.scale.clone(); });

  // material: case diganti warna, lampu indikator jadi bisa menyala, sisanya apa adanya
  const caseMeshes = [];
  raw.traverse(o => {
    if (!o.isMesh) return;
    const name = o.material.name;
    if (startsWithAny(name, cfg.caseMats) && !buds.some(b => ancestorIn(o, [b.name]))) { o.material = mats.leather; caseMeshes.push(o); }
    else if (cfg.ledMats.includes(name)) o.material = mats.led; // nama persis: material lain berawalan sama
    else { o.material = o.material.clone(); o.material.transparent = true; o.userData.solid = true; }
  });

  // tegakkan model yang miring di file
  const holder = new THREE.Group();
  holder.add(raw);
  if (cfg.orient) {
    const { U, V, W } = cfg.orient;
    const basis = new THREE.Matrix4().makeBasis(new THREE.Vector3(...U), new THREE.Vector3(...W), new THREE.Vector3(...V).negate());
    raw.quaternion.setFromRotationMatrix(basis.invert());
  }
  // ukur dalam keadaan tertutup, lalu skala dan pusatkan
  hinge.setRotationFromAxisAngle(axis, cfg.close);
  buds.forEach(b => { b.visible = false; });
  holder.updateMatrixWorld(true);
  const box = new THREE.Box3();
  raw.traverse(o => { if (o.isMesh && o.visible !== false && !buds.some(b => ancestorIn(o, [b.name]))) box.expandByObject(o); });
  buds.forEach(b => { b.visible = true; });
  const size = box.getSize(new THREE.Vector3()), center = box.getCenter(new THREE.Vector3());
  // arah "atas" dan titik tengah case dalam koordinat lokal tiap earbud (model punya skala/rotasi sendiri)
  buds.forEach(b => {
    const p0 = b.parent.worldToLocal(new THREE.Vector3(0, 0, 0)), p1 = b.parent.worldToLocal(new THREE.Vector3(0, size.y, 0));
    b.userData.up = p1.sub(p0);
    b.userData.inside = b.parent.worldToLocal(center.clone());
  });
  const k = MODEL_SPAN / Math.max(size.x, size.z);
  raw.scale.setScalar(k);
  raw.position.copy(center).multiplyScalar(-k);
  const bottom = -size.y * k / 2;

  // garis mesh (mode x-ray) untuk case
  const wires = caseMeshes.map(m => { const w = new THREE.Mesh(m.geometry, mats.wire); m.add(w); return w; });

  const solids = []; raw.traverse(o => { if (o.isMesh && o.userData.solid) solids.push(o); });
  return {
    group: holder, bottom, buds, solids, wires,
    pose(lid, lift, xray) {
      hinge.setRotationFromAxisAngle(axis, cfg.close * (1 - lid));
      buds.forEach(b => {
        const { home, up, inside, homeScale } = b.userData;
        if (cfg.budsInside) {
          // tertutup: earbuds turun masuk ke case; terbuka: berdiri, lalu terangkat
          b.position.copy(home).addScaledVector(up, lift * cfg.lift - (1 - lid) * cfg.sink);
        } else {
          // case kapsul: earbuds keluar dari dalam case saat tutup terbuka
          const t = Math.min(1, lid * 1.2);
          b.position.copy(inside).lerp(home, t).addScaledVector(up, lift * cfg.lift);
          b.scale.copy(homeScale).multiplyScalar(Math.max(0.001, t));
          b.visible = t > 0.02;
        }
      });
      solids.forEach(m => { m.material.opacity = 1 - xray * 0.65; });
    },
  };
}

export async function createPods(canvas, { color = '#344d52', model = 'pods' } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  if (!renderer.capabilities.isWebGL2) throw new Error('WebGL2 tidak tersedia');
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0.4, 9);
  camera.lookAt(0, 0, 0);
  const key = new THREE.DirectionalLight(0xffffff, 2.0); key.position.set(3, 5, 6);
  const rim = new THREE.DirectionalLight(0x9fb7ff, 2.6); rim.position.set(-5, 2, -4);
  scene.add(key, rim, new THREE.AmbientLight(0xffffff, 0.2));

  const mats = {
    leather: new THREE.MeshPhysicalMaterial({ color, roughness: 0.5, metalness: 0.02, clearcoat: 0.45, clearcoatRoughness: 0.4, transparent: true }),
    led: new THREE.MeshBasicMaterial({ color: 0x7bd44f, transparent: true, opacity: 0.4 }),
    wire: new THREE.MeshBasicMaterial({ color: 0xaab4c8, wireframe: true, transparent: true, opacity: 0, depthWrite: false }),
  };

  const glowTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const x = c.getContext('2d'), g = x.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, 'rgba(123,212,79,0.55)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  })();
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }));
  glow.rotation.x = -Math.PI / 2;

  const root = new THREE.Group(), pods = new THREE.Group();
  root.add(pods, glow);
  scene.add(root);

  const kits = {};
  let kit = null;
  async function useModel(name) {
    if (!KITS[name]) return;
    if (!kits[name]) kits[name] = await buildKit(KITS[name], mats);
    if (kit) pods.remove(kit.group);
    kit = kits[name];
    pods.add(kit.group);
    glow.position.y = kit.bottom - 0.02;
  }
  await useModel(model);

  const cur = { x: 0, y: 0, s: 1, ry: 0.5, rx: 0.12, lid: 0, lift: 0, xray: 0, glow: 0, op: 1, spin: 0 };
  let tgt = { ...cur };
  const col = new THREE.Color(color), colTarget = new THREE.Color(color);
  let mx = 0, my = 0, raf = 0, visible = true, lastT = performance.now();
  const calm = matchMedia('(prefers-reduced-motion: reduce)');

  function resize() {
    const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  addEventListener('resize', resize);
  addEventListener('pointermove', e => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; }, { passive: true });
  resize();
  const visH = () => 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
  const visW = () => visH() * camera.aspect;

  function pose(c, t, live) {
    const spin = calm.matches || !live ? 0 : c.spin * t * 0.35;
    root.position.set(c.x * visW(), c.y * visH() + (calm.matches || !live ? 0 : Math.sin(t * 1.2) * 0.06), 0);
    root.scale.setScalar(c.s);
    pods.rotation.set(c.rx + (live ? my * 0.12 : 0), c.ry + spin + (live ? mx * 0.3 : 0), 0);
    kit.pose(c.lid, c.lift, c.xray);
    mats.leather.opacity = 1 - c.xray * 0.8;
    mats.wire.opacity = c.xray * 0.5;
    const pulse = 0.55 + 0.45 * Math.sin(t * 3);
    mats.led.opacity = 0.35 + c.glow * 0.65 * pulse;
    glow.material.opacity = c.glow * (0.7 + 0.3 * pulse);
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;
    const k = calm.matches ? 1 : 1 - Math.exp(-dt * 6);
    for (const p in tgt) cur[p] += (tgt[p] - cur[p]) * k;
    col.lerp(colTarget, calm.matches ? 1 : 1 - Math.exp(-dt * 5)); mats.leather.color.copy(col);
    canvas.style.opacity = cur.op.toFixed(3);
    if (cur.op < 0.01 || !visible) return;
    pose(cur, now / 1000, true);
    renderer.render(scene, camera);
  }
  raf = requestAnimationFrame(frame);
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; });

  // gambar produk HD dari model: latar transparan, warna apa pun, tutup sedikit terbuka
  function still(hex, W = 640, H = 520) {
    // katalog selalu memakai model utama (Pods), apa pun model yang sedang tampil
    const shown = kit;
    if (kits.pods && kit !== kits.pods) { pods.remove(kit.group); kit = kits.pods; pods.add(kit.group); }
    renderer.setSize(W, H, false);
    camera.aspect = W / H; camera.updateProjectionMatrix();
    mats.leather.color.set(hex);
    pose({ x: 0, y: -0.04, s: 0.74 * visW() / MODEL_SPAN, ry: 0.5, rx: 0.22, lid: 0.85, lift: 0, xray: 0, glow: 0, spin: 0 }, 0, false);
    renderer.render(scene, camera);
    const url = canvas.toDataURL('image/png');
    resize();
    if (kit !== shown) { pods.remove(kit.group); kit = shown; pods.add(kit.group); }
    mats.leather.color.copy(col);
    pose(cur, performance.now() / 1000, true);
    renderer.render(scene, camera);
    return url;
  }

  return {
    still,
    model: async name => { await useModel(name); },
    get modelName() { return Object.keys(kits).find(n => kits[n] === kit); },
    set(next) { tgt = { ...tgt, ...next }; },
    jump(next) { tgt = { ...tgt, ...next }; Object.assign(cur, tgt); },
    color(hex) { colTarget.set(hex); },
    get state() { return { ...cur }; },
    dispose() { cancelAnimationFrame(raf); renderer.dispose(); },
  };
}
