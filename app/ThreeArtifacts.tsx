"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

type FieldItem = {
  title: string;
  caption: string;
  image: string;
};

const ASSET_BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const item = (city: string, index: number, title: string, caption: string): FieldItem => ({
  title,
  caption,
  image: `/field-notes/${city}-${String(index).padStart(2, "0")}.webp`,
});

const CITY_FIELD_SETS: Record<string, FieldItem[][]> = {
  武汉: [
    [
      item("wuhan", 1, "江城抵达", "从列车进入城市的连续视野开始记录，观察交通流动如何改变方言的接触边界。"),
      item("wuhan", 2, "城市天际线", "高密度城区是多种口音并置的空间，也为普通话与武汉话的语码转换提供现场。"),
      item("wuhan", 3, "街区步行", "沿商业街区进行语言景观观察，记录招牌、叫卖与日常交谈中的地方表达。"),
      item("wuhan", 4, "旧街入口", "以街巷为节点追踪地方称谓和空间记忆，补充正式访谈之外的生活语料。"),
      item("wuhan", 5, "市井声场", "在人群密集处辨认语速、音量与句末语气，保留真实交流中的节奏特征。"),
      item("wuhan", 6, "现代江城", "新城区的人员流动强化了口音接触，也使青年群体呈现更灵活的语言选择。"),
    ],
    [
      item("wuhan", 7, "文化空间", "公共文化建筑构成城市记忆的坐标，语言材料也在展览、讲解与日常使用中被重新组织。"),
      item("wuhan", 8, "实践起点", "团队在出发前统一访谈提纲、录音编号和知情同意流程，确保材料可追溯。"),
      item("wuhan", 9, "站前观察", "交通枢纽中的短时交流能反映不同地域口音的接触、调适与身份识别。"),
      item("wuhan", 10, "地方建筑", "建筑名称、方位词与市民叙述共同构成可被听见的城市空间。"),
      item("wuhan", 11, "公共叙事", "通过场馆与公共标识核对地名读法、历史称谓及其当代使用方式。"),
      item("wuhan", 12, "行程归档", "将拍摄地点、访问时间与音频编号关联，为后续转写和方言比较建立索引。"),
    ],
  ],
  十堰: [
    [
      item("shiyan", 1, "山城途中", "列车穿行山地的空间经验，为理解十堰方言内部的地理差异提供背景。"),
      item("shiyan", 2, "城区入口", "从城市交通节点进入调查现场，记录公共空间中的口音混合与交际策略。"),
      item("shiyan", 3, "实践驻点", "团队确认当日样本对象、访问路线与设备状态，建立统一的田野记录格式。"),
      item("shiyan", 4, "山地街区", "地形与社区分布影响交往半径，也可能强化不同片区之间的语音差异。"),
      item("shiyan", 5, "社区边界", "在生活区入口观察熟人网络与公共交往，寻找自然对话的采样机会。"),
      item("shiyan", 6, "十堰东站", "交通枢纽连接鄂西北与外部城市，是观察人口流动和口音调适的重要节点。"),
    ],
    [
      item("shiyan", 7, "夜间抵达", "抵达后立即核对照片、录音和访谈日志，避免跨日整理造成材料错位。"),
      item("shiyan", 8, "暮色站房", "站前交谈常呈现短时、目的明确的语言选择，可与家庭场景中的自然语流对照。"),
      item("shiyan", 9, "沿途地貌", "山地聚落的距离和通达性，是解释方言差异时不可忽略的社会地理变量。"),
      item("shiyan", 10, "再次核验", "在十堰东站复核交通信息与采样计划，为不同调查点建立清晰的行程链。"),
      item("shiyan", 11, "田野夜记", "当日用简短备忘录记录语境、人物关系和观察者判断，作为音频文本的补充。"),
      item("shiyan", 12, "材料汇合", "集中整理车站、社区和访谈影像，形成可按地点与主题交叉检索的资料组。"),
    ],
  ],
  黄冈: [
    [
      item("huanggang", 1, "浠水抵达", "以浠水站为调查线索之一，将交通节点与周边社区的语言使用联系起来。"),
      item("huanggang", 2, "小组研判", "进入访谈前讨论受访者背景、提问顺序和记录分工，减少调查者对自然表达的干扰。"),
      item("huanggang", 3, "入户记录", "在家庭空间完成基础信息登记，并说明录音用途、匿名方式和撤回权利。"),
      item("huanggang", 4, "围坐访谈", "半结构式访谈从生活史进入方言词汇，再逐步过渡到更自然的叙述语流。"),
      item("huanggang", 5, "多人对话", "多人交谈能呈现话轮转换、称谓选择和熟人之间更稳定的地方语音特征。"),
      item("huanggang", 6, "词表核对", "用词表获得可比样本，同时允许讲述者补充本地词义、搭配和使用限制。"),
    ],
    [
      item("huanggang", 7, "夜行浠水", "夜间抵达与离开构成调查的时间坐标，也帮助复原每份材料的采集顺序。"),
      item("huanggang", 8, "站前广场", "公共空间的广播、问路和短时交谈，为正式访谈提供不同风格的对照材料。"),
      item("huanggang", 9, "地方门户", "站名与地名读法具有稳定的地方认同意义，可用于观察普通话化程度。"),
      item("huanggang", 10, "建筑与地名", "结合实体空间核对地方称谓，避免仅凭词表脱离真实指称和使用语境。"),
      item("huanggang", 11, "社区入口", "沿社区与村落边界寻找不同年龄层讲述者，建立具有代际可比性的样本。"),
      item("huanggang", 12, "现场复盘", "把影像、音频、词表和观察笔记统一编号，记录需要二次核实的疑点。"),
    ],
  ],
  黄石: [
    [
      item("huangshi", 1, "家庭场景", "家庭空间有利于降低访谈压力，使讲述者回到更接近日常交流的语言风格。"),
      item("huangshi", 2, "街面寻访", "团队通过社区走访寻找合适的讲述者，并记录熟人网络提供的地点线索。"),
      item("huangshi", 3, "路线讨论", "现场及时调整访问顺序，把可用时间优先分配给具有代际差异的样本。"),
      item("huangshi", 4, "社区交谈", "在室外自然场景中观察招呼语、指路表达和地方词汇的即时使用。"),
      item("huangshi", 5, "同行记录", "调查员分别承担提问、录音、摄影与笔记，减少单一记录遗漏的风险。"),
      item("huangshi", 6, "步行调查", "步行路径串联居住区与公共空间，帮助理解语言材料对应的社会环境。"),
    ],
    [
      item("huangshi", 7, "山林路径", "自然地貌和聚落通道影响居民往来，也为解释地方语音边界提供参照。"),
      item("huangshi", 8, "村落院落", "院落中的生产生活器物能够引出地方物名、动作词和传统经验叙述。"),
      item("huangshi", 9, "生活现场", "不预设答案地观察日常活动，让词汇从具体物件和动作中自然出现。"),
      item("huangshi", 10, "口述环境", "家庭陈设、人物关系与在场者反应都会影响叙述方式，应与录音一并记录。"),
      item("huangshi", 11, "城市夜景", "城市公共空间呈现工业记忆与现代生活的叠合，也映照地方身份的表达。"),
      item("huangshi", 12, "夜间回访", "在较轻松的时段补充遗漏问题，并邀请讲述者解释前次材料中的地方词。"),
    ],
  ],
};

function makePhotoTexture(item: FieldItem) {
  const texture = new THREE.TextureLoader().load(`${ASSET_BASE}${item.image}`);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function PhotoPreview({ item }: { item: FieldItem }) {
  return (
    <img
      className="field-photo-preview"
      src={`${ASSET_BASE}${item.image}`}
      alt={item.title}
    />
  );
}

export function ThreeFanGallery({ city }: { city: string }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [setIndex, setSetIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [detailVisible, setDetailVisible] = useState(false);
  const selectedRef = useRef(0);
  const openRef = useRef(true);
  const [isOpen, setIsOpen] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cityKey = city.replace(/市$/, "");
  const fieldSets = CITY_FIELD_SETS[cityKey] ?? CITY_FIELD_SETS.武汉;
  const items = fieldSets[setIndex % fieldSets.length];

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
      setSetIndex((current) => (current + 1) % fieldSets.length);
      setSelectedIndex(0);
      setIsOpen(true);
    }, 760);
  };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 50);
    camera.position.set(0, 0.8, 15.8);
    camera.lookAt(0, 0.2, 0);
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
    fan.position.y = -2.1;
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
    const leafPositions = leafGeometry.getAttribute("position") as THREE.BufferAttribute;
    const leafUvs = leafGeometry.getAttribute("uv") as THREE.BufferAttribute;
    for (let vertex = 0; vertex < leafPositions.count; vertex += 1) {
      leafUvs.setXY(
        vertex,
        THREE.MathUtils.clamp((leafPositions.getX(vertex) + 1.36) / 2.72, 0, 1),
        THREE.MathUtils.clamp(leafPositions.getY(vertex) / 5.65, 0, 1),
      );
    }
    leafUvs.needsUpdate = true;
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
        color: 0xffffff,
        roughness: 0.66,
        metalness: 0.03,
        clearcoat: 0.08,
        emissive: 0x6b4d1f,
        emissiveIntensity: 0,
      });
      const leaf = new THREE.Mesh(leafGeometry, material);
      leaf.userData.index = index;
      leafGroup.add(leaf);
      leaves.push(leaf);
      const rib = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 5.9, 0.15),
        new THREE.MeshPhysicalMaterial({
          color: 0x81562b,
          roughness: 0.4,
          metalness: 0.08,
          clearcoat: 0.18,
        }),
      );
      rib.position.set(0.8, 2.75, 0.11);
      rib.rotation.z = -0.19;
      leafGroup.add(rib);
      const rimCap = new THREE.Mesh(
        new THREE.BoxGeometry(2.7, 0.085, 0.13),
        new THREE.MeshStandardMaterial({ color: 0xa87836, roughness: 0.42, metalness: 0.12 }),
      );
      rimCap.position.set(0, 5.61, 0.12);
      leafGroup.add(rimCap);
      const paperBand = new THREE.Mesh(
        new THREE.BoxGeometry(2.3, 0.026, 0.075),
        new THREE.MeshStandardMaterial({ color: 0xd1ad61, roughness: 0.6, metalness: 0.08 }),
      );
      paperBand.position.set(0, 4.72, 0.13);
      leafGroup.add(paperBand);
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
    value: "清音系统与发音部位",
    note: "湖北境内方言的声母格局既受官话共同特征支配，也保留明显的地域差异。考察重点包括塞音、塞擦音的送气对立，古全浊声母今读送气或不送气的分化，以及舌尖前音、舌尖后音和舌面音之间的合流。武汉、黄冈、黄石与鄂西北地区在知庄章组、精见组等历史来源上的对应关系并不完全相同。",
    method: "以声母最小对立词和同源字表为基础，结合自由交谈中的自然语流；用声谱图观察爆破时刻与嗓音起始时间（VOT），同时记录年龄、教育经历和语言使用场景。",
  },
  {
    label: "02 · 韵母",
    value: "元音格局与韵尾演变",
    note: "韵母调查关注单元音的舌位与圆唇度、复元音的滑动方向，以及鼻韵尾和入声遗迹。不同地点可能出现前后鼻音合并、韵腹高化或低化、介音脱落等现象；这些变化往往同时受到地理接触、普通话输入和本地方言内部演变的影响。",
    method: "选取覆盖开齐合撮四呼的常用字词，测量稳定段的第一、第二共振峰（F1/F2），再用同一讲述者的词表读音与自然话语互证，避免把风格差异误判为地域差异。",
  },
  {
    label: "03 · 声调",
    value: "调类、调值与连读变调",
    note: "声调不能只看孤立单字。中古平、上、去、入各调类在湖北方言中的今读分化，与清浊条件、音节结构和区域接触有关；进入双音节词和句子后，基频曲线还会受到重音、语速、句末语气与前后音节的共同调节。",
    method: "先建立单字调的五度标记，再采集双音节组合和完整陈述句；对基频进行说话人归一化，区分音系性的变调规则与生理音域、焦点重音造成的语音变化。",
  },
  {
    label: "04 · 词汇",
    value: "地方词项与语义系统",
    note: "地方词汇承载具体的生产方式、亲属网络和生活经验。调查不仅记录“怎么说”，还要确认词义范围、感情色彩、搭配限制和使用对象；同一个形式在邻近地区可能对应不同意义，同一概念也可能因年龄和职业产生多套表达。",
    method: "以亲属称谓、饮食、农事、身体动作和日常器物为语义场，通过实物指认、情境提问与自由叙述交叉核验，并标注词项的活跃程度、替代形式和使用者年龄层。",
  },
  {
    label: "05 · 语流",
    value: "连读音变与韵律组织",
    note: "自然语流中的方言特征常比词表读音更丰富。音节在连续表达中会发生弱化、同化、增音、脱落与边界重组；停顿位置、节奏单位和句末语气词则共同塑造地方口音的听感。仅依靠逐字朗读，容易遗漏这些系统性现象。",
    method: "保留访谈中的完整话轮，按语调短语切分并制作精细转写；将同一词项在朗读、复述和自由交谈中的实现进行对照，记录语速与信息结构对音变的影响。",
  },
  {
    label: "06 · 代际",
    value: "语言变异与代际迁移",
    note: "老、中、青三代之间的差异可以揭示正在进行的语言变化。青年讲述者往往在学校、网络和跨城流动中增加普通话使用，但这种变化并非简单的“方言消失”：地方特征可能转移到语调、语气词或身份表达中，并在亲密场景里重新出现。",
    method: "采用表观时间研究设计，在性别、教育与社区背景尽量可比的条件下分层取样；分别记录家庭、同伴和正式访谈场景，分析语言选择与社会身份之间的关联。",
  },
  {
    label: "07 · 场景",
    value: "语域、语码转换与身份",
    note: "讲述者会根据对象、地点与话题调整表达方式：面对家人可能使用更密集的地方形式，面对陌生访谈者则趋向普通话；当话题转向童年、劳动或地方记忆时，方言又可能自然回归。这种切换本身就是重要的社会语言学材料。",
    method: "在取得同意后记录不同参与者组合的对话，并同步写下人物关系、场所、话题与在场者反应；分析切换发生的位置及其交际功能，而不是把所有非普通话形式简单归为“口音”。",
  },
  {
    label: "08 · 记忆",
    value: "口述传统与地方记忆",
    note: "方言材料既是语言结构的证据，也是地方知识的载体。地名读法、行业称谓、童谣、迁徙故事与家庭叙事把声音连接到具体空间和代际经验；保存这些材料时，需要同时尊重讲述者的解释权、隐私与文化语境。",
    method: "将音频、照片、地点、人物关系和关键词建立同一索引，保留原始录音与校订转写两个版本；对涉及个人经历的材料进行匿名化，并记录授权范围与后续使用条件。",
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
        bellGroup.scale.set(scale * 1.22, scale, scale);
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
        <div className="dial-copy">
          <p>{DIALECT_ITEMS[active].note}</p>
          <p><b>观察方法</b>{DIALECT_ITEMS[active].method}</p>
        </div>
      </article>
    </section>
  );
}
