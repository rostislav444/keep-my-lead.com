"use client";

import { useEffect, useRef } from "react";
import { useLang, t } from "@/lib/i18n";

export function BeforeAfterSection() {
  const { lang } = useLang();
  const s = t.beforeAfter;
  const beforeRef = useRef<HTMLDivElement>(null);
  const afterRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          [beforeRef, afterRef].forEach((ref) => {
            const msgs = ref.current?.querySelectorAll(".ba-msg");
            msgs?.forEach((msg) => {
              const delay = parseInt((msg as HTMLElement).dataset.delay || "0");
              setTimeout(() => msg.classList.add("visible"), delay + 300);
            });
          });
          observer.unobserve(e.target);
        });
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="ba-section">
      <div className="ba-glow ba-glow-orange" />
      <div className="ba-inner">
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

        <div className="ba-panels">
          {/* BEFORE */}
          <div className="ba-panel before">
            <div className="ba-panel-header">
              <div className="ba-dot" /> {s.before[lang]}
            </div>
            <div className="ba-chat" ref={beforeRef}>
              <div className="ba-msg" data-delay="0">
                <div className="ba-msg-time">23:47</div>
                <div className="ba-bubble incoming">{s.beforeMsg1[lang]}</div>
              </div>
              <div className="ba-msg" data-delay="400">
                <div className="ba-msg-time">23:47</div>
                <div className="ba-bubble incoming">{s.beforeMsg2[lang]}</div>
              </div>
              <div className="ba-msg" data-delay="2500">
                <div className="ba-msg-time">08:12</div>
                <div className="ba-bubble outgoing-bad">{s.beforeMsg3[lang]}</div>
              </div>
            </div>
            <div className="ba-missed-badge">
              <span>😴</span>
              <span>{s.beforeBadge[lang]}</span>
            </div>
            <div className="ba-status ba-status-bad">
              <span>✗</span> {s.beforeStatus[lang]}
            </div>
          </div>

          {/* AFTER */}
          <div className="ba-panel after">
            <div className="ba-panel-header">
              <div className="ba-dot" /> {s.after[lang]}
            </div>
            <div className="ba-chat" ref={afterRef}>
              <div className="ba-msg" data-delay="0">
                <div className="ba-msg-time">23:47</div>
                <div className="ba-bubble incoming">{s.afterMsg1[lang]}</div>
              </div>
              <div className="ba-msg" data-delay="500">
                <div className="ba-msg-time">23:47:02</div>
                <div className="ba-bubble outgoing-good">{s.afterMsg2[lang]}</div>
              </div>
              <div className="ba-msg" data-delay="1800">
                <div className="ba-msg-time">23:48</div>
                <div className="ba-bubble incoming">{s.afterMsg3[lang]}</div>
              </div>
            </div>
            <div className="ba-hot-badge">
              🔥 <span>{s.afterBadge[lang]} · 23:48</span>
            </div>
            <div className="ba-status ba-status-good">
              <span>✓</span> {s.afterStatus[lang]}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
