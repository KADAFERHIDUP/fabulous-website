// Pembaca file .glb (glTF 2.0 biner) yang ringkas untuk three.js.
// Cukup untuk model tanpa kompresi: mesh, hierarki node, material PBR, dan tekstur gambar.
import * as THREE from 'three';

const COMP = { 5120: Int8Array, 5121: Uint8Array, 5122: Int16Array, 5123: Uint16Array, 5125: Uint32Array, 5126: Float32Array };
const SIZE = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT2: 4, MAT3: 9, MAT4: 16 };
const NORM = { 5120: 127, 5121: 255, 5122: 32767, 5123: 65535 };

export async function loadGLB(url) {
  const buf = await (await fetch(url)).arrayBuffer();
  const dv = new DataView(buf);
  if (dv.getUint32(0, true) !== 0x46546c67) throw new Error('Bukan file .glb');
  let off = 12, json = null, bin = null;
  while (off < buf.byteLength) {
    const len = dv.getUint32(off, true), type = dv.getUint32(off + 4, true);
    if (type === 0x4e4f534a) json = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, off + 8, len)));
    else if (type === 0x004e4942) bin = new Uint8Array(buf, off + 8, len);
    off += 8 + len;
  }
  if (json.extensionsRequired?.length) throw new Error('Model memakai ekstensi: ' + json.extensionsRequired.join(', '));

  const view = i => { const v = json.bufferViews[i]; return { bytes: bin.subarray(v.byteOffset || 0, (v.byteOffset || 0) + v.byteLength), stride: v.byteStride || 0 }; };
  const accessor = i => {
    const a = json.accessors[i], T = COMP[a.componentType], n = SIZE[a.type];
    const out = new T(a.count * n);
    if (a.bufferView !== undefined) {
      const { bytes, stride } = view(a.bufferView);
      const start = a.byteOffset || 0, el = n * T.BYTES_PER_ELEMENT;
      if (!stride || stride === el) out.set(new T(bytes.buffer, bytes.byteOffset + start, a.count * n));
      else for (let k = 0; k < a.count; k++) out.set(new T(bytes.buffer, bytes.byteOffset + start + k * stride, n), k * n);
    }
    return { array: out, itemSize: n, normalized: !!a.normalized };
  };

  const textures = await Promise.all((json.textures || []).map(async t => {
    const im = json.images[t.source], { bytes } = view(im.bufferView);
    const bmp = await createImageBitmap(new Blob([bytes], { type: im.mimeType }), { imageOrientation: 'none' });
    const tex = new THREE.Texture(bmp);
    tex.flipY = false; tex.colorSpace = THREE.SRGBColorSpace; tex.needsUpdate = true;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }));

  const materials = (json.materials || []).map(m => {
    const p = m.pbrMetallicRoughness || {};
    const c = p.baseColorFactor || [1, 1, 1, 1];
    const mat = new THREE.MeshStandardMaterial({
      name: m.name || '',
      color: new THREE.Color().setRGB(c[0], c[1], c[2], THREE.LinearSRGBColorSpace),
      metalness: p.metallicFactor ?? 1,
      roughness: p.roughnessFactor ?? 1,
      side: m.doubleSided ? THREE.DoubleSide : THREE.FrontSide,
      transparent: m.alphaMode === 'BLEND' || c[3] < 1,
      opacity: c[3],
    });
    if (p.baseColorTexture) mat.map = textures[p.baseColorTexture.index];
    if (m.emissiveFactor) mat.emissive.setRGB(...m.emissiveFactor, THREE.LinearSRGBColorSpace);
    return mat;
  });
  const fallback = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.6 });

  const meshes = (json.meshes || []).map(m => m.primitives.map(pr => {
    const g = new THREE.BufferGeometry();
    for (const [name, idx] of Object.entries(pr.attributes)) {
      const key = { POSITION: 'position', NORMAL: 'normal', TEXCOORD_0: 'uv', COLOR_0: 'color' }[name];
      if (!key) continue;
      const a = accessor(idx);
      let arr = a.array;
      if (a.normalized && NORM[json.accessors[idx].componentType]) arr = Float32Array.from(arr, v => v / NORM[json.accessors[idx].componentType]);
      g.setAttribute(key, new THREE.BufferAttribute(arr, a.itemSize));
    }
    if (pr.indices !== undefined) g.setIndex(new THREE.BufferAttribute(accessor(pr.indices).array, 1));
    if (!g.attributes.normal) g.computeVertexNormals();
    return { geometry: g, material: pr.material !== undefined ? materials[pr.material] : fallback };
  }));

  const build = i => {
    const n = json.nodes[i], obj = new THREE.Group();
    obj.name = n.name || '';
    if (n.matrix) new THREE.Matrix4().fromArray(n.matrix).decompose(obj.position, obj.quaternion, obj.scale);
    if (n.translation) obj.position.fromArray(n.translation);
    if (n.rotation) obj.quaternion.fromArray(n.rotation);
    if (n.scale) obj.scale.fromArray(n.scale);
    if (n.mesh !== undefined) meshes[n.mesh].forEach(p => { const m = new THREE.Mesh(p.geometry, p.material); m.name = obj.name; obj.add(m); });
    (n.children || []).forEach(c => obj.add(build(c)));
    return obj;
  };
  const scene = new THREE.Group();
  (json.scenes[json.scene || 0].nodes || []).forEach(i => scene.add(build(i)));
  scene.userData.asset = json.asset;
  return scene;
}
