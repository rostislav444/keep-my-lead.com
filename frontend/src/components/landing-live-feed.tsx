"use client";

import { useEffect, useRef, useState } from "react";
import { useLang, t } from "@/lib/i18n";

const COLORS = ["#e8408e", "#7dd4c8", "#f04e23", "#a855f7", "#22c55e", "#f59e0b", "#3b82f6", "#ec4899"];

export function LiveFeedSection() {
  const { lang } = useLang();
  const s = t.liveFeed;
  const sectionRef = useRef<HTMLElement>(null);
  const [feedItems, setFeedItems] = useState<Array<{ name: string; action: string; tag: string; color: string; time: string }>>([]);
  const [feedCount, setFeedCount] = useState(47);
  const [stats, setStats] = useState({ qualified: 0, conversion: 0 });
  const [started, setStarted] = useState(false);
  const feedIndexRef = useRef(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting || started) return;
          setStarted(true);
          observer.unobserve(e.target);
        });
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;

    const leads = s.leads[lang];
    const addItem = () => {
      const idx = feedIndexRef.current % leads.length;
      const lead = leads[idx];
      feedIndexRef.current++;

      setFeedCount((c) => c + 1);
      setFeedItems((prev) => {
        const next = [{ ...lead, color: COLORS[idx], time: s.justNow[lang] }, ...prev];
        return next.slice(0, 6);
      });
    };

    // Seed initial items
    for (let i = 0; i < 5; i++) {
      const idx = i % leads.length;
      const lead = leads[idx];
      feedIndexRef.current = i + 1;
      setFeedItems((prev) => [{ ...lead, color: COLORS[idx], time: `${i + 1} min` }, ...prev].slice(0, 6));
    }

    // Animate stats
    let n1 = 0;
    const t1 = setInterval(() => {
      n1 += 3;
      if (n1 >= 143) { n1 = 143; clearInterval(t1); }
      setStats((prev) => ({ ...prev, qualified: n1 }));
    }, 20);

    let n3 = 0;
    const t3 = setInterval(() => {
      n3++;
      if (n3 >= 68) { n3 = 68; clearInterval(t3); }
      setStats((prev) => ({ ...prev, conversion: n3 }));
    }, 30);

    const interval = setInterval(addItem, 2800);
    return () => {
      clearInterval(interval);
      clearInterval(t1);
      clearInterval(t3);
    };
  }, [started, lang, s]);

  const tagLabels = s.tagLabels[lang];

  return (
    <section ref={sectionRef} className="lf-section">
      <div className="ba-glow ba-glow-cyan" style={{ top: "50%", right: -100, transform: "translateY(-50%)" }} />
      <div className="ba-inner">
        <div className="lf-container">
          <div className="lf-topbar">
            <div className="lf-topbar-left">
              <div className="lf-live-dot" />
              {s.hotLeadsNow[lang]}
            </div>
            <div className="lf-count">{feedCount} {s.today[lang]}</div>
          </div>
          <div className="lf-list">
            {feedItems.map((item, i) => (
              <div key={`${item.name}-${i}`} className="lf-item" style={{ animation: i === 0 ? "feedSlideIn 0.5s ease forwards" : "none" }}>
                <div className="lf-avatar" style={{ background: `${item.color}22`, color: item.color }}>{item.name[0]}</div>
                <div className="lf-body">
                  <div className="lf-name">
                    {item.name}
                    <span className={`lf-tag tag-${item.tag}`}>{tagLabels[item.tag as keyof typeof tagLabels]}</span>
                  </div>
                  <div className="lf-action">{item.action}</div>
                </div>
                <div className="lf-time">{item.time}</div>
              </div>
            ))}
          </div>
          <div className="lf-footer">
            <div className="lf-stat">
              <div className="lf-stat-num">{stats.qualified}</div>
              <div className="lf-stat-label">{s.qualified[lang]}</div>
            </div>
            <div className="lf-stat">
              <div className="lf-stat-num">2s</div>
              <div className="lf-stat-label">{s.avgResponse[lang]}</div>
            </div>
            <div className="lf-stat">
              <div className="lf-stat-num">{stats.conversion}%</div>
              <div className="lf-stat-label">{s.conversion[lang]}</div>
            </div>
          </div>
        </div>

        <div className="ba-text-col">
          <div className="ba-label">
            <span className="ba-label-dot" />
            {s.label[lang]}
          </div>
          <h2 className="ba-title">
            {s.title1[lang]}
            <br />
            <span>{s.title2[lang]}</span>
          </h2>
          <p className="ba-desc">{s.desc[lang]}</p>
        </div>
      </div>
    </section>
  );
}
