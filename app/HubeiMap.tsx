"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { geoMercator, geoPath } from "d3-geo";

type Position = [number, number];
type CityFeature = {
  type: "Feature";
  properties: { name: string; adcode: number };
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: Position[][] | Position[][][];
  };
};
type CityCollection = { type: "FeatureCollection"; features: CityFeature[] };

const CITY_STORIES: Record<string, { title: string; line: string; focus: string }> = {
  武汉市: { title: "江城声腔", line: "三镇交汇，市井与码头共同塑造了爽利、鲜活的城市表达。", focus: "城市口语 · 行业记忆" },
  宜昌市: { title: "峡江回声", line: "江河、移民与山地生活，在鄂西的语音和叙事中留下层层回响。", focus: "峡江叙事 · 迁徙记忆" },
  襄阳市: { title: "汉水乡音", line: "沿汉水展开的交往，让古城语言保留着南北相逢的独特气质。", focus: "古城口述 · 汉水文化" },
  恩施土家族苗族自治州: { title: "山地多声部", line: "多民族语言长期接触，让武陵山区拥有丰富而细腻的声音层次。", focus: "语言接触 · 民族文化" },
  黄冈市: { title: "大别山语脉", line: "山地聚落与跨区域往来，共同保存着鄂东富有辨识度的乡音。", focus: "乡村叙事 · 代际变化" },
  荆州市: { title: "江汉旧声", line: "古城、湖区与平原生活交织，方言连接着市井日常和楚地旧忆。", focus: "古城生活 · 地方词汇" },
  十堰市: { title: "山城声景", line: "秦巴山地的迁徙与工业记忆，让这里的语言呈现多源交汇。", focus: "工业记忆 · 移民表达" },
};

const fallbackStory = (name: string) => ({
  title: name.replace(/市|自治州|林区/g, "") + "乡音",
  line: "从日常称谓到地方叙事，我们以真实对话记录这座城市的语言温度。",
  focus: "田野录音 · 口述档案",
});

export default function HubeiMap() {
  const mountRef = useRef<HTMLDivElement>(null);
  const focusRef = useRef<(name: string | null) => void>(() => undefined);
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const selectedRef = useRef<string | null>(null);

  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let frameId = 0;
    let disposed = false;
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x071512, 0.027);

    const mapScale = 1.35;
    const mapOffsetX = 0;
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    const homePosition = new THREE.Vector3(mapOffsetX, -19.5, 21);
    const homeTarget = new THREE.Vector3(mapOffsetX, 0, 0.3);
    const cameraTarget = homeTarget.clone();
    const desiredPosition = homePosition.clone();
    const desiredTarget = cameraTarget.clone();
    camera.position.copy(homePosition);
    camera.lookAt(cameraTarget);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute("aria-label", "湖北省地级市三维互动地图");
    renderer.domElement.setAttribute("role", "img");
    mount.appendChild(renderer.domElement);

    const ambient = new THREE.HemisphereLight(0xc8f2df, 0x04110e, 3.4);
    scene.add(ambient);
    const keyLight = new THREE.DirectionalLight(0xffedc2, 6.2);
    keyLight.position.set(-7, -8, 18);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    scene.add(keyLight);
    const rimLight = new THREE.PointLight(0x2fae84, 30, 36);
    rimLight.position.set(9, 8, 8);
    scene.add(rimLight);

    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(16, 72),
      new THREE.MeshStandardMaterial({
        color: 0x071915,
        roughness: 0.92,
        metalness: 0.08,
        transparent: true,
        opacity: 0.82,
      }),
    );
    ground.position.z = -0.32;
    ground.receiveShadow = true;
    scene.add(ground);

    const rings = new THREE.Group();
    [10.8, 12.7, 14.6].forEach((radius, index) => {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(radius, radius + 0.012, 120),
        new THREE.MeshBasicMaterial({
          color: index === 0 ? 0x4c806c : 0x285246,
          transparent: true,
          opacity: 0.22 - index * 0.045,
          side: THREE.DoubleSide,
        }),
      );
      ring.position.z = -0.27;
      rings.add(ring);
    });
    scene.add(rings);

    const mapGroup = new THREE.Group();
    mapGroup.rotation.x = -0.08;
    mapGroup.position.x = mapOffsetX;
    mapGroup.scale.setScalar(mapScale);
    scene.add(mapGroup);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2(3, 3);
    const cityMeshes: THREE.Mesh[] = [];
    const cityGroups = new Map<string, THREE.Group>();
    const cityMaterials = new Map<string, THREE.MeshStandardMaterial>();
    const cityCentroids = new Map<string, THREE.Vector2>();
    const edgeLines: THREE.LineSegments[] = [];
    const boundaryMaterial = new THREE.LineBasicMaterial({
      color: 0xd8bf84,
      transparent: true,
      opacity: 0.56,
    });
    let currentHover: string | null = null;
    let pointerDown = { x: 0, y: 0 };

    const setFocus = (name: string | null) => {
      setSelected(name);
      selectedRef.current = name;
      if (!name) {
        desiredPosition.copy(homePosition);
        desiredTarget.copy(homeTarget);
        return;
      }
      const c = cityCentroids.get(name);
      if (!c) return;
      const worldX = c.x * mapScale + mapOffsetX;
      const worldY = c.y * mapScale;
      desiredTarget.set(worldX - 3.2, worldY, 1.1);
      desiredPosition.set(worldX - 3.2, worldY - 10.5, 12.4);
    };
    focusRef.current = setFocus;

    const buildMap = async () => {
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
      const response = await fetch(`${basePath}/hubei-cities.json`);
      const data = (await response.json()) as CityCollection;
      if (disposed) return;

      const projection = geoMercator().fitExtent(
        [[0.4, 0.4], [17.6, 12.6]],
        data as never,
      );
      const path = geoPath(projection);

      data.features.forEach((feature, featureIndex) => {
        const name = feature.properties.name;
        const material = new THREE.MeshStandardMaterial({
          color: featureIndex % 3 === 0 ? 0x5b9b80 : featureIndex % 3 === 1 ? 0x4c866f : 0x68a58b,
          emissive: 0x07110e,
          emissiveIntensity: 0.24,
          roughness: 0.48,
          metalness: 0.28,
          side: THREE.DoubleSide,
        });
        cityMaterials.set(name, material);

        const group = new THREE.Group();
        group.userData.cityName = name;
        cityGroups.set(name, group);
        mapGroup.add(group);

        const polygons =
          feature.geometry.type === "Polygon"
            ? [feature.geometry.coordinates as Position[][]]
            : (feature.geometry.coordinates as Position[][][]);

        polygons.forEach((polygon) => {
          if (!polygon[0] || polygon[0].length < 3) return;
          const shape = new THREE.Shape();
          polygon.forEach((ring, ringIndex) => {
            const target = ringIndex === 0 ? shape : new THREE.Path();
            ring.forEach((coordinate, pointIndex) => {
              const projected = projection(coordinate);
              if (!projected) return;
              const x = projected[0] - 9;
              const y = -(projected[1] - 6.5);
              if (pointIndex === 0) target.moveTo(x, y);
              else target.lineTo(x, y);
            });
            target.closePath();
            if (ringIndex > 0) shape.holes.push(target as THREE.Path);
          });

          const geometry = new THREE.ExtrudeGeometry(shape, {
            depth: 0.46,
            bevelEnabled: true,
            bevelThickness: 0.045,
            bevelSize: 0.035,
            bevelSegments: 2,
          });
          const mesh = new THREE.Mesh(geometry, material);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          mesh.userData.cityName = name;
          group.add(mesh);
          cityMeshes.push(mesh);

          const outline = new THREE.LineSegments(
            new THREE.EdgesGeometry(geometry, 24),
            boundaryMaterial,
          );
          outline.position.z = 0.012;
          group.add(outline);
          edgeLines.push(outline);
        });

        const center = path.centroid(feature as never);
        cityCentroids.set(name, new THREE.Vector2(center[0] - 9, -(center[1] - 6.5)));
      });
    };

    buildMap().catch(() => {
      setHovered("地图数据加载失败，请刷新页面");
    });

    const updatePointer = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      mount.style.setProperty("--pointer-x", `${event.clientX - rect.left}px`);
      mount.style.setProperty("--pointer-y", `${event.clientY - rect.top}px`);
    };
    const onPointerMove = (event: PointerEvent) => updatePointer(event);
    const onPointerDown = (event: PointerEvent) => {
      pointerDown = { x: event.clientX, y: event.clientY };
      updatePointer(event);
    };
    const onPointerUp = (event: PointerEvent) => {
      const moved = Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y);
      if (moved < 8 && currentHover) setFocus(currentHover);
    };
    const onPointerLeave = () => {
      pointer.set(3, 3);
      currentHover = null;
      setHovered(null);
    };
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointerup", onPointerUp);
    renderer.domElement.addEventListener("pointerleave", onPointerLeave);

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
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(cityMeshes, false)[0];
      const nextHover = hit ? (hit.object.userData.cityName as string) : null;
      if (nextHover !== currentHover) {
        currentHover = nextHover;
        setHovered(nextHover);
        renderer.domElement.style.cursor = nextHover ? "pointer" : "grab";
      }

      cityGroups.forEach((group, name) => {
        const isSelected = selectedRef.current === name;
        const isHovered = currentHover === name;
        const targetZ = isSelected ? 1.12 : isHovered ? 0.58 : 0;
        group.position.z += (targetZ - group.position.z) * 0.12;
        const material = cityMaterials.get(name);
        if (material) {
          const targetColor = new THREE.Color(isSelected ? 0xe1bc70 : isHovered ? 0x8fd0ae : 0x568d76);
          material.color.lerp(targetColor, 0.1);
          material.emissiveIntensity += ((isSelected ? 0.8 : isHovered ? 0.5 : 0.2) - material.emissiveIntensity) * 0.1;
        }
      });

      camera.position.lerp(desiredPosition, 0.055);
      cameraTarget.lerp(desiredTarget, 0.06);
      camera.lookAt(cameraTarget);
      rings.rotation.z = elapsed * 0.008;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      observer.disconnect();
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("pointerleave", onPointerLeave);
      cityMeshes.forEach((mesh) => mesh.geometry.dispose());
      edgeLines.forEach((line) => line.geometry.dispose());
      cityMaterials.forEach((material) => material.dispose());
      boundaryMaterial.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  const story = selected ? CITY_STORIES[selected] ?? fallbackStory(selected) : null;

  return (
    <div className={`map-layer ${selected ? "has-selection" : ""}`} ref={mountRef}>
      <div className={`map-prompt ${selected ? "is-hidden" : ""}`}>
        <span>乡音楚韵</span>
        <small>移动鼠标，选择一座城市</small>
      </div>
      <div className={`city-tooltip ${hovered ? "is-visible" : ""}`} aria-live="polite">
        <span>{hovered}</span>
        {hovered && !hovered.includes("失败") && <small>点击进入</small>}
      </div>
      <aside className={`city-story ${selected ? "is-visible" : ""}`} aria-hidden={!selected}>
        {story && (
          <>
            <button className="story-close" type="button" onClick={() => focusRef.current(null)}>
              ← 返回地图
            </button>
            <p className="story-kicker">DIALECT FIELD NOTES · {selected}</p>
            <h2>{story.title}</h2>
            <p>{story.line}</p>
            <div className="story-meta">
              <span>研究切面</span>
              <strong>{story.focus}</strong>
            </div>
            <div className="result-list">
              <article>
                <span>01</span>
                <div>
                  <h3>声音档案</h3>
                  <p>自然对话、方言词表与地方叙事录音</p>
                </div>
              </article>
              <article>
                <span>02</span>
                <div>
                  <h3>方言观察</h3>
                  <p>语音特点、地方词汇与代际使用差异</p>
                </div>
              </article>
              <article>
                <span>03</span>
                <div>
                  <h3>田野手记</h3>
                  <p>城市生活、乡土文化与口述记忆</p>
                </div>
              </article>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
