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
        if (hit) setSelectedIndex(hit.object.userData.index as number);
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
    <section className="fan-exhibit">
      <div className="three-fan-stage" ref={mountRef} />
      <p className="gesture-hint">拖动折扇查看侧面 · 松手自动复位</p>
      <button className="fan-change" type="button" onClick={changeSet}>合扇 · 换一组</button>
      <article className="photo-detail" key={`${setIndex}-${selectedIndex}`} aria-live="polite">
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
  { label: "声母", value: "送气与不送气", note: "比较不同年龄讲述者在自然语流中的起音差异。" },
  { label: "韵母", value: "开口度与鼻尾", note: "把同一词项的韵母变化放回具体地点与语境。" },
  { label: "声调", value: "调值与连读", note: "观察单字调进入句子后产生的节奏和调型变化。" },
];

function makeLabelTexture(label: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  if (context) {
    context.clearRect(0, 0, 256, 128);
    context.fillStyle = "#ead395";
    context.font = "500 48px serif";
    context.textAlign = "center";
    context.fillText(label, 128, 76);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function ThreeDialectDial() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(active);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 50);
    camera.position.set(0, 0.5, 15.4);
    camera.lookAt(0, 0, 0);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.setAttribute("aria-label", "可旋转的三维方言观察字盘");
    renderer.domElement.setAttribute("role", "img");
    mount.appendChild(renderer.domElement);
    scene.add(new THREE.HemisphereLight(0xefe5c9, 0x07110d, 2.1));
    const key = new THREE.DirectionalLight(0xffd477, 5.2);
    key.position.set(-4, 5, 8);
    scene.add(key);
    const dial = new THREE.Group();
    dial.rotation.x = -0.12;
    scene.add(dial);
    const baseRotation = new THREE.Vector2(-0.12, 0);
    const targetRotation = baseRotation.clone();
    const rings: THREE.Mesh[] = [];
    const ringGroups: THREE.Group[] = [];
    const textures: THREE.Texture[] = [];
    [4.2, 3.2, 2.2].forEach((radius, index) => {
      const group = new THREE.Group();
      dial.add(group);
      ringGroups.push(group);
      const material = new THREE.MeshPhysicalMaterial({
        color: index === 0 ? 0x486f5d : index === 1 ? 0x6d7252 : 0x8a7447,
        emissive: 0xd5a84d,
        emissiveIntensity: 0,
        roughness: 0.3,
        metalness: 0.38,
        clearcoat: 0.26,
      });
      const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.1, 20, 160), material);
      ring.userData.index = index;
      group.add(ring);
      rings.push(ring);
      for (let tick = 0; tick < 16; tick += 1) {
        const angle = (tick / 16) * Math.PI * 2;
        const mark = new THREE.Mesh(
          new THREE.BoxGeometry(0.055, 0.28, 0.08),
          new THREE.MeshStandardMaterial({ color: 0xb99c5a, roughness: 0.42 }),
        );
        mark.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
        mark.rotation.z = angle;
        group.add(mark);
      }
      const texture = makeLabelTexture(DIALECT_ITEMS[index].label);
      textures.push(texture);
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }));
      sprite.scale.set(1.35, 0.68, 1);
      sprite.position.set(0, radius + 0.45, 0.08);
      group.add(sprite);
    });
    const center = new THREE.Mesh(
      new THREE.CylinderGeometry(0.72, 0.72, 0.25, 64),
      new THREE.MeshPhysicalMaterial({ color: 0xd0a84f, roughness: 0.25, metalness: 0.65 }),
    );
    center.rotation.x = Math.PI / 2;
    dial.add(center);

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
        renderer.domElement.style.cursor = raycaster.intersectObjects(rings, false)[0] ? "pointer" : "grab";
        return;
      }
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      moved = Math.max(moved, Math.hypot(dx, dy));
      targetRotation.set(
        THREE.MathUtils.clamp(baseRotation.x + dy * 0.0045, -0.58, 0.34),
        THREE.MathUtils.clamp(dx * 0.0045, -0.62, 0.62),
      );
    };
    const onUp = (event: PointerEvent) => {
      setPointer(event);
      if (moved < 7) {
        raycaster.setFromCamera(pointer, camera);
        const hit = raycaster.intersectObjects(rings, false)[0];
        if (hit) setActive(hit.object.userData.index as number);
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
    const clock = new THREE.Clock();
    const animate = () => {
      frame = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      ringGroups.forEach((group, index) => {
        const direction = index % 2 === 0 ? 1 : -1;
        const targetZ = activeRef.current === index ? direction * 0.42 : 0;
        group.rotation.z += (targetZ - group.rotation.z) * 0.045;
        const material = rings[index].material as THREE.MeshPhysicalMaterial;
        material.emissiveIntensity += ((activeRef.current === index ? 0.6 : 0.05) - material.emissiveIntensity) * 0.09;
        if (activeRef.current === index) group.position.z = 0.12 + Math.sin(elapsed * 2) * 0.015;
        else group.position.z += (0 - group.position.z) * 0.08;
      });
      dial.rotation.x += (targetRotation.x - dial.rotation.x) * (pressed ? 0.16 : 0.075);
      dial.rotation.y += (targetRotation.y - dial.rotation.y) * (pressed ? 0.16 : 0.075);
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
  }, []);

  return (
    <section className="three-dialect-exhibit">
      <div className="three-dial-stage" ref={mountRef} />
      <p className="gesture-hint">拖动字盘查看结构 · 松手自动复位 · 点击圆环切换观察层</p>
      <div className="dial-detail" key={active}>
        <p>{DIALECT_ITEMS[active].label}</p>
        <h3>{DIALECT_ITEMS[active].value}</h3>
        <span>{DIALECT_ITEMS[active].note}</span>
      </div>
    </section>
  );
}
