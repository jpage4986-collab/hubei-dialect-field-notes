"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

type FieldItem = {
  title: string;
  caption: string;
  tone: number;
};

const FIELD_SETS: FieldItem[][] = [
  [
    { title: "清晨入村", caption: "沿街记录日常称谓与第一轮自然对话。临时影像，待替换为项目原片。", tone: 0 },
    { title: "街巷访谈", caption: "在熟悉的生活场景中完成半结构式访谈。临时影像，待替换为项目原片。", tone: 1 },
    { title: "录音准备", caption: "校准设备，记录采样位置、时间与受访者信息。临时影像，待替换为项目原片。", tone: 2 },
    { title: "方言词表", caption: "从常用词、地方物产和亲属称谓进入语言现场。临时影像，待替换为项目原片。", tone: 3 },
    { title: "围坐闲谈", caption: "让叙述回到自然语速，保留停顿、笑声与现场环境音。临时影像，待替换为项目原片。", tone: 4 },
    { title: "暮色归档", caption: "当天整理录音、照片和田野笔记，建立材料索引。临时影像，待替换为项目原片。", tone: 5 },
  ],
  [
    { title: "码头旧声", caption: "从行业称呼追索城市生活中的旧词与新义。临时影像，待替换为项目原片。", tone: 5 },
    { title: "集市采样", caption: "记录叫卖、议价和熟人交谈中的真实语音。临时影像，待替换为项目原片。", tone: 3 },
    { title: "家中口述", caption: "围绕迁徙、家庭和地方记忆展开口述。临时影像，待替换为项目原片。", tone: 1 },
    { title: "语音复核", caption: "邀请讲述者回听片段，核对词义与使用语境。临时影像，待替换为项目原片。", tone: 4 },
    { title: "地名寻访", caption: "沿地名线索寻找方言保存较完整的社区。临时影像，待替换为项目原片。", tone: 0 },
    { title: "夜间整理", caption: "为照片、音频和转写文本建立互相对应的编号。临时影像，待替换为项目原片。", tone: 2 },
  ],
];

const PALETTES = [
  ["#c4a66b", "#4e725c", "#13271f"],
  ["#819c89", "#826c4c", "#14261e"],
  ["#c3a872", "#6c8170", "#24372c"],
  ["#89a392", "#58725e", "#14281f"],
  ["#b39a74", "#496657", "#10231b"],
  ["#9c8968", "#6b8068", "#172a21"],
];

function makePhotoTexture(item: FieldItem) {
  const canvas = document.createElement("canvas");
  canvas.width = 420;
  canvas.height = 720;
  const context = canvas.getContext("2d");
  if (!context) return new THREE.CanvasTexture(canvas);
  const palette = PALETTES[item.tone % PALETTES.length];
  const gradient = context.createLinearGradient(0, 0, 0, 720);
  gradient.addColorStop(0, palette[0]);
  gradient.addColorStop(0.58, palette[1]);
  gradient.addColorStop(1, palette[2]);
  context.fillStyle = gradient;
  context.fillRect(0, 0, 420, 720);
  context.globalAlpha = 0.48;
  context.fillStyle = "#f2d58d";
  context.beginPath();
  context.arc(310, 155, 72, 0, Math.PI * 2);
  context.fill();
  context.globalAlpha = 0.92;
  context.fillStyle = palette[1];
  context.beginPath();
  context.moveTo(0, 430);
  context.quadraticCurveTo(120, 250, 235, 430);
  context.quadraticCurveTo(340, 310, 420, 415);
  context.lineTo(420, 720);
  context.lineTo(0, 720);
  context.fill();
  context.fillStyle = palette[2];
  context.beginPath();
  context.moveTo(0, 540);
  context.quadraticCurveTo(120, 405, 245, 540);
  context.quadraticCurveTo(340, 470, 420, 520);
  context.lineTo(420, 720);
  context.lineTo(0, 720);
  context.fill();
  context.fillStyle = "#09150f";
  context.beginPath();
  context.arc(185, 430, 19, 0, Math.PI * 2);
  context.fill();
  context.fillRect(164, 450, 42, 120);
  context.beginPath();
  context.arc(265, 455, 16, 0, Math.PI * 2);
  context.fill();
  context.fillRect(247, 472, 36, 98);
  context.globalAlpha = 0.82;
  context.fillStyle = "#f1dfb3";
  context.font = "500 20px serif";
  context.fillText(item.title, 28, 54);
  context.font = "12px monospace";
  context.fillText("FIELD NOTE / TEMP", 28, 82);
  const image = context.getImageData(0, 0, 420, 720);
  for (let index = 0; index < image.data.length; index += 4) {
    const grain = (Math.random() - 0.5) * 14;
    image.data[index] += grain;
    image.data[index + 1] += grain;
    image.data[index + 2] += grain;
  }
  context.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function PhotoPreview({ item }: { item: FieldItem }) {
  const palette = PALETTES[item.tone % PALETTES.length];
  return (
    <div
      className="generated-photo-preview"
      style={{
        background: `radial-gradient(circle at 75% 22%, ${palette[0]} 0 8%, transparent 22%), linear-gradient(155deg, ${palette[0]}, ${palette[1]} 54%, ${palette[2]})`,
      }}
      role="img"
      aria-label={`${item.title}临时影像`}
    >
      <span>FIELD NOTE / TEMP</span>
      <i aria-hidden="true" />
      <b aria-hidden="true" />
    </div>
  );
}

export function ThreeFanGallery() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [setIndex, setSetIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [detailVisible, setDetailVisible] = useState(false);
  const selectedRef = useRef(0);
  const openRef = useRef(true);
  const [isOpen, setIsOpen] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const items = FIELD_SETS[setIndex];

  useEffect(() => {
    openRef.current = isOpen;
  }, [isOpen]);
  useEffect(() => {
    selectedRef.current = selectedIndex;
  }, [selectedIndex]);

  const changeSet = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setDetailVisible(false);
    setIsOpen(false);
    timerRef.current = setTimeout(() => {
      setSetIndex((current) => (current + 1) % FIELD_SETS.length);
      setSelectedIndex(0);
      setIsOpen(true);
    }, 760);
  };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 50);
    camera.position.set(0, 1.4, 14);
    camera.lookAt(0, 1.25, 0);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.setAttribute("aria-label", "可旋转和展开的三维折扇照片展");
    renderer.domElement.setAttribute("role", "img");
    mount.appendChild(renderer.domElement);
    scene.add(new THREE.HemisphereLight(0xf4ead0, 0x07110d, 2.5));
    const key = new THREE.DirectionalLight(0xffd78b, 5.4);
    key.position.set(-5, 8, 10);
    scene.add(key);
    const rim = new THREE.PointLight(0x58b08b, 16, 22);
    rim.position.set(6, 2, 6);
    scene.add(rim);

    const fan = new THREE.Group();
    fan.position.y = -3.4;
    fan.rotation.x = -0.08;
    scene.add(fan);
    const baseRotation = new THREE.Vector2(-0.08, 0);
    const targetRotation = baseRotation.clone();
    const leafGroups: THREE.Group[] = [];
    const leaves: THREE.Mesh[] = [];
    const textures: THREE.Texture[] = [];
    const targetAngles = items.map((_, index) => THREE.MathUtils.degToRad(-55 + index * 22));
    const leafShape = new THREE.Shape();
    leafShape.moveTo(-0.26, 0);
    leafShape.lineTo(-1.36, 5.65);
    leafShape.lineTo(1.36, 5.65);
    leafShape.lineTo(0.26, 0);
    leafShape.closePath();
    const leafGeometry = new THREE.ExtrudeGeometry(leafShape, {
      depth: 0.065,
      bevelEnabled: true,
      bevelSize: 0.025,
      bevelThickness: 0.018,
      bevelSegments: 2,
    });
    items.forEach((item, index) => {
      const leafGroup = new THREE.Group();
      leafGroup.rotation.z = 0;
      leafGroup.position.z = index * 0.045;
      fan.add(leafGroup);
      leafGroups.push(leafGroup);
      const texture = makePhotoTexture(item);
      textures.push(texture);
      const material = new THREE.MeshPhysicalMaterial({
        map: texture,
        color: 0xd6cfb5,
        roughness: 0.58,
        metalness: 0.03,
        clearcoat: 0.16,
        emissive: 0x6b4d1f,
        emissiveIntensity: 0,
      });
      const leaf = new THREE.Mesh(leafGeometry, material);
      leaf.userData.index = index;
      leafGroup.add(leaf);
      leaves.push(leaf);
      const rib = new THREE.Mesh(
        new THREE.BoxGeometry(0.075, 5.75, 0.095),
        new THREE.MeshStandardMaterial({ color: 0x9a763d, roughness: 0.38, metalness: 0.1 }),
      );
      rib.position.y = 2.72;
      rib.position.z = 0.09;
      leafGroup.add(rib);
    });
    const rivet = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.24, 0.34, 32),
      new THREE.MeshPhysicalMaterial({ color: 0xd8ad52, roughness: 0.24, metalness: 0.62 }),
    );
    rivet.rotation.x = Math.PI / 2;
    rivet.position.z = 0.34;
    fan.add(rivet);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2(3, 3);
    let pressed = false;
    let startX = 0;
    let startY = 0;
    let moved = 0;
    const setPointer = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };
    const onDown = (event: PointerEvent) => {
      pressed = true;
      moved = 0;
      startX = event.clientX;
      startY = event.clientY;
      renderer.domElement.setPointerCapture(event.pointerId);
      setPointer(event);
    };
    const onMove = (event: PointerEvent) => {
      setPointer(event);
      raycaster.setFromCamera(pointer, camera);
      renderer.domElement.style.cursor = pressed ? "grabbing" : raycaster.intersectObjects(leaves, false)[0] ? "pointer" : "grab";
      if (!pressed) return;
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      moved = Math.max(moved, Math.hypot(dx, dy));
      targetRotation.set(
        THREE.MathUtils.clamp(baseRotation.x + dy * 0.004, -0.42, 0.28),
        THREE.MathUtils.clamp(dx * 0.0045, -0.55, 0.55),
      );
    };
    const onUp = (event: PointerEvent) => {
      setPointer(event);
      if (moved < 7) {
        raycaster.setFromCamera(pointer, camera);
        const hit = raycaster.intersectObjects(leaves, false)[0];
        if (hit) {
          setSelectedIndex(hit.object.userData.index as number);
          setDetailVisible(true);
        }
      }
      pressed = false;
      targetRotation.copy(baseRotation);
      renderer.domElement.releasePointerCapture(event.pointerId);
    };
    const onLeave = () => {
      pressed = false;
      targetRotation.copy(baseRotation);
    };
    renderer.domElement.addEventListener("pointerdown", onDown);
    renderer.domElement.addEventListener("pointermove", onMove);
    renderer.domElement.addEventListener("pointerup", onUp);
    renderer.domElement.addEventListener("pointerleave", onLeave);

    const resize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    resize();
    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      leafGroups.forEach((leafGroup, index) => {
        const target = openRef.current ? targetAngles[index] : 0;
        leafGroup.rotation.z += (target - leafGroup.rotation.z) * 0.085;
        const material = leaves[index].material as THREE.MeshPhysicalMaterial;
        const selected = selectedRef.current === index;
        material.emissiveIntensity += ((selected ? 0.22 : 0) - material.emissiveIntensity) * 0.1;
      });
      fan.rotation.x += (targetRotation.x - fan.rotation.x) * (pressed ? 0.16 : 0.08);
      fan.rotation.y += (targetRotation.y - fan.rotation.y) * (pressed ? 0.16 : 0.08);
      renderer.render(scene, camera);
    };
    animate();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onDown);
      renderer.domElement.removeEventListener("pointermove", onMove);
      renderer.domElement.removeEventListener("pointerup", onUp);
      renderer.domElement.removeEventListener("pointerleave", onLeave);
      leafGeometry.dispose();
      textures.forEach((texture) => texture.dispose());
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [items]);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  return (
    <section className={`fan-exhibit ${detailVisible ? "is-detail-visible" : ""}`}>
      <div className="three-fan-stage" ref={mountRef} />
      <p className="gesture-hint">拖动折扇查看侧面 · 松手自动复位</p>
      <button className="fan-change" type="button" onClick={changeSet}>合扇 · 换一组</button>
      <article
        className="photo-detail floating-layer"
        key={`${setIndex}-${selectedIndex}`}
        aria-hidden={!detailVisible}
        aria-live="polite"
      >
        <button
          className="floating-close"
          type="button"
          disabled={!detailVisible}
          onClick={() => setDetailVisible(false)}
        >
          收起
        </button>
        <div className="photo-detail-image"><PhotoPreview item={items[selectedIndex]} /></div>
        <div>
          <p>FIELD NOTE · {String(selectedIndex + 1).padStart(2, "0")}</p>
          <h3>{items[selectedIndex].title}</h3>
          <span>{items[selectedIndex].caption}</span>
        </div>
      </article>
    </section>
  );
}

const DIALECT_ITEMS = [
  {
    label: "01 · 声母",
    value: "送气与不送气",
    note: "比较不同年龄讲述者在自然语流中的起音差异，观察塞音、塞擦音在地方口音中的分合。",
  },
  {
    label: "02 · 韵母",
    value: "开口度与鼻尾",
    note: "把同一词项的韵母变化放回具体地点与语境，记录前后鼻音和入声韵尾的地域差异。",
  },
  {
    label: "03 · 声调",
    value: "调值与连读",
    note: "观察单字调进入句子后产生的节奏和调型变化，同时保留自然停顿与语气。",
  },
  {
    label: "04 · 词汇",
    value: "地方词项",
    note: "从亲属称谓、饮食、农事与街巷生活切入，辨认仍在使用和正在消退的地方词。",
  },
  {
    label: "05 · 语流",
    value: "连读与节奏",
    note: "对照词表读音与自由交谈，记录弱化、同化、吞音以及句末语气的真实表现。",
  },
  {
    label: "06 · 代际",
    value: "口音的迁移",
    note: "比较老、中、青三代讲述者，寻找普通话、人口流动与媒介环境留下的语言痕迹。",
  },
  {
    label: "07 · 场景",
    value: "谁在何处说",
    note: "同一个人面对家人、邻里和访谈者时会切换表达方式，语境也是方言材料的一部分。",
  },
  {
    label: "08 · 记忆",
    value: "声音中的地方",
    note: "把发音、故事与具体地点相互索引，让方言不仅是音系样本，也是可被讲述的地方记忆。",
  },
];

type BellPiece = {
  pivot: THREE.Group;
  hit: THREE.Mesh;
  material: THREE.MeshPhysicalMaterial;
  index: number;
  swing: number;
  velocity: number;
};

function playBellTone(index: number) {
  const AudioContextClass = window.AudioContext
    ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return;
  const context = new AudioContextClass();
  const now = context.currentTime;
  const output = context.createGain();
  output.gain.setValueAtTime(0.0001, now);
  output.gain.exponentialRampToValueAtTime(0.18, now + 0.015);
  output.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);
  output.connect(context.destination);
  const base = [196, 220, 247, 262, 294, 330, 349, 392][index];
  [1, 1.504, 2.03].forEach((ratio, partial) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = partial === 0 ? "sine" : "triangle";
    oscillator.frequency.value = base * ratio;
    oscillator.detune.value = partial * 4;
    gain.gain.value = [0.75, 0.22, 0.09][partial];
    oscillator.connect(gain);
    gain.connect(output);
    oscillator.start(now);
    oscillator.stop(now + 2.45);
  });
  window.setTimeout(() => void context.close(), 2700);
}

export function ThreeDialectDial() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [detailVisible, setDetailVisible] = useState(false);
  const activeRef = useRef<number | null>(null);
  useEffect(() => {
    activeRef.current = detailVisible ? active : null;
  }, [active, detailVisible]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(31, 1, 0.1, 80);
    camera.position.set(0, 0.45, 18.5);
    camera.lookAt(0, 0.15, 0);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.94;
    renderer.domElement.setAttribute("aria-label", "可旋转并点击敲击的三维曾侯乙编钟");
    renderer.domElement.setAttribute("role", "img");
    mount.appendChild(renderer.domElement);
    scene.add(new THREE.HemisphereLight(0xd9c998, 0x06100c, 1.7));
    const key = new THREE.DirectionalLight(0xffd98a, 4.25);
    key.position.set(-5, 7, 9);
    scene.add(key);
    const rim = new THREE.PointLight(0x6aa883, 8.5, 25);
    rim.position.set(6, 1, -4);
    scene.add(rim);

    const rack = new THREE.Group();
    rack.rotation.x = -0.08;
    scene.add(rack);
    const baseRotation = new THREE.Vector2(-0.08, -0.04);
    const targetRotation = baseRotation.clone();
    rack.rotation.y = baseRotation.y;

    const wood = new THREE.MeshPhysicalMaterial({
      color: 0x281b12,
      roughness: 0.64,
      metalness: 0.08,
      clearcoat: 0.12,
    });
    const bronzeDark = new THREE.MeshStandardMaterial({
      color: 0x5b4a2b,
      roughness: 0.5,
      metalness: 0.72,
    });
    const beamGeometry = new THREE.BoxGeometry(1, 1, 1, 4, 2, 2);
    const addBeam = (position: THREE.Vector3, scale: THREE.Vector3, rotationZ = 0) => {
      const beam = new THREE.Mesh(beamGeometry, wood);
      beam.position.copy(position);
      beam.scale.copy(scale);
      beam.rotation.z = rotationZ;
      rack.add(beam);
      return beam;
    };
    addBeam(new THREE.Vector3(-5.55, 0.15, 0), new THREE.Vector3(0.35, 10.6, 0.46), -0.025);
    addBeam(new THREE.Vector3(5.55, 0.15, 0), new THREE.Vector3(0.35, 10.6, 0.46), 0.025);
    addBeam(new THREE.Vector3(0, 4.95, 0), new THREE.Vector3(11.65, 0.34, 0.48));
    addBeam(new THREE.Vector3(0, 2.25, 0), new THREE.Vector3(10.9, 0.23, 0.38));
    addBeam(new THREE.Vector3(0, -0.62, 0), new THREE.Vector3(10.55, 0.24, 0.38));
    addBeam(new THREE.Vector3(0, -3.45, 0), new THREE.Vector3(10.25, 0.26, 0.4));
    addBeam(new THREE.Vector3(-5.05, -5.08, 0), new THREE.Vector3(2.5, 0.28, 0.7), -0.08);
    addBeam(new THREE.Vector3(5.05, -5.08, 0), new THREE.Vector3(2.5, 0.28, 0.7), 0.08);
    [-5.55, 5.55].forEach((x) => {
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.62, 0.52, 8), bronzeDark);
      cap.position.set(x, 5.45, 0);
      rack.add(cap);
    });

    const bellProfile = [
      new THREE.Vector2(0.92, -1.55),
      new THREE.Vector2(0.83, -1.25),
      new THREE.Vector2(0.72, -0.4),
      new THREE.Vector2(0.6, 0.62),
      new THREE.Vector2(0.48, 1.14),
      new THREE.Vector2(0.34, 1.33),
    ];
    const bellGeometry = new THREE.LatheGeometry(bellProfile, 48);
    bellGeometry.scale(0.82, 1, 1);
    bellGeometry.computeVertexNormals();
    const studGeometry = new THREE.SphereGeometry(0.09, 12, 8);
    const ridgeGeometry = new THREE.BoxGeometry(1.22, 0.055, 0.045);
    const pieces: BellPiece[] = [];
    const hitMeshes: THREE.Mesh[] = [];
    const layouts = [
      { y: 3.45, xs: [-3.65, -1.25, 1.25, 3.65], scale: 0.73 },
      { y: 0.65, xs: [-3.05, -1.02, 1.02, 3.05], scale: 0.9 },
    ];
    let bellIndex = 0;
    layouts.forEach((row) => {
      row.xs.forEach((x) => {
        const index = bellIndex;
        bellIndex += 1;
        const scale = row.scale * (1 + Math.abs(x) * 0.025);
        const pivot = new THREE.Group();
        pivot.position.set(x, row.y, 0.05);
        rack.add(pivot);
        const hanger = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.72, 16), bronzeDark);
        hanger.position.y = -0.33;
        pivot.add(hanger);
        const bellGroup = new THREE.Group();
        bellGroup.position.y = -1.72 * scale;
        bellGroup.scale.setScalar(scale);
        pivot.add(bellGroup);
        const material = new THREE.MeshPhysicalMaterial({
          color: index === 0 ? 0x766038 : 0x625435,
          emissive: 0xd99a37,
          emissiveIntensity: 0.025,
          roughness: 0.42,
          metalness: 0.78,
          clearcoat: 0.12,
        });
        const body = new THREE.Mesh(bellGeometry, material);
        body.userData.index = index;
        bellGroup.add(body);
        hitMeshes.push(body);
        const crown = new THREE.Mesh(new THREE.TorusGeometry(0.29, 0.085, 10, 24), bronzeDark);
        crown.rotation.x = Math.PI / 2;
        crown.position.y = 1.48;
        bellGroup.add(crown);
        [-0.74, -0.24, 0.26, 0.76].forEach((y) => {
          const ridge = new THREE.Mesh(ridgeGeometry, bronzeDark);
          ridge.position.set(0, y, 0.75 - Math.abs(y) * 0.12);
          bellGroup.add(ridge);
        });
        [-0.58, 0, 0.58].forEach((xOffset) => {
          [-0.52, 0.08, 0.66].forEach((yOffset) => {
            const stud = new THREE.Mesh(studGeometry, bronzeDark);
            stud.scale.set(1, 0.82, 0.7);
            stud.position.set(xOffset, yOffset, 0.78 - Math.abs(yOffset) * 0.1);
            bellGroup.add(stud);
          });
        });
        const lip = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.07, 12, 48), bronzeDark);
        lip.scale.x = 0.82;
        lip.rotation.x = Math.PI / 2;
        lip.position.y = -1.54;
        bellGroup.add(lip);
        pieces.push({ pivot, hit: body, material, index, swing: 0, velocity: 0 });
      });
    });

    const auraGeometry = new THREE.RingGeometry(0.65, 0.72, 64);
    const auraMaterial = new THREE.MeshBasicMaterial({
      color: 0xf4c96d,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const aura = new THREE.Mesh(auraGeometry, auraMaterial);
    aura.position.z = 1.1;
    rack.add(aura);
    let auraLife = 0;

    const strike = (index: number) => {
      const piece = pieces[index];
      piece.velocity += index < 4 ? 0.055 : 0.042;
      aura.position.set(piece.pivot.position.x, piece.pivot.position.y - 1.3, 1.05);
      aura.scale.setScalar(0.5);
      auraLife = 1;
      setActive(index);
      setDetailVisible(true);
      playBellTone(index);
    };

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2(3, 3);
    let pressed = false;
    let startX = 0;
    let startY = 0;
    let moved = 0;
    const setPointer = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };
    const onDown = (event: PointerEvent) => {
      pressed = true;
      moved = 0;
      startX = event.clientX;
      startY = event.clientY;
      renderer.domElement.setPointerCapture(event.pointerId);
    };
    const onMove = (event: PointerEvent) => {
      setPointer(event);
      if (!pressed) {
        raycaster.setFromCamera(pointer, camera);
        renderer.domElement.style.cursor = raycaster.intersectObjects(hitMeshes, false)[0] ? "pointer" : "grab";
        return;
      }
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      moved = Math.max(moved, Math.hypot(dx, dy));
      targetRotation.set(
        THREE.MathUtils.clamp(baseRotation.x + dy * 0.0038, -0.38, 0.24),
        THREE.MathUtils.clamp(baseRotation.y + dx * 0.0038, -0.48, 0.48),
      );
    };
    const onUp = (event: PointerEvent) => {
      setPointer(event);
      if (moved < 7) {
        raycaster.setFromCamera(pointer, camera);
        const hit = raycaster.intersectObjects(hitMeshes, false)[0];
        if (hit) strike(hit.object.userData.index as number);
      }
      pressed = false;
      targetRotation.copy(baseRotation);
      renderer.domElement.releasePointerCapture(event.pointerId);
    };
    const onLeave = () => {
      pressed = false;
      targetRotation.copy(baseRotation);
      pointer.set(3, 3);
    };
    renderer.domElement.addEventListener("pointerdown", onDown);
    renderer.domElement.addEventListener("pointermove", onMove);
    renderer.domElement.addEventListener("pointerup", onUp);
    renderer.domElement.addEventListener("pointerleave", onLeave);
    const resize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    resize();
    let frame = 0;
    const clock = new THREE.Clock();
    const animate = () => {
      frame = requestAnimationFrame(animate);
      clock.getDelta();
      raycaster.setFromCamera(pointer, camera);
      const hovered = raycaster.intersectObjects(hitMeshes, false)[0]?.object.userData.index as number | undefined;
      pieces.forEach((piece) => {
        piece.velocity += -piece.swing * 0.055;
        piece.velocity *= 0.935;
        piece.swing += piece.velocity;
        piece.pivot.rotation.z = piece.swing;
        const highlighted = hovered === piece.index || activeRef.current === piece.index;
        piece.material.emissiveIntensity += ((highlighted ? 0.34 : 0.025) - piece.material.emissiveIntensity) * 0.11;
      });
      if (auraLife > 0.002) {
        auraLife *= 0.94;
        aura.scale.multiplyScalar(1.045);
        auraMaterial.opacity = auraLife * 0.42;
      } else {
        auraMaterial.opacity = 0;
      }
      rack.rotation.x += (targetRotation.x - rack.rotation.x) * (pressed ? 0.16 : 0.075);
      rack.rotation.y += (targetRotation.y - rack.rotation.y) * (pressed ? 0.16 : 0.075);
      renderer.render(scene, camera);
    };
    animate();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onDown);
      renderer.domElement.removeEventListener("pointermove", onMove);
      renderer.domElement.removeEventListener("pointerup", onUp);
      renderer.domElement.removeEventListener("pointerleave", onLeave);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <section className={`three-dialect-exhibit ${detailVisible ? "is-detail-visible" : ""}`}>
      <div className="three-bell-stage" ref={mountRef} />
      <p className="gesture-hint">拖动编钟查看 · 松手复位 · 点击钟体打开资料</p>
      <article
        className="dial-detail floating-layer"
        key={active}
        aria-hidden={!detailVisible}
        aria-live="polite"
      >
        <button
          className="floating-close"
          type="button"
          disabled={!detailVisible}
          onClick={() => setDetailVisible(false)}
        >
          收起
        </button>
        <p>{DIALECT_ITEMS[active].label}</p>
        <h3>{DIALECT_ITEMS[active].value}</h3>
        <span>{DIALECT_ITEMS[active].note}</span>
      </article>
    </section>
  );
}
