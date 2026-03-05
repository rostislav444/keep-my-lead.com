"use client";

import { useEffect, useRef } from "react";
import { useLang, t } from "@/lib/i18n";

export function TimelineSection() {
  const { lang } = useLang();
  const s = t.timeline;
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const items = sectionRef.current?.querySelectorAll(".tl-item");
          if (!items) return;

          const activate = (i: number) => {
            if (i >= items.length) return;
            items[i].classList.add("visible", "active");
            if (i > 0) items[i - 1].classList.remove("active");
            setTimeout(() => activate(i + 1), 1800);
          };

          setTimeout(() => activate(0), 400);
          observer.unobserve(e.target);
        });
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const steps = s.steps[lang];

  return (
    <section ref={sectionRef} className="tl-section">
      <div className="ba-glow ba-glow-orange" style={{ bottom: -100, right: -50 }} />
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

        <div className="tl-wrap">
          <div className="tl-line" />
          {steps.map((step, i) => (
            <div key={i} className="tl-item">
              <div className="tl-dot-wrap">
                <div className="tl-dot" />
                <div className="tl-time">{step.time}</div>
              </div>
              <div className="tl-card">
                <div className="tl-card-label">{step.label}</div>
                <div className="tl-card-text">{step.text}</div>
                {"sub" in step && step.sub && <div className="tl-card-sub">{step.sub}</div>}
                {"mini" in step && step.mini && (
                  <div className={`tl-card-mini ${step.miniClass || ""}`}>{step.mini}</div>
                )}
                <div className="tl-progress-bar" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
