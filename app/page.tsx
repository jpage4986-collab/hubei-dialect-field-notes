import HubeiMap from "./HubeiMap";

const archiveItems = [
  {
    no: "01",
    title: "田野声音档案",
    text: "以自然对话、词表调查与地方叙事三类材料，保存方言最鲜活的声音现场。",
    tag: "VOICE ARCHIVE",
  },
  {
    no: "02",
    title: "湖北方言图谱",
    text: "把语音、词汇与表达差异落到城市空间中，让地域之间的联系清晰可见。",
    tag: "DIALECT ATLAS",
  },
  {
    no: "03",
    title: "乡音口述史",
    text: "从人的生命经验出发，记录方言背后的迁徙、行业、饮食与日常记忆。",
    tag: "ORAL HISTORY",
  },
  {
    no: "04",
    title: "青年传播实践",
    text: "将研究转化为短片、声音明信片和互动展览，让乡音被更多年轻人听见。",
    tag: "YOUTH ACTION",
  },
];

const steps = [
  ["01 / 抵达", "走进社区与村落，建立在地联系"],
  ["02 / 倾听", "访谈不同年龄与职业的方言使用者"],
  ["03 / 标注", "整理语音、词汇与叙事材料"],
  ["04 / 回响", "以数字展陈把研究带回公众"],
];

export default function Home() {
  return (
    <main>
      <HubeiMap />

      <header className="site-header">
        <a className="brand" href="#top" aria-label="乡音楚韵首页">
          <span className="brand-mark">楚</span>
          <span>
            <strong>乡音楚韵</strong>
            <small>湖北方言社会实践</small>
          </span>
        </a>
        <nav aria-label="主导航">
          <a href="#map-guide">方言地图</a>
          <a href="#archive">实践成果</a>
          <a href="#method">调研方法</a>
        </nav>
        <span className="edition">FIELD NOTES · 2026</span>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">HUBEI DIALECT FIELD STUDY</p>
          <h1>
            一方水土，
            <br />
            <em>一城乡音。</em>
          </h1>
          <p className="lead">
            我们走进荆楚大地，以声音为线索，
            <br />
            寻找一座城市的性格与一代人的记忆。
          </p>
          <a className="primary-link" href="#map-guide">
            开始探索 <span>↘</span>
          </a>
        </div>
        <div className="hero-index" aria-hidden="true">
          <span>30°32′N</span>
          <i />
          <span>114°20′E</span>
        </div>
        <div className="scroll-cue">
          <span>向下浏览</span>
          <i />
        </div>
      </section>

      <section className="map-guide" id="map-guide">
        <div className="section-kicker">
          <span>INTERACTIVE SANDBOX</span>
          <span>01 — 方言地图</span>
        </div>
        <div className="map-guide-copy">
          <p>移动鼠标，唤醒一座城市</p>
          <h2>
            触碰地图，
            <br />
            听见湖北。
          </h2>
          <p className="section-note">
            城市悬浮时会从沙盘中抬升；点击后，镜头将聚焦该城市，并打开对应的方言研究卡片。
          </p>
        </div>
        <div className="interaction-hint">
          <span className="mouse-icon" aria-hidden="true" />
          <span>悬浮 / 点击城市</span>
        </div>
      </section>

      <section className="archive-section" id="archive">
        <div className="section-kicker">
          <span>OUR OUTCOMES</span>
          <span>02 — 实践成果</span>
        </div>
        <div className="archive-heading">
          <h2>把乡音，留在时间里。</h2>
          <p>
            从田野录音到数字展陈，我们尝试建立一份可听、可读、可持续生长的湖北方言档案。
          </p>
        </div>

        <div className="archive-grid">
          {archiveItems.map((item) => (
            <article key={item.no} className="archive-card">
              <div className="card-top">
                <span>{item.no}</span>
                <span>{item.tag}</span>
              </div>
              <div className={`card-visual visual-${item.no}`}>
                <span className="visual-glyph" aria-hidden="true">
                  {item.no === "01" ? "≋" : item.no === "02" ? "⌖" : item.no === "03" ? "◌" : "↗"}
                </span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
        <p className="template-note">
          当前为内容结构示例，可替换为团队的真实录音数量、访谈对象、调研照片与成果链接。
        </p>
      </section>

      <section className="method-section" id="method">
        <div className="section-kicker">
          <span>FIELDWORK ROUTE</span>
          <span>03 — 调研方法</span>
        </div>
        <div className="method-layout">
          <div>
            <p className="chapter-mark">从地图到人</p>
            <h2>研究不是采集，<br />而是一场相遇。</h2>
          </div>
          <ol className="method-list">
            {steps.map(([title, detail]) => (
              <li key={title}>
                <strong>{title}</strong>
                <span>{detail}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <footer>
        <div className="brand footer-brand">
          <span className="brand-mark">楚</span>
          <span>
            <strong>乡音楚韵</strong>
            <small>让每一种乡音，都被认真听见</small>
          </span>
        </div>
        <p>湖北方言社会实践成果展示 · 网站内容可按团队资料继续完善</p>
      </footer>
    </main>
  );
}
