"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import * as THREE from "three";
import { ThreeDialectDial, ThreeFanGallery } from "./ThreeArtifacts";

export type ExhibitKind = "audio" | "dialect" | "field";

type ExhibitProps = {
  city: string;
  kind: ExhibitKind;
  onClose: () => void;
};

type FieldImage = {
  title: string;
  caption: string;
  tone: number;
};

const FIELD_SETS: FieldImage[][] = [
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

const TONES = [
  ["#b99b6a", "#516f58", "#152a22"],
  ["#839f8b", "#846e4f", "#17271f"],
  ["#c1a76f", "#6f8272", "#26382d"],
  ["#8ba493", "#5d735e", "#172b23"],
  ["#b49a73", "#4b6658", "#13261e"],
  ["#9e8b69", "#6e8068", "#182a22"],
];

function FieldPlaceholder({ item, wide = false }: { item: FieldImage; wide?: boolean }) {
  const palette = TONES[item.tone % TONES.length];
  return (
    <svg
      className="field-placeholder"
      viewBox={wide ? "0 0 720 420" : "0 0 260 420"}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={`${item.title}临时影像`}
    >
      <defs>
        <linearGradient id={`sky-${item.tone}-${wide}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={palette[0]} />
          <stop offset="1" stopColor={palette[2]} />
        </linearGradient>
        <filter id={`grain-${item.tone}-${wide}`}>
          <feTurbulence baseFrequency=".72" numOctaves="2" seed={item.tone + 3} type="fractalNoise" />
          <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 .12 0" />
        </filter>
      </defs>
      <rect width="100%" height="100%" fill={`url(#sky-${item.tone}-${wide})`} />
      <circle cx={wide ? 550 : 190} cy="92" r="48" fill="#e9cf8e" opacity=".45" />
      <path
        d={wide ? "M0 250 Q130 155 250 245 T510 220 T720 245 V420 H0Z" : "M0 255 Q70 175 135 245 T260 225 V420 H0Z"}
        fill={palette[1]}
        opacity=".92"
      />
      <path
        d={wide ? "M0 312 Q160 235 310 315 T720 285 V420 H0Z" : "M0 320 Q75 250 145 315 T260 290 V420 H0Z"}
        fill={palette[2]}
      />
      <g fill="#0a1712" opacity=".88">
        <circle cx={wide ? 315 : 112} cy="244" r="13" />
        <path d={wide ? "M298 260h34l14 88h-62z" : "M96 260h32l13 88H84z"} />
        <circle cx={wide ? 400 : 170} cy="258" r="11" />
        <path d={wide ? "M386 272h29l11 76h-52z" : "M157 272h27l11 76h-49z"} />
      </g>
      <rect width="100%" height="100%" filter={`url(#grain-${item.tone}-${wide})`} opacity=".55" />
      <text x="18" y="32" fill="#f0dfb0" fontSize="11" letterSpacing="3">FIELD NOTE / TEMP</text>
    </svg>
  );
}

function FanGallery() {
  const [setIndex, setSetIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [open, setOpen] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const items = FIELD_SETS[setIndex];

  const changeSet = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setOpen(false);
    timerRef.current = setTimeout(() => {
      setSetIndex((current) => (current + 1) % FIELD_SETS.length);
      setSelectedIndex(0);
      setOpen(true);
    }, 520);
  };

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  return (
    <section className="fan-exhibit" aria-label="折扇照片展">
      <div className={`photo-fan ${open ? "is-open" : ""}`}>
        {items.map((item, index) => {
          const angle = -55 + index * 22;
          return (
            <button
              className={`fan-leaf ${selectedIndex === index ? "is-selected" : ""}`}
              key={`${setIndex}-${item.title}`}
              style={{ "--fan-angle": `${angle}deg`, "--fan-order": index } as CSSProperties}
              type="button"
              onClick={() => setSelectedIndex(index)}
              aria-label={`查看${item.title}`}
            >
              <FieldPlaceholder item={item} />
            </button>
          );
        })}
        <span className="fan-rivet" aria-hidden="true" />
      </div>
      <button className="fan-change" type="button" onClick={changeSet}>
        合扇 · 换一组
      </button>
      <article className="photo-detail" aria-live="polite">
        <div className="photo-detail-image">
          <FieldPlaceholder item={items[selectedIndex]} wide />
        </div>
        <div>
          <p>FIELD NOTE · {String(selectedIndex + 1).padStart(2, "0")}</p>
          <h3>{items[selectedIndex].title}</h3>
          <span>{items[selectedIndex].caption}</span>
        </div>
      </article>
    </section>
  );
}

const VOICE_SAMPLES = [
  {
    bits: [1, 0, 1, 1, 0, 1],
    title: "河岸边的一段闲谈。",
    description:
      "讲述从日常称谓进入旧城生活，停顿、笑声和远处的环境声也被完整保留。音孔编码对应这段采样在声音档案中的位置。",
  },
  {
    bits: [0, 1, 1, 0, 1, 0],
    title: "集市里的一声回应。",
    description:
      "叫卖、议价和熟人交谈交织在一起，地方词汇在具体的生活场景中自然出现，也留下了当时的空间与距离。",
  },
];

function BambooFlute({ city }: { city: string }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [sampleIndex, setSampleIndex] = useState(0);
  const [bits, setBits] = useState([...VOICE_SAMPLES[0].bits]);
  const bitsRef = useRef(bits);
  const activeRef = useRef(-1);
  const [activeHole, setActiveHole] = useState(-1);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [introVisible, setIntroVisible] = useState(false);
  const touchStartYRef = useRef<number | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    bitsRef.current = bits;
  }, [bits]);
  useEffect(() => {
    activeRef.current = activeHole;
  }, [activeHole]);

  const toggleHole = (index: number) => {
    setBits((current) => current.map((bit, bitIndex) => (bitIndex === index ? 1 - bit : bit)));
  };

  const switchSample = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    const nextIndex = (sampleIndex + 1) % VOICE_SAMPLES.length;
    const nextBits = [...VOICE_SAMPLES[nextIndex].bits];
    bitsRef.current = nextBits;
    setSampleIndex(nextIndex);
    setBits(nextBits);
    setActiveHole(-1);
    setHasPlayed(false);
    setIntroVisible(false);
  };

  const playPattern = () => {
    setHasPlayed(true);
    setIntroVisible(false);
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    const AudioContextClass = window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const now = context.currentTime;
    const frequencies = [392, 440, 523.25, 587.33, 659.25, 783.99];
    bitsRef.current.forEach((bit, index) => {
      const start = now + index * 0.32;
      if (bit) {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequencies[index], start);
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.12, start + 0.035);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.27);
        oscillator.connect(gain).connect(context.destination);
        oscillator.start(start);
        oscillator.stop(start + 0.3);
      }
      timersRef.current.push(setTimeout(() => setActiveHole(index), index * 320));
    });
    timersRef.current.push(setTimeout(() => {
      setActiveHole(-1);
      void context.close();
    }, bitsRef.current.length * 320 + 120));
  };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 50);
    camera.position.set(0, 4.7, 9.4);
    camera.lookAt(0, 0, 0);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.setAttribute("aria-label", "可交互的三维竹笛二进制声纹");
    renderer.domElement.setAttribute("role", "img");
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xdce9cf, 0x08120d, 2.4));
    const key = new THREE.DirectionalLight(0xffd991, 5.2);
    key.position.set(-4, 6, 8);
    scene.add(key);

    const flute = new THREE.Group();
    flute.rotation.z = -Math.PI / 2;
    flute.rotation.x = 0;
    flute.rotation.y = -0.42;
    flute.scale.setScalar(0.84);
    scene.add(flute);
    const bambooCanvas = document.createElement("canvas");
    bambooCanvas.width = 1024;
    bambooCanvas.height = 128;
    const bambooContext = bambooCanvas.getContext("2d");
    if (bambooContext) {
      const bambooGradient = bambooContext.createLinearGradient(0, 0, 0, 128);
      bambooGradient.addColorStop(0, "#5f4a27");
      bambooGradient.addColorStop(0.28, "#a58447");
      bambooGradient.addColorStop(0.56, "#72582d");
      bambooGradient.addColorStop(0.82, "#b09151");
      bambooGradient.addColorStop(1, "#58431f");
      bambooContext.fillStyle = bambooGradient;
      bambooContext.fillRect(0, 0, 1024, 128);
      bambooContext.globalAlpha = 0.18;
      for (let line = 0; line < 54; line += 1) {
        const x = (line * 73 + (line % 7) * 19) % 1024;
        bambooContext.strokeStyle = line % 3 === 0 ? "#ead498" : "#24190e";
        bambooContext.lineWidth = line % 4 === 0 ? 2 : 1;
        bambooContext.beginPath();
        bambooContext.moveTo(x, 0);
        bambooContext.bezierCurveTo(x + 12, 34, x - 9, 79, x + 4, 128);
        bambooContext.stroke();
      }
      bambooContext.globalAlpha = 1;
    }
    const bambooTexture = new THREE.CanvasTexture(bambooCanvas);
    bambooTexture.colorSpace = THREE.SRGBColorSpace;
    bambooTexture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
    const bambooMaterial = new THREE.MeshPhysicalMaterial({
      map: bambooTexture,
      color: 0xc09a58,
      roughness: 0.62,
      metalness: 0.02,
      clearcoat: 0.18,
      clearcoatRoughness: 0.72,
    });
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.37, 12.3, 96, 8, false),
      bambooMaterial,
    );
    flute.add(body);
    [-5.1, -2, 1.75, 5.05].forEach((y, index) => {
      const node = new THREE.Mesh(
        new THREE.TorusGeometry(0.385 - index * 0.003, 0.028, 12, 64),
        new THREE.MeshStandardMaterial({
          color: index % 2 ? 0x6f5429 : 0x8e6d35,
          roughness: 0.7,
        }),
      );
      node.rotation.x = Math.PI / 2;
      node.position.y = y;
      flute.add(node);
    });
    [-5.88, 5.88].forEach((y) => {
      const binding = new THREE.Mesh(
        new THREE.TorusGeometry(0.385, 0.042, 14, 64),
        new THREE.MeshStandardMaterial({
          color: 0xb7913f,
          metalness: 0.34,
          roughness: 0.32,
        }),
      );
      binding.rotation.x = Math.PI / 2;
      binding.position.y = y;
      flute.add(binding);
    });
    const endCap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.38, 0.38, 0.2, 64),
      new THREE.MeshPhysicalMaterial({
        color: 0x2c2417,
        roughness: 0.34,
        metalness: 0.24,
        clearcoat: 0.42,
      }),
    );
    endCap.position.y = -6.23;
    flute.add(endCap);
    const openEnd = new THREE.Mesh(
      new THREE.TorusGeometry(0.33, 0.067, 18, 64),
      new THREE.MeshStandardMaterial({ color: 0x352819, roughness: 0.76 }),
    );
    openEnd.rotation.x = Math.PI / 2;
    openEnd.position.y = 6.18;
    flute.add(openEnd);

    const membrane = new THREE.Mesh(
      new THREE.CylinderGeometry(0.19, 0.19, 0.035, 40),
      new THREE.MeshPhysicalMaterial({
        color: 0xd9cda6,
        emissive: 0x6b5528,
        emissiveIntensity: 0.18,
        roughness: 0.92,
        transmission: 0.08,
      }),
    );
    membrane.position.set(0, -4.62, 0.39);
    membrane.rotation.x = Math.PI / 2;
    flute.add(membrane);
    const membraneRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.2, 0.02, 10, 48),
      new THREE.MeshStandardMaterial({ color: 0xb79652, roughness: 0.55 }),
    );
    membraneRing.position.copy(membrane.position);
    flute.add(membraneRing);

    const tasselMaterial = new THREE.MeshStandardMaterial({
      color: 0x8c211d,
      roughness: 0.74,
    });
    const cordCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.14, -6.23, 0),
      new THREE.Vector3(0.27, -6.58, 0.02),
      new THREE.Vector3(0.06, -6.94, 0.06),
      new THREE.Vector3(0.22, -7.24, 0),
    ]);
    flute.add(new THREE.Mesh(new THREE.TubeGeometry(cordCurve, 40, 0.028, 10, false), tasselMaterial));
    for (let strand = 0; strand < 9; strand += 1) {
      const angle = (strand / 9) * Math.PI * 2;
      const originX = 0.22 + Math.cos(angle) * 0.1;
      const originZ = Math.sin(angle) * 0.1;
      const strandCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(originX, -7.24, originZ),
        new THREE.Vector3(originX * 1.04, -7.68, originZ * 1.18),
        new THREE.Vector3(originX + Math.sin(strand * 1.7) * 0.04, -8.06, originZ),
      ]);
      flute.add(
        new THREE.Mesh(new THREE.TubeGeometry(strandCurve, 18, 0.018, 7, false), tasselMaterial),
      );
    }

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2(3, 3);
    const baseFluteRotation = new THREE.Vector2(0, -0.42);
    const targetFluteRotation = baseFluteRotation.clone();
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let dragDistance = 0;
    const holes: THREE.Mesh[] = [];
    const particleCanvas = document.createElement("canvas");
    particleCanvas.width = 64;
    particleCanvas.height = 64;
    const particleContext = particleCanvas.getContext("2d");
    if (particleContext) {
      const particleGradient = particleContext.createRadialGradient(32, 32, 0, 32, 32, 31);
      particleGradient.addColorStop(0, "rgba(255, 246, 192, 1)");
      particleGradient.addColorStop(0.18, "rgba(255, 211, 92, .96)");
      particleGradient.addColorStop(0.52, "rgba(224, 151, 36, .46)");
      particleGradient.addColorStop(1, "rgba(180, 102, 20, 0)");
      particleContext.fillStyle = particleGradient;
      particleContext.fillRect(0, 0, 64, 64);
    }
    const particleTexture = new THREE.CanvasTexture(particleCanvas);
    particleTexture.colorSpace = THREE.SRGBColorSpace;
    const holeOffColor = new THREE.Color(0x101712);
    const holeOnColor = new THREE.Color(0x4b3517);
    const particleFields: {
      points: THREE.Points;
      positions: Float32Array;
      velocities: Float32Array;
      phases: Float32Array;
    }[] = [];
    const holeX = [-3.54, -2.17, -0.8, 0.8, 2.17, 3.54];
    holeX.forEach((x, index) => {
      const material = new THREE.MeshStandardMaterial({
        color: 0x101712,
        emissive: 0x000000,
        roughness: 0.7,
      });
      const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.155, 0.155, 0.045, 32), material);
      hole.position.set(0, x, 0.39);
      hole.rotation.x = Math.PI / 2;
      hole.userData.index = index;
      flute.add(hole);
      holes.push(hole);

      const particleCount = 52;
      const positions = new Float32Array(particleCount * 3);
      const velocities = new Float32Array(particleCount * 3);
      const phases = new Float32Array(particleCount);
      for (let particle = 0; particle < particleCount; particle += 1) {
        const offset = particle * 3;
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 0.14;
        positions[offset] = Math.cos(angle) * radius;
        positions[offset + 1] = Math.sin(angle) * radius * 0.65;
        positions[offset + 2] = Math.random() * 0.56;
        velocities[offset] = (Math.random() - 0.5) * 0.0045;
        velocities[offset + 1] = (Math.random() - 0.5) * 0.004;
        velocities[offset + 2] = 0.004 + Math.random() * 0.009;
        phases[particle] = Math.random() * Math.PI * 2;
      }
      const particleGeometry = new THREE.BufferGeometry();
      particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const particleMaterial = new THREE.PointsMaterial({
        map: particleTexture,
        color: 0xf0b94b,
        size: 0.075,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const points = new THREE.Points(particleGeometry, particleMaterial);
      points.position.set(0, x, 0.46);
      points.frustumCulled = false;
      points.renderOrder = 4;
      flute.add(points);
      particleFields.push({ points, positions, velocities, phases });
    });

    const updatePointer = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };
    const onDown = (event: PointerEvent) => {
      isDragging = true;
      dragDistance = 0;
      dragStartX = event.clientX;
      dragStartY = event.clientY;
      renderer.domElement.setPointerCapture(event.pointerId);
      updatePointer(event);
    };
    const onMove = (event: PointerEvent) => {
      updatePointer(event);
      if (!isDragging) return;
      const dx = event.clientX - dragStartX;
      const dy = event.clientY - dragStartY;
      dragDistance = Math.max(dragDistance, Math.hypot(dx, dy));
      targetFluteRotation.set(
        THREE.MathUtils.clamp(baseFluteRotation.x + dy * 0.004, -0.42, 0.42),
        THREE.MathUtils.clamp(baseFluteRotation.y + dx * 0.0045, -0.78, 0.08),
      );
    };
    const onUp = (event: PointerEvent) => {
      updatePointer(event);
      if (dragDistance < 7) {
        raycaster.setFromCamera(pointer, camera);
        const hit = raycaster.intersectObjects(holes, false)[0];
        if (hit) toggleHole(hit.object.userData.index as number);
      }
      isDragging = false;
      targetFluteRotation.copy(baseFluteRotation);
      renderer.domElement.releasePointerCapture(event.pointerId);
    };
    const onLeave = () => {
      isDragging = false;
      targetFluteRotation.copy(baseFluteRotation);
    };
    const onHover = () => {
      raycaster.setFromCamera(pointer, camera);
      renderer.domElement.style.cursor = isDragging
        ? "grabbing"
        : raycaster.intersectObjects(holes, false)[0]
          ? "pointer"
          : "grab";
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

    const clock = new THREE.Clock();
    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      raycaster.setFromCamera(pointer, camera);
      const hovered = raycaster.intersectObjects(holes, false)[0]?.object ?? null;
      if (!isDragging) renderer.domElement.style.cursor = hovered ? "pointer" : "grab";
      holes.forEach((hole, index) => {
        const material = hole.material as THREE.MeshStandardMaterial;
        const lit = bitsRef.current[index] === 1;
        const active = activeRef.current === index;
        material.color.lerp(lit ? holeOnColor : holeOffColor, 0.12);
        const pulse = active && lit ? 1 + Math.sin(time * 18) * 0.1 : 1;
        hole.scale.setScalar(pulse);

        const field = particleFields[index];
        const particleMaterial = field.points.material as THREE.PointsMaterial;
        const targetOpacity = active && lit ? 1 : lit ? 0.82 : 0;
        particleMaterial.opacity += (targetOpacity - particleMaterial.opacity) * 0.11;
        particleMaterial.size += ((active && lit ? 0.18 : 0.105) - particleMaterial.size) * 0.12;
        const speed = active && lit ? 3.4 : lit ? 1.25 : 0.22;
        const travelLimit = active && lit ? 1.9 : 1.08;
        for (let particle = 0; particle < field.phases.length; particle += 1) {
          const offset = particle * 3;
          field.positions[offset] +=
            field.velocities[offset] * speed + Math.sin(time * 3.2 + field.phases[particle]) * 0.0012;
          field.positions[offset + 1] +=
            field.velocities[offset + 1] * speed + Math.cos(time * 2.6 + field.phases[particle]) * 0.0009;
          field.positions[offset + 2] += field.velocities[offset + 2] * speed;
          if (field.positions[offset + 2] > travelLimit) {
            const angle = field.phases[particle] + time;
            const radius = Math.random() * 0.14;
            field.positions[offset] = Math.cos(angle) * radius;
            field.positions[offset + 1] = Math.sin(angle) * radius * 0.65;
            field.positions[offset + 2] = Math.random() * 0.08;
          }
        }
        (field.points.geometry.getAttribute("position") as THREE.BufferAttribute).needsUpdate = true;
      });
      flute.rotation.x +=
        (targetFluteRotation.x + Math.sin(time * 0.28) * 0.008 - flute.rotation.x) *
        (isDragging ? 0.17 : 0.075);
      flute.rotation.y +=
        (targetFluteRotation.y - flute.rotation.y) * (isDragging ? 0.17 : 0.075);
      onHover();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      timersRef.current.forEach(clearTimeout);
      renderer.domElement.removeEventListener("pointerdown", onDown);
      renderer.domElement.removeEventListener("pointermove", onMove);
      renderer.domElement.removeEventListener("pointerup", onUp);
      renderer.domElement.removeEventListener("pointerleave", onLeave);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      particleTexture.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  const sample = VOICE_SAMPLES[sampleIndex];
  return (
    <section
      className={`flute-exhibit ${introVisible ? "is-intro-visible" : ""}`}
      onWheel={(event) => {
        if (!hasPlayed || Math.abs(event.deltaY) < 4) return;
        event.preventDefault();
        setIntroVisible(event.deltaY > 0);
      }}
      onTouchStart={(event) => {
        touchStartYRef.current = event.changedTouches[0]?.clientY ?? null;
      }}
      onTouchEnd={(event) => {
        const startY = touchStartYRef.current;
        const endY = event.changedTouches[0]?.clientY;
        touchStartYRef.current = null;
        if (!hasPlayed || startY === null || endY === undefined) return;
        const distance = startY - endY;
        if (Math.abs(distance) < 42) return;
        setIntroVisible(distance > 0);
      }}
    >
      <div className="flute-stage" ref={mountRef} />
      <article className="voice-intro" aria-hidden={!introVisible} aria-live="polite">
        <p>VOICE ARCHIVE · {city} · 0{sampleIndex + 1}</p>
        <h3>{sample.title}</h3>
        <span>{sample.description}</span>
      </article>
      {hasPlayed && (
        <button
          className="voice-mobile-toggle"
          type="button"
          aria-expanded={introVisible}
          onClick={() => setIntroVisible((visible) => !visible)}
        >
          {introVisible ? "返回竹笛 ↓" : "查看介绍 ↑"}
        </button>
      )}
      <div className="flute-controls">
        <div className="flute-hole-selectors" aria-label="选择六个音孔">
          {bits.map((bit, index) => (
            <button
              className={`${bit ? "is-selected" : ""} ${activeHole === index ? "is-playing" : ""}`}
              type="button"
              key={index}
              aria-label={`第${index + 1}音孔，当前为${bit}`}
              aria-pressed={Boolean(bit)}
              onClick={() => toggleHole(index)}
            >
              {bit}
            </button>
          ))}
        </div>
        <div className="flute-transport">
          <button
            className={`flute-play ${activeHole >= 0 ? "is-playing" : ""}`}
            type="button"
            onClick={playPattern}
            aria-label="播放所选音孔"
          >
            <span aria-hidden="true">▶</span>
          </button>
          <button className="flute-switch" type="button" onClick={switchSample} aria-label="切换采样">
            <span aria-hidden="true">↻</span>
          </button>
        </div>
      </div>
    </section>
  );
}

const DIALECT_ITEMS = [
  { label: "声母", value: "送气与不送气", note: "比较不同年龄讲述者在自然语流中的起音差异。" },
  { label: "韵母", value: "开口度与鼻尾", note: "把同一词项的韵母变化放回具体地点与语境。" },
  { label: "声调", value: "调值与连读", note: "观察单字调进入句子后产生的节奏和调型变化。" },
];

function DialectDial() {
  const [active, setActive] = useState(0);
  return (
    <section className="dialect-dial">
      <div className="dial-rings" aria-label="方言观察三层字盘">
        {DIALECT_ITEMS.map((item, index) => (
          <button
            className={active === index ? "is-active" : ""}
            key={item.label}
            type="button"
            onClick={() => setActive(index)}
          >
            <span>{item.label}</span>
          </button>
        ))}
        <div className="dial-center">楚</div>
      </div>
      <div className="dial-detail">
        <p>{DIALECT_ITEMS[active].label}</p>
        <h3>{DIALECT_ITEMS[active].value}</h3>
        <span>{DIALECT_ITEMS[active].note}</span>
      </div>
    </section>
  );
}

const META: Record<ExhibitKind, { kicker: string; title: string; hint: string }> = {
  audio: { kicker: "01 · SOUND ARCHIVE", title: "竹笛声纹", hint: "点击音孔改写二进制，金光代表 1。" },
  dialect: { kicker: "02 · DIALECT OBSERVATION", title: "曾侯乙编钟", hint: "轻叩钟体，打开一则方言观察。" },
  field: { kicker: "03 · FIELD NOTES", title: "折扇影集", hint: "点击扇面查看图文，合扇后换一组。" },
};

export default function ResearchExhibit({ city, kind, onClose }: ExhibitProps) {
  const meta = META[kind];
  const [leaving, setLeaving] = useState(false);
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
  }, []);

  const closeWithTransition = () => {
    if (leaving) return;
    setLeaving(true);
    leaveTimerRef.current = setTimeout(onClose, 460);
  };

  return (
    <div className={`research-exhibit ${leaving ? "is-leaving" : ""}`}>
      <header className="exhibit-header">
        <button type="button" onClick={closeWithTransition}>← 返回城市成果</button>
        <div>
          <p>{meta.kicker} · {city}</p>
          <h2>{meta.title}</h2>
          <span>{meta.hint}</span>
        </div>
      </header>
      <main className="exhibit-body">
        {kind === "audio" && <BambooFlute city={city} />}
        {kind === "dialect" && <ThreeDialectDial />}
        {kind === "field" && <ThreeFanGallery city={city} />}
      </main>
    </div>
  );
}
