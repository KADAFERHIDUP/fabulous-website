// Case earbuds Fabulous dalam 3D, dibuat dari kode (tanpa file model).
// Bentuknya mengikuti foto produk: case "squircle" dengan tutup di atas, dua earbuds di dalam.
import * as THREE from 'three';
import { RoomEnvironment } from '../vendor/RoomEnvironment.js';

const N = 3.3, A = 1.5, B = 1.1, SEAM = 0.42, D = 1.0, BEV = 0.15, MODEL_SPAN = 3.4;

function arc(t0, t1, steps = 64) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = t0 + (t1 - t0) * i / steps, c = Math.cos(t), s = Math.sin(t);
    pts.push(new THREE.Vector2(A * Math.sign(c) * Math.abs(c) ** (2 / N), B * Math.sign(s) * Math.abs(s) ** (2 / N)));
  }
  return pts;
}
const tSeam = Math.asin((SEAM / B) ** (N / 2));
const extrude = shape => {
  const g = new THREE.ExtrudeGeometry(shape, { depth: D, bevelEnabled: true, bevelThickness: BEV, bevelSize: BEV, bevelSegments: 8, curveSegments: 24 });
  g.translate(0, 0, -D / 2);
  g.computeVertexNormals();
  return g;
};

function noiseTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const x = c.getContext('2d'), img = x.createImageData(256, 256);
  for (let i = 0; i < img.data.length; i += 4) { const v = 110 + Math.random() * 90; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
  x.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3);
  return t;
}
function logoTexture() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 128;
  const x = c.getContext('2d');
  x.fillStyle = '#7bd44f'; x.beginPath(); x.arc(70, 64, 20, 0, Math.PI * 2); x.fill();
  x.fillStyle = '#ffffff'; x.font = '600 64px Archivo, Arial, sans-serif'; x.textBaseline = 'middle'; x.fillText('Fabulous', 108, 68);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}
function glowTexture(color) {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const x = c.getContext('2d'), g = x.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, color); g.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = g; x.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

function bud(white, tip, driver) {
  const g = new THREE.Group();
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.34, 48, 32), white);
  head.scale.set(1, 0.92, 0.95);
  const stem = new THREE.Mesh(new THREE.CapsuleGeometry(0.105, 0.78, 8, 24), white);
  stem.position.set(0.08, -0.55, 0.02); stem.rotation.z = 0.12;
  const eartip = new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 16), tip);
  eartip.scale.set(1, 0.7, 1); eartip.position.set(-0.24, 0.06, 0.12); eartip.rotation.z = 0.9;
  const core = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.025, 12, 48), driver);
  const cone = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.08, 0.06, 32), driver);
  ring.rotation.y = Math.PI / 2; cone.rotation.z = Math.PI / 2;
  core.add(ring, cone); core.position.set(-0.05, 0, 0.02);
  g.add(head, stem, eartip, core);
  g.userData = { core, solids: [head, stem, eartip] };
  return g;
}

export function createPods(canvas, { color = '#344d52' } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  if (!renderer.capabilities.isWebGL2) throw new Error('WebGL2 tidak tersedia');
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.92;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0.4, 9);
  camera.lookAt(0, 0, 0);
  const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(3, 5, 6);
  const rim = new THREE.DirectionalLight(0x9fb7ff, 2.4); rim.position.set(-5, 2, -4);
  scene.add(key, rim, new THREE.AmbientLight(0xffffff, 0.15));

  // materials
  const bump = noiseTexture();
  const leather = new THREE.MeshPhysicalMaterial({ color, roughness: 0.48, metalness: 0.05, clearcoat: 0.55, clearcoatRoughness: 0.35, bumpMap: bump, bumpScale: 0.6, transparent: true });
  const inner = new THREE.MeshStandardMaterial({ color: 0x15161b, roughness: 0.7 });
  const white = new THREE.MeshPhysicalMaterial({ color: 0xf4f5f7, roughness: 0.22, clearcoat: 0.8, clearcoatRoughness: 0.15, transparent: true });
  const tip = new THREE.MeshStandardMaterial({ color: 0xd9dbe0, roughness: 0.9, transparent: true });
  const driver = new THREE.MeshStandardMaterial({ color: 0xc9a86a, metalness: 0.9, roughness: 0.3, emissive: 0x3a2a10, transparent: true, opacity: 0 });
  const wire = new THREE.MeshBasicMaterial({ color: 0xaab4c8, wireframe: true, transparent: true, opacity: 0 });

  // case
  const pods = new THREE.Group();
  const lower = new THREE.Shape(arc(Math.PI - tSeam, 2 * Math.PI + tSeam));
  const upper = new THREE.Shape(arc(tSeam, Math.PI - tSeam));
  const bodyGeo = extrude(lower), lidGeo = extrude(upper);
  const body = new THREE.Mesh(bodyGeo, leather);
  const bodyWire = new THREE.Mesh(bodyGeo, wire);
  const xs = A * (1 - (SEAM / B) ** N) ** (1 / N);
  const cavity = new THREE.Mesh(new THREE.PlaneGeometry(2 * xs - 0.1, D + 2 * BEV - 0.14), inner);
  cavity.rotation.x = -Math.PI / 2; cavity.position.y = SEAM + 0.004;
  const logo = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.375), new THREE.MeshBasicMaterial({ map: logoTexture(), transparent: true, opacity: 0.92 }));
  logo.position.set(0, -0.12, D / 2 + BEV + 0.004);
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.035, 16, 8), new THREE.MeshBasicMaterial({ color: 0x7bd44f, transparent: true, opacity: 0.25 }));
  led.position.set(0, 0.22, D / 2 + BEV + 0.004);
  const battery = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 1.3, 8, 24), new THREE.MeshBasicMaterial({ color: 0x7bd44f, transparent: true, opacity: 0 }));
  battery.rotation.z = Math.PI / 2; battery.position.set(0, -0.62, 0);

  const lidPivot = new THREE.Group();
  lidPivot.position.set(0, SEAM, -(D / 2 + BEV));
  const lid = new THREE.Mesh(lidGeo, leather); lid.position.set(0, -SEAM, D / 2 + BEV);
  const lidWire = new THREE.Mesh(lidGeo, wire); lidWire.position.copy(lid.position);
  const lidInner = new THREE.Mesh(new THREE.PlaneGeometry(2 * xs - 0.1, D + 2 * BEV - 0.14), inner);
  lidInner.rotation.x = Math.PI / 2; lidInner.position.set(0, -0.004, D / 2 + BEV);
  lidPivot.add(lid, lidWire, lidInner);

  const buds = [bud(white, tip, driver), bud(white, tip, driver)];
  buds[1].scale.x = -1;
  const budWires = buds.map(b => b.userData.solids.map(m => { const w = new THREE.Mesh(m.geometry, wire); w.position.copy(m.position); w.rotation.copy(m.rotation); w.scale.copy(m.scale); b.add(w); return w; }));
  pods.add(body, bodyWire, cavity, logo, led, battery, lidPivot, ...buds);

  const glow = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.MeshBasicMaterial({ map: glowTexture('rgba(123,212,79,0.55)'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }));
  glow.rotation.x = -Math.PI / 2; glow.position.y = -1.45;
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 4.5), new THREE.MeshBasicMaterial({ map: glowTexture('rgba(0,0,0,0.75)'), transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = -1.42;
  const root = new THREE.Group(); root.add(pods, glow, shadow);
  scene.add(root);

  // state: x/y as screen fractions, s scale, ry/rx rotation, lid 0..1, lift 0..1, xray 0..1, glow 0..1, op opacity
  const cur = { x: 0, y: 0, s: 1, ry: 0.5, rx: 0.12, lid: 0, lift: 0, xray: 0, glow: 0, op: 1, spin: 0 };
  let tgt = { ...cur };
  const col = new THREE.Color(color), colTarget = new THREE.Color(color);
  let w = 1, h = 1, mx = 0, my = 0, raf = 0, visible = true, lastT = performance.now();
  const calm = matchMedia('(prefers-reduced-motion: reduce)');

  function resize() {
    w = canvas.clientWidth || innerWidth; h = canvas.clientHeight || innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  addEventListener('resize', resize);
  addEventListener('pointermove', e => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; }, { passive: true });
  resize();

  const visW = () => 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z * camera.aspect;
  const visH = () => 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;

  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;
    const k = calm.matches ? 1 : 1 - Math.exp(-dt * 6);
    for (const p in tgt) cur[p] += (tgt[p] - cur[p]) * k;
    col.lerp(colTarget, calm.matches ? 1 : 1 - Math.exp(-dt * 5)); leather.color.copy(col);
    canvas.style.opacity = cur.op.toFixed(3);
    if (cur.op < 0.01 || !visible) return;
    pose(cur, now / 1000, true);
    renderer.render(scene, camera);
  }
  function pose(cur, t, live) {
    const spin = calm.matches || !live ? 0 : cur.spin * t * 0.35;
    root.position.set(cur.x * visW(), cur.y * visH() + (calm.matches || !live ? 0 : Math.sin(t * 1.2) * 0.06), 0);
    root.scale.setScalar(cur.s);
    pods.rotation.set(cur.rx + (live ? my * 0.12 : 0), cur.ry + spin + (live ? mx * 0.3 : 0), 0);
    lidPivot.rotation.x = -cur.lid * 1.85;
    buds.forEach((b, i) => {
      const sgn = i ? 1 : -1;
      b.position.set(sgn * (0.62 + cur.lift * 0.75), SEAM + 0.05 + cur.lift * 1.55, 0.05 + cur.lift * 0.35);
      b.rotation.set(-0.15 + cur.lift * 0.2, sgn * (0.35 + cur.lift * 0.5), sgn * cur.lift * -0.25);
      b.scale.set(sgn, 1, 1);
    });
    const solid = 1 - cur.xray * 0.82;
    leather.opacity = solid; white.opacity = 1 - cur.xray * 0.7; tip.opacity = white.opacity;
    wire.opacity = cur.xray * 0.55;
    driver.opacity = cur.xray;
    battery.material.opacity = Math.max(cur.xray * 0.22, cur.glow * 0.3);
    logo.material.opacity = 0.92 * (1 - cur.xray * 0.85);
    const pulse = 0.55 + 0.45 * Math.sin(t * 3);
    led.material.opacity = 0.25 + cur.glow * 0.75 * pulse;
    glow.material.opacity = cur.glow * (0.7 + 0.3 * pulse);
    shadow.material.opacity = 1 - cur.lift * 0.5;
  }
  raf = requestAnimationFrame(frame);
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; });

  // foto produk HD dari model 3D: latar transparan, warna apa pun, tanpa file foto
  function still(hex, W = 640, H = 520) {
    renderer.setSize(W, H, false);
    camera.aspect = W / H; camera.updateProjectionMatrix();
    const s = 0.78 * visW() / MODEL_SPAN;
    leather.color.set(hex);
    pose({ x: 0, y: -0.07, s, ry: 0.42, rx: 0.2, lid: 0.62, lift: 0, xray: 0, glow: 0, spin: 0 }, 0, false);
    led.material.opacity = 0.25; glow.material.opacity = 0;
    renderer.render(scene, camera);
    const url = canvas.toDataURL('image/png');
    resize();
    leather.color.copy(col);
    pose(cur, performance.now() / 1000, true);
    renderer.render(scene, camera);
    return url;
  }

  return {
    still,
    set(next) { tgt = { ...tgt, ...next }; },
    jump(next) { tgt = { ...tgt, ...next }; Object.assign(cur, tgt); },
    color(hex) { colTarget.set(hex); },
    get state() { return { ...cur }; },
    dispose() { cancelAnimationFrame(raf); renderer.dispose(); },
  };
}
