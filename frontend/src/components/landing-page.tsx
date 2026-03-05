"use client";

import Link from "next/link";
import { LandingNav } from "@/components/landing-nav";
import { BeforeAfterSection } from "@/components/landing-before-after";
import { LiveFeedSection } from "@/components/landing-live-feed";
import { TimelineSection } from "@/components/landing-timeline";
import { LangProvider, useLang, t } from "@/lib/i18n";

function LandingContent() {
  const { lang } = useLang();
  const h = t.hero;
  const how = t.how;
  const feat = t.features;
  const pr = t.pricing;
  const test = t.testimonials;
  const faq = t.faq;
  const cta = t.cta;

  const howSteps = how.steps[lang];
  const proFeatures = pr.proFeatures[lang];
  const starterFeatures = pr.starterFeatures[lang];
  const agencyFeatures = pr.agencyFeatures[lang];
  const testimonialItems = test.items[lang];
  const faqItems = faq.items[lang];
  const marqueeItems = t.marquee.items[lang];

  return (
    <div className="landing">
      <LandingNav />

      {/* ============ HERO ============ */}
      <section className="hero-section relative min-h-screen flex flex-col justify-center pt-20 overflow-hidden">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>

        <div className="absolute top-20 left-0 right-0 overflow-hidden opacity-10 py-2" style={{ borderTop: "1px solid rgba(255,96,55,0.3)", borderBottom: "1px solid rgba(255,96,55,0.3)" }}>
          <div className="marquee-track" style={{ fontFamily: "'Unbounded',sans-serif", fontSize: "0.6rem", letterSpacing: "0.2em", color: "var(--accent)" }}>
            {[...marqueeItems, ...marqueeItems].map((item, i) => (
              <span key={i}><span className="px-8">{item}</span><span className="px-8">&bull;</span></span>
            ))}
          </div>
        </div>

        <div className="lc relative z-10 mt-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="fade-up delay-1 flex items-center gap-3 mb-8">
                <div className="pulse-dot"></div>
                <span className="text-xs tracking-widest uppercase" style={{ color: "var(--muted)" }}>{h.badge[lang]}</span>
              </div>

              <h1 className="fade-up delay-2 font-display leading-none mb-6" style={{ fontSize: "clamp(2.2rem,5vw,3.8rem)", lineHeight: 1.05 }}>
                {h.title1[lang]}<br />
                <span style={{ color: "var(--aqua)", whiteSpace: "pre-line" }}>{h.title2[lang]}</span>
              </h1>

              <p className="fade-up delay-3 mb-8 text-lg" style={{ color: "var(--cream)", maxWidth: 440, lineHeight: 1.7, opacity: 0.8 }}>
                {lang === "ua" ? (
                  <>Поки ви спите &mdash; бот відповідає. Кваліфікує. Прогріває. І доставляє <strong style={{ color: "var(--snow)" }}>{h.readyToBuy[lang]}</strong> клієнта вашій команді.</>
                ) : (
                  <>While you sleep &mdash; the bot responds. Qualifies. Nurtures. And delivers a <strong style={{ color: "var(--snow)" }}>{h.readyToBuy[lang]}</strong> customer to your team.</>
                )}
              </p>

              <div className="fade-up delay-4 flex flex-col sm:flex-row gap-4 mb-10">
                <Link href="/panel/login" className="btn-primary">{h.cta[lang]} &rarr;</Link>
                <a href="#how" className="text-sm flex items-center gap-2 hover:text-white transition-colors" style={{ color: "var(--muted)" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" /><polygon points="10,8 16,12 10,16" />
                  </svg>
                  {h.watchDemo[lang]}
                </a>
              </div>

              <div className="fade-up delay-5 flex items-center gap-6">
                <div className="flex -space-x-2">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-red-500 border-2 border-[#351E1C] flex items-center justify-center text-xs font-bold">A</div>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#A0C9CB] to-[#6BA3A6] border-2 border-[#351E1C] flex items-center justify-center text-xs font-bold text-[#351E1C]">K</div>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 border-2 border-[#351E1C] flex items-center justify-center text-xs font-bold">M</div>
                  <div className="w-9 h-9 rounded-full border-2 border-[#351E1C] flex items-center justify-center text-xs" style={{ background: "var(--dark3)", color: "var(--muted)" }}>+47</div>
                </div>
                <p className="text-sm" style={{ color: "var(--muted)" }}>{h.alreadyConnected[lang]}</p>
              </div>
            </div>

            {/* Right: iPhone Pro Max mockup */}
            <div className="fade-up delay-3 relative flex justify-center">
              <div className="relative w-full max-w-[320px]">
                <div className="rounded-[3rem] p-[3px]" style={{ background: "linear-gradient(145deg, #8A8A8E, #5C5C60, #8A8A8E)", boxShadow: "0 30px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1) inset" }}>
                  <div className="rounded-[2.8rem] p-[2px]" style={{ background: "#1A1A1A" }}>
                    <div className="rounded-[2.6rem] overflow-hidden relative" style={{ background: "#fff" }}>
                      <div className="relative flex items-center justify-between px-7 pt-3 pb-1" style={{ background: "#fff" }}>
                        <span className="text-[12px] font-semibold text-[#262626]">9:41</span>
                        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-[100px] h-[28px] bg-black rounded-full flex items-center justify-end pr-2 gap-1">
                          <div className="w-[10px] h-[10px] rounded-full" style={{ background: "radial-gradient(circle at 40% 40%, #3A3A4A, #0A0A0A)" }}></div>
                        </div>
                        <div className="flex items-center gap-1">
                          <svg width="16" height="12" viewBox="0 0 16 12" fill="#262626">
                            <rect x="0" y="9" width="3" height="3" rx="0.5" />
                            <rect x="4" y="6" width="3" height="6" rx="0.5" />
                            <rect x="8" y="3" width="3" height="9" rx="0.5" />
                            <rect x="12" y="0" width="3" height="12" rx="0.5" />
                          </svg>
                          <svg width="14" height="12" viewBox="0 0 24 24" fill="#262626">
                            <path d="M12 18l-1.5-1.5a2.12 2.12 0 013 0L12 18zM8.5 14.5A5.65 5.65 0 0112 13a5.65 5.65 0 013.5 1.5M5 11a9.39 9.39 0 017-3 9.39 9.39 0 017 3" stroke="#262626" strokeWidth="2" fill="none" strokeLinecap="round" />
                          </svg>
                          <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
                            <rect x="0" y="0" width="22" height="12" rx="3" stroke="#262626" strokeWidth="1" />
                            <rect x="2" y="2" width="16" height="8" rx="1.5" fill="#262626" />
                            <path d="M23 4v4a2 2 0 000-4z" fill="#262626" />
                          </svg>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 px-4 py-2" style={{ background: "#fff", borderBottom: "1px solid #EFEFEF" }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2.5" strokeLinecap="round">
                          <path d="M15 18l-6-6 6-6" />
                        </svg>
                        <div className="w-8 h-8 rounded-full p-[2px]" style={{ background: "linear-gradient(135deg, #F58529, #DD2A7B, #8134AF, #515BD4)" }}>
                          <div className="w-full h-full rounded-full bg-white p-[1.5px]">
                            <div className="w-full h-full rounded-full bg-gradient-to-br from-pink-300 to-rose-400 flex items-center justify-center text-[9px] font-bold text-white">M</div>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-[#262626] leading-tight">Maria_beauty</p>
                          <p className="text-[10px] text-[#8E8E8E]">Active now</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="1.5">
                            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 11.5 19.79 19.79 0 01.1 2.86 2 2 0 012.1.68h3a2 2 0 012 1.72 12.05 12.05 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 8.59a16 16 0 006 6" />
                          </svg>
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="1.5">
                            <rect x="2" y="4" width="20" height="16" rx="4" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </div>
                      </div>

                      <div className="px-3 py-3 space-y-2.5" style={{ background: "#fff", minHeight: 320 }}>
                        <p className="text-center text-[10px] text-[#8E8E8E] mb-1.5">Today 10:23 AM</p>
                        <div className="text-center mb-0.5">
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#FFF3F0] text-[#FF6037] font-medium">
                            {t.chat.repliedToStory[lang]}
                          </span>
                        </div>

                        <div className="flex items-end gap-1.5">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0">N</div>
                          <div className="rounded-[18px] rounded-bl-[4px] px-3 py-2 max-w-[75%]" style={{ background: "#EFEFEF" }}>
                            <p className="text-[12px] text-[#262626] leading-snug">{t.chat.msg1[lang]}</p>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <div className="rounded-[18px] rounded-br-[4px] px-3 py-2 max-w-[75%]" style={{ background: "linear-gradient(135deg, #833AB4, #C13584, #E1306C)" }}>
                            <p className="text-[12px] text-white leading-snug">{t.chat.msg2[lang]}</p>
                          </div>
                        </div>

                        <div className="flex items-end gap-1.5">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0">N</div>
                          <div className="rounded-[18px] rounded-bl-[4px] px-3 py-2 max-w-[75%]" style={{ background: "#EFEFEF" }}>
                            <p className="text-[12px] text-[#262626] leading-snug">{t.chat.msg3[lang]}</p>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <div className="rounded-[18px] rounded-br-[4px] px-3 py-2 max-w-[75%]" style={{ background: "linear-gradient(135deg, #833AB4, #C13584, #E1306C)" }}>
                            <p className="text-[12px] text-white leading-snug">{t.chat.msg4[lang]}</p>
                          </div>
                        </div>

                        <div className="flex items-end gap-1.5">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0">N</div>
                          <div className="rounded-[18px] rounded-bl-[4px] px-3 py-2 max-w-[75%]" style={{ background: "#EFEFEF" }}>
                            <p className="text-[12px] text-[#262626] leading-snug">{t.chat.msg5[lang]}</p>
                          </div>
                        </div>

                        <p className="text-right text-[10px] text-[#8E8E8E] pr-1">Seen</p>

                        <div className="flex items-start gap-2 p-2 rounded-2xl mx-0.5" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.15)" }}>
                          <span className="text-sm">🔥</span>
                          <div>
                            <p className="text-[10px] font-semibold" style={{ color: "#16a34a" }}>{t.chat.hotLead[lang]}</p>
                            <p className="text-[10px] text-[#8E8E8E]">{lang === "ua" ? "Настя" : "Nastya"} &middot; {t.chat.msg5[lang].split(", ")[1]}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 px-3 py-2" style={{ borderTop: "1px solid #EFEFEF", background: "#fff" }}>
                        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #F58529, #DD2A7B, #8134AF)" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><circle cx="12" cy="12" r="10" /></svg>
                        </div>
                        <div className="flex-1 rounded-full border border-[#DBDBDB] px-3 py-1.5">
                          <p className="text-[12px] text-[#8E8E8E]">Message...</p>
                        </div>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="1.5"><path d="M12 18.5a6.5 6.5 0 006.5-6.5V8a6.5 6.5 0 10-13 0v4a6.5 6.5 0 006.5 6.5zM12 18.5V22" /></svg>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" fill="#262626" /><path d="M21 15l-5-5L5 21" /></svg>
                      </div>

                      <div className="flex justify-center pb-2 pt-1" style={{ background: "#fff" }}>
                        <div className="w-[120px] h-[4px] rounded-full bg-[#1A1A1A]"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 mt-20 opacity-40">
            <span className="text-xs tracking-widest uppercase" style={{ color: "var(--muted)" }}>Scroll</span>
            <div className="scroll-line"></div>
          </div>
        </div>
      </section>

      {/* ============ BEFORE / AFTER ============ */}
      <BeforeAfterSection />

      {/* ============ LIVE FEED ============ */}
      <LiveFeedSection />

      {/* ============ TIMELINE ============ */}
      <TimelineSection />

      {/* ============ HOW IT WORKS ============ */}
      <section id="how" className="how-section py-32">
        <div className="lc">
          <div className="text-center mb-20">
            <div className="accent-line mx-auto mb-6"></div>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4" style={{ color: "var(--dark)" }}>{how.title[lang]}</h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: "var(--dark)", opacity: 0.6 }}>{how.desc[lang]}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howSteps.map((s, i) => {
              const color = i % 2 === 0 ? "var(--accent)" : "var(--cream)";
              const barClass = i % 2 === 0 ? "card-bar-orange" : "card-bar-cream";
              const iconBg = i % 2 === 0 ? "rgba(255,96,55,0.1)" : "rgba(236,236,220,0.15)";
              const strokeColor = i % 2 === 0 ? "#FF6037" : "#ECECDC";
              return (
                <div key={s.num} className={`step-item card card-bar ${barClass} rounded-2xl p-6 relative overflow-hidden group`}>
                  <div className="step-num absolute -top-2 -right-2" style={{ color: `color-mix(in srgb, ${color} 12%, transparent)` }}>{s.num}</div>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 relative z-10" style={{ background: iconBg }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="2">
                      {s.num === "01" && <><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8m-4-4v4" /></>}
                      {s.num === "02" && <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />}
                      {s.num === "03" && <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />}
                      {s.num === "04" && <><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></>}
                    </svg>
                  </div>
                  <h3 className="font-display text-base font-bold mb-2" style={{ color: "var(--snow)" }}>{s.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--cream)", opacity: 0.8 }}>{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section className="features-section py-32">
        <div className="lc">
          <div className="mb-20">
            <div className="accent-line mb-6"></div>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4" style={{ color: "var(--dark)" }}>
              {feat.title1[lang]}<br />
              <span style={{ color: "var(--accent)" }}>{feat.title2[lang]}</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="card card-bar card-bar-orange rounded-2xl p-8 md:col-span-2">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ background: "rgba(255,96,55,0.1)" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF6037" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold mb-2">{feat.deepKnowledge.title[lang]}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{feat.deepKnowledge.desc[lang]}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl p-3" style={{ background: "var(--dark)", color: "var(--snow)" }}>
                  <p className="text-[11px] mb-1" style={{ color: "var(--aqua)" }}>{feat.deepKnowledge.valueProp[lang]}</p>
                  <p className="text-sm">{feat.deepKnowledge.valuePropText[lang]}</p>
                </div>
                <div className="rounded-xl p-3" style={{ background: "var(--dark)", color: "var(--snow)" }}>
                  <p className="text-[11px] mb-1" style={{ color: "var(--accent)" }}>{feat.deepKnowledge.objection[lang]}</p>
                  <p className="text-sm">{feat.deepKnowledge.objectionText[lang]}</p>
                </div>
              </div>
            </div>

            {[
              { icon: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></>, title: feat.multiTenant.title[lang], desc: feat.multiTenant.desc[lang], stroke: "#A0C9CB", bg: "rgba(160,201,203,0.15)", bar: "card-bar-aqua" },
              { icon: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />, title: feat.salesFunnel.title[lang], desc: feat.salesFunnel.desc[lang], stroke: "#FF6037", bg: "rgba(255,96,55,0.15)", bar: "card-bar-orange" },
              { icon: <><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></>, title: feat.telegramAlerts.title[lang], desc: feat.telegramAlerts.desc[lang], stroke: "#A0C9CB", bg: "rgba(160,201,203,0.15)", bar: "card-bar-aqua" },
              { icon: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>, title: feat.humanTakeover.title[lang], desc: feat.humanTakeover.desc[lang], stroke: "#FF6037", bg: "rgba(255,96,55,0.15)", bar: "card-bar-orange" },
            ].map((f) => (
              <div key={f.title} className={`card card-bar ${f.bar} rounded-2xl p-8`}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ background: f.bg }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={f.stroke} strokeWidth="2">{f.icon}</svg>
                </div>
                <h3 className="font-display text-lg font-bold mb-3">{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PRICING ============ */}
      <section id="pricing" className="pricing-section py-32">
        <div className="lc">
          <div className="text-center mb-20">
            <div className="accent-line mx-auto mb-6"></div>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">{pr.title[lang]}</h2>
            <p className="text-lg" style={{ color: "var(--muted)" }}>{pr.desc[lang]}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="card rounded-2xl p-8">
              <p className="font-display text-xs font-bold tracking-widest uppercase mb-6" style={{ color: "var(--muted)" }}>{pr.starter[lang]}</p>
              <div className="flex items-end gap-2 mb-2">
                <span className="font-display text-5xl font-black">$29</span>
                <span className="text-sm mb-2" style={{ color: "var(--muted)" }}>{pr.mo[lang]}</span>
              </div>
              <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>{pr.starterDesc[lang]}</p>
              <div className="space-y-3 mb-8 text-sm">
                {starterFeatures.map((f) => (
                  <div key={f} className="flex items-center gap-3"><span style={{ color: "var(--aqua)" }}>&#10003;</span> {f}</div>
                ))}
                <div className="flex items-center gap-3" style={{ color: "var(--muted)" }}><span>&mdash;</span> {pr.starterDisabled[lang]}</div>
              </div>
              <Link href="/panel/login" className="block w-full py-3 rounded-xl text-sm font-medium text-center transition-colors border no-underline" style={{ borderColor: "rgba(255,255,255,0.1)", color: "var(--snow)" }}>
                {pr.startFree[lang]}
              </Link>
            </div>

            <div className="pricing-highlight rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <p className="font-display text-xs font-bold tracking-widest uppercase" style={{ color: "var(--accent)" }}>{pr.pro[lang]}</p>
                <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: "rgba(255,96,55,0.15)", color: "var(--accent)" }}>{pr.popular[lang]}</span>
              </div>
              <div className="flex items-end gap-2 mb-2">
                <span className="font-display text-5xl font-black">$79</span>
                <span className="text-sm mb-2" style={{ color: "var(--muted)" }}>{pr.mo[lang]}</span>
              </div>
              <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>{pr.proDesc[lang]}</p>
              <div className="space-y-3 mb-8 text-sm">
                {proFeatures.map((f) => (
                  <div key={f} className="flex items-center gap-3"><span style={{ color: "var(--accent)" }}>&#10003;</span> {f}</div>
                ))}
              </div>
              <Link href="/panel/login" className="btn-primary w-full text-center block">
                {pr.tryFree[lang]} &rarr;
              </Link>
            </div>

            <div className="card rounded-2xl p-8">
              <p className="font-display text-xs font-bold tracking-widest uppercase mb-6" style={{ color: "var(--muted)" }}>{pr.agency[lang]}</p>
              <div className="flex items-end gap-2 mb-2">
                <span className="font-display text-5xl font-black">$199</span>
                <span className="text-sm mb-2" style={{ color: "var(--muted)" }}>{pr.mo[lang]}</span>
              </div>
              <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>{pr.agencyDesc[lang]}</p>
              <div className="space-y-3 mb-8 text-sm">
                {agencyFeatures.map((f) => (
                  <div key={f} className="flex items-center gap-3"><span style={{ color: "var(--aqua)" }}>&#10003;</span> {f}</div>
                ))}
              </div>
              <Link href="/panel/login" className="block w-full py-3 rounded-xl text-sm font-medium text-center transition-colors border no-underline" style={{ borderColor: "rgba(255,255,255,0.1)", color: "var(--snow)" }}>
                {pr.contactUs[lang]}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="testimonials-section py-32">
        <div className="lc">
          <div className="text-center mb-16">
            <div className="accent-line mx-auto mb-6"></div>
            <h2 className="font-display text-4xl font-bold">{test.title[lang]}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonialItems.map((item, i) => {
              const accent = i % 2 === 0 ? "#FF6037" : "#A0C9CB";
              return (
                <div key={item.name} className="card rounded-2xl p-8 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full" style={{ background: accent }}></div>
                  <div className="flex gap-1 mb-4">
                    <span style={{ color: "#FF6037" }}>&#9733;&#9733;&#9733;&#9733;&#9733;</span>
                  </div>
                  <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--snow)", opacity: 0.7 }}>&ldquo;{item.quote}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white" style={{ background: accent }}>
                      {item.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs" style={{ color: "var(--muted)" }}>{item.role}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section id="faq" className="faq-section py-32">
        <div className="lc">
          <div className="text-center mb-16">
            <div className="accent-line mx-auto mb-6"></div>
            <h2 className="font-display text-4xl font-bold" style={{ color: "var(--dark)" }}>{faq.title[lang]}</h2>
          </div>
          <div className="space-y-3">
            {faqItems.map((item) => (
              <details key={item.q} className="card rounded-2xl overflow-hidden group">
                <summary className="flex items-center justify-between p-6 cursor-pointer">
                  <span className="font-medium pr-4" style={{ color: "var(--dark)" }}>{item.q}</span>
                  <span className="faq-icon text-xl" style={{ color: "var(--accent)" }}>+</span>
                </summary>
                <div className="px-6 pb-6 text-sm leading-relaxed" style={{ color: "var(--dark)", opacity: 0.6 }}>{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="cta-final relative overflow-hidden py-32">
        <div className="blob blob-1" style={{ width: 500, height: 500, top: -200, right: -100 }}></div>
        <div className="blob blob-2" style={{ width: 400, height: 400, bottom: -150, left: -50 }}></div>
        <div className="lc text-center relative z-10">
          <p className="font-display text-xs tracking-widest uppercase mb-6" style={{ color: "var(--aqua)" }}>{cta.label[lang]}</p>
          <h2 className="font-display text-4xl md:text-6xl font-black mb-6 leading-tight">
            {cta.title1[lang]}<br />{cta.title2[lang]}
          </h2>
          <p className="text-lg mb-10 max-w-xl mx-auto" style={{ color: "var(--cream)", opacity: 0.7 }}>
            {cta.desc[lang]}
          </p>
          <Link href="/panel/login" className="btn-primary text-base py-5 px-10">
            {cta.button[lang]} &rarr;
          </Link>
          <p className="text-xs mt-6" style={{ color: "var(--muted)" }}>{cta.sub[lang]}</p>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="footer-section py-12">
        <div className="lc flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="logo-mark">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
                <path d="M2 2h5v5H2zM9 2h5v5H9zM2 9h5v5H2zM9 9h5v5H9z" opacity="0.8" />
                <rect x="6" y="6" width="4" height="4" fill="white" />
              </svg>
            </div>
            <span style={{ fontFamily: "'Unbounded',sans-serif", fontSize: "0.95rem", fontWeight: 700 }}>Keep My Lead</span>
          </div>
          <p className="text-sm" style={{ color: "var(--muted)" }}>&copy; 2026 Keep My Lead &middot; {t.footer.rights[lang]}</p>
          <div className="flex items-center gap-6 text-sm" style={{ color: "var(--muted)" }}>
            <Link href="/privacy" className="hover:text-white transition-colors">{t.footer.privacy[lang]}</Link>
            <Link href="/terms" className="hover:text-white transition-colors">{t.footer.terms[lang]}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function LandingPage() {
  return (
    <LangProvider>
      <LandingContent />
    </LangProvider>
  );
}
