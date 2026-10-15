"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { ArrowUpIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SPINE, type Block } from "@/lib/stages";
import "./roadmap.css";

type Topic = { title: string; content: string } | null;
type Detail = { id: string; text: string; topic?: Topic } | null; // topic undefined = loading
type Line = { d: string; dashed: boolean };

const tone = (t: string) => (t[0] === "~" ? "blue" : t[0] === "_" ? "white" : "");
const clean = (t: string) => (/^[~_]/.test(t) ? t.slice(1) : t);

function Box(p: { id: string; text: string; className: string; on: boolean; onOpen: (id: string, text: string) => void }) {
  const open = () => p.onOpen(p.id, clean(p.text));
  return (
    <div
      className={`${p.className}${p.on ? " done" : ""}`}
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } }}
    >
      {clean(p.text)}
    </div>
  );
}

const countBlock = (b?: Block) =>
  !b ? 0 : b.kind === "list" ? b.items.length
  : b.sections.reduce((n, s) => n + s.items.length + (s.head && s.box ? 1 : 0), 0);

export default function Roadmap() {
  const [done, setDone] = useState<Set<string>>(new Set());
  const [detail, setDetail] = useState<Detail>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    fetch("/api/progress").then((r) => r.json()).then((k: string[]) => setDone(new Set(k))).catch(() => {});
  }, []);

  const toggle = (id: string) => {
    const on = !done.has(id);
    setDone((prev) => { const n = new Set(prev); if (on) n.add(id); else n.delete(id); return n; });
    fetch("/api/progress", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: id, done: on }) }).catch(() => {});
  };
  const reset = () => { setDone(new Set()); fetch("/api/progress", { method: "DELETE" }).catch(() => {}); };

  const open = async (id: string, text: string) => {
    setDetail({ id, text });
    try {
      const topic: Topic = await fetch(`/api/topics?q=${encodeURIComponent(text)}`).then((r) => r.json());
      setDetail({ id, text, topic });
    } catch { setDetail({ id, text, topic: null }); }
  };

  // measure boxes -> build SVG paths (plain numbers, no CSS variables)
  const measure = useCallback(() => {
    const main = mainRef.current;
    if (!main) return;
    const b = main.getBoundingClientRect();
    const R = (el: Element) => {
      const r = el.getBoundingClientRect();
      return { l: r.left - b.left, r: r.right - b.left, t: r.top - b.top, b: r.bottom - b.top,
        cx: (r.left + r.right) / 2 - b.left, cy: (r.top + r.bottom) / 2 - b.top };
    };
    const out: Line[] = [];
    const cores = Array.from(main.querySelectorAll(".core"));
    const spine = Array.from(main.querySelectorAll(".spine"));
    if (spine.length && cores.length) {
      const first = R(spine[0]);
      const last = R(cores[cores.length - 1]);
      out.push({ d: `M${first.cx} ${first.t} L${first.cx} ${last.b}`, dashed: false });
      const keep = main.querySelector(".keep");
      if (keep) out.push({ d: `M${first.cx} ${last.b} L${first.cx} ${R(keep).t}`, dashed: true });
    }
    main.querySelectorAll(".row").forEach((row) => {
      const c = row.querySelector(".core");
      if (!c) return;
      const core = R(c);
      row.querySelectorAll(".blk").forEach((blk) => {
        const left = blk.parentElement!.classList.contains("l");
        const x1 = left ? core.l : core.r;
        const targets = blk.getAttribute("data-kind") === "list" ? Array.from(blk.querySelectorAll(".item")) : [blk];
        targets.forEach((el) => {
          const s = R(el);
          const x2 = left ? s.r : s.l;
          const y2 = el === blk ? Math.min(Math.max(core.cy, s.t + 18), s.b - 18) : s.cy;
          const m = (x1 + x2) / 2;
          out.push({ d: `M${x1} ${core.cy} C${m} ${core.cy} ${m} ${y2} ${x2} ${y2}`, dashed: true });
        });
      });
    });
    setLines(out);
    setSize({ w: b.width, h: b.height });
  }, []);

  useLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (mainRef.current) ro.observe(mainRef.current);
    window.addEventListener("resize", measure);
    const t = setTimeout(measure, 300);
    document.fonts?.ready.then(measure);
    return () => { ro.disconnect(); window.removeEventListener("resize", measure); clearTimeout(t); };
  }, [measure]);

  const total = SPINE.reduce((n, s) => (s.kind === "node" ? n + 1 + countBlock(s.left) + countBlock(s.right) : n), 0);
  const pct = Math.round((done.size / total) * 100);

  const item = (t: string, id: string, cls: string) => (
    <Box key={id} id={id} text={t} on={done.has(id)} onOpen={open} className={`${cls} ${tone(t)}`} />
  );

  const renderBlock = (b: Block | undefined, side: "l" | "r", pid: string) => (
    <div className={`cell ${side}`}>
      {b?.kind === "list" && (
        <div className="blk list" data-kind="list">
          {b.title && <div className="txt">{b.title}</div>}
          {b.items.map((t) => item(t, `${pid}-${t}`, "item"))}
        </div>
      )}
      {b?.kind === "group" && (
        <div className={`blk group${b.bare ? " bare" : ""}`} data-kind="group">
          {b.sections.map((s, si) => (
            <div className="sec" key={si}>
              {s.head && (s.box ? item(s.head, `${pid}-h-${s.head}`, "item head") : <div className="txt">{s.head}</div>)}
              <div className="wrap">{s.items.map((t) => item(t, `${pid}-${si}-${t}`, "item"))}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
  return (
    <div className="roadmap">
      <header>
        <h1>Khulan Ariunbaatar | Data Analyst Roadmap</h1>
        <p>Click any box to read about it and mark it done. Progress is stored in the database.</p>
        <div className="bar"><i style={{ width: `${pct}%` }} /></div>
        <div className="pct">{pct}% complete ({done.size} of {total})</div>
        <Button variant="outline" className="rm-btn" onClick={reset}>Reset progress</Button>
      </header>

      <main ref={mainRef}>
        <svg className="lines" width={size.w} height={size.h} aria-hidden="true">
          {lines.map((l, i) => <path key={i} d={l.d} className={`ln${l.dashed ? " dot" : ""}`} />)}
        </svg>

        {SPINE.map((s, i) =>
          s.kind === "label" ? (
            <section className="row" key={i}>
              <div className="cell" /><div className={`lbl spine${s.big ? " big" : ""}`}>{s.text}</div><div className="cell" />
            </section>
          ) : (
            <section className="row" key={i}>
              {renderBlock(s.left, "l", `n${i}L`)}
              <Box id={`core-${i}`} text={s.text} on={done.has(`core-${i}`)} onOpen={open}
                className={`core spine${s.blue ? " blue" : ""}`} />
              {renderBlock(s.right, "r", `n${i}R`)}
            </section>
          )
        )}

        <section className="row">
          <div className="cell l">
            <div className="card">
              <b>Build a portfolio of projects. Some example projects:</b>
              <p>1) Predicting sales trends 2) Customer Segmentation</p>
              <b>Participate in Kaggle Competitions</b>
              <p>Participate in competitions and learn from community</p>
              <b>Online Courses and Certifications</b>
              <p>Platforms like Coursera, edX, Udemy and Datacamp offer courses in Data Analytics and related topics.</p>
              <b>Stay Updated and Network</b>
              <p>Join networking events, communities, seek mentorship, attend webinars and engage in discussions to expand your network.</p>
            </div>
          </div>
          <div /><div className="cell" />
        </section>

        <div className="keep">
          <div className="txt">Keep learning with the following relevant track</div>
          <div className="keep-row">
            {["AI / Data Science", "BI Analyst", "Python", "R"].map((t) => <span key={t}>{t}</span>)}
          </div>
        </div>
      </main>

      {detail && (
        <aside className="panel" role="dialog" aria-label={detail.text}>
          <Button variant="outline" size="icon" className="rm-btn panel-x" aria-label="Close" onClick={() => setDetail(null)}>
            <XIcon />
          </Button>
          <h2>{detail.topic?.title ?? detail.text}</h2>
          <div className="md">
            {detail.topic === undefined ? <p>Loading…</p>
              : detail.topic ? <ReactMarkdown>{detail.topic.content}</ReactMarkdown>
              : <p>No description for this topic in the database.</p>}
          </div>
          <Button variant="outline" className="rm-btn" onClick={() => toggle(detail.id)}>
            {done.has(detail.id) ? "Mark as not done" : "Mark as done"}
          </Button>
        </aside>
      )}

      <Button variant="outline" size="icon" className="rm-btn to-top" aria-label="Scroll to top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
        <ArrowUpIcon />
      </Button>
    </div>
  );
}
