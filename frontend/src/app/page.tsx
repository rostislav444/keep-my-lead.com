import Link from "next/link";
import { LandingNav } from "@/components/landing-nav";
import "./landing.css";

export const metadata = {
  title: "Keep My Lead — Never lose a lead from social media",
};

export default function LandingPage() {
  return (
    <div className="landing">
      <LandingNav />

      {/* HERO */}
      <section className="hero-gradient relative pt-32 pb-24 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-3xl fade-up delay-1">
            <h1 className="heading-xl mb-8">
              Never lose a lead<br />
              from social media again
            </h1>
            <div className="flex flex-col sm:flex-row gap-6 mb-12">
              <p className="text-lg text-[#6b7280] max-w-md leading-relaxed">
                AI-powered assistant that responds to Instagram DMs and comments instantly,
                qualifies leads, and delivers hot prospects to your team.
              </p>
              <div className="flex items-center gap-2 text-sm text-[#6b7280] shrink-0 self-start">
                <span className="text-amber-500">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
                <span>4.9/5 from 120+ businesses</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/panel/register" className="btn-primary">
                Start free trial &rarr;
              </Link>
              <a href="#how" className="btn-outline">
                See how it works
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-20 border-y border-[#e5e7eb]">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12">
          {[
            { num: "60%", label: "of leads are lost without a fast response", color: "text-indigo-600" },
            { num: "2s", label: "average bot response time", color: "text-purple-600" },
            { num: "24/7", label: "always on, no days off", color: "text-pink-500" },
            { num: "3x", label: "average conversion increase", color: "text-emerald-600" },
          ].map((s) => (
            <div key={s.num}>
              <p className={`stat-number ${s.color} mb-2`}>{s.num}</p>
              <p className="text-sm text-[#6b7280] leading-relaxed">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* STATEMENT */}
      <section className="py-28 max-w-5xl mx-auto px-6">
        <p className="text-[clamp(1.5rem,3.5vw,2.8rem)] font-semibold leading-[1.35] tracking-tight">
          <span className="text-[#6b7280]">&rarr; We help businesses </span>
          <span className="hl-blue">capture leads</span>
          <span className="text-[#6b7280]"> from Instagram, </span>
          <span className="hl-purple">qualify interest</span>
          <span className="text-[#6b7280]"> through AI conversations, </span>
          <span className="hl-orange">collect contacts</span>
          <span className="text-[#6b7280]">, and </span>
          <span className="hl-green">notify your team</span>
          <span className="text-[#6b7280]"> instantly. That&apos;s our promise.</span>
        </p>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-28 bg-[#f0f2f8]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-medium tracking-widest uppercase text-[#6b7280] mb-4">How it works</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              From comment to client<br />in 4 simple steps
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                step: "STEP ONE",
                title: "Connect Instagram",
                desc: "One-click OAuth. No API keys, no passwords, no technical setup.",
                icon: <><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8m-4-4v4" /></>,
                tag: "Easy!",
              },
              {
                step: "STEP TWO",
                title: "Build your catalog",
                desc: "Add products with pricing, value props, and objection handlers.",
                icon: <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />,
                tag: "10 min",
              },
              {
                step: "STEP THREE",
                title: "Bot sells for you",
                desc: "AI responds to DMs and comments, qualifies leads, collects contacts.",
                icon: <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />,
                tag: "24/7",
              },
              {
                step: "STEP FOUR",
                title: "Get notified",
                desc: "Hot leads land in Telegram instantly with name, phone, and interest.",
                icon: <><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></>,
                tag: "Instant",
              },
            ].map((s, i) => (
              <div key={s.step} className="how-card group">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-[#6b7280] mb-3">{s.step}</p>
                <h3 className="text-base font-bold mb-3">{s.title}</h3>
                <div className="how-card-icon mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                    {s.icon}
                  </svg>
                </div>
                {i < 3 && (
                  <div className="hidden lg:flex absolute right-[-18px] top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-[#1a1a1a] items-center justify-center text-white text-xs">
                    &rarr;
                  </div>
                )}
                <p className="text-sm text-[#6b7280] leading-relaxed mb-4">{s.desc}</p>
                <span className="inline-block text-xs font-medium px-3 py-1 rounded-full bg-white/80 border border-[#e5e7eb] text-[#6b7280]">
                  {s.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-20 max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Not just a chatbot.<br />
              <span className="text-indigo-600">Your smartest salesperson.</span>
            </h2>
            <p className="text-lg text-[#6b7280] leading-relaxed">
              Every feature is designed to convert more leads without adding work for your team.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            <div className="feature-card md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold">Deep Product Knowledge</h3>
              </div>
              <p className="text-sm text-[#6b7280] leading-relaxed mb-6">
                The bot knows your prices, value props, target audience, objection handlers, and buying process. Conversations feel like talking to your best sales rep.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl p-4 bg-[#f8fafc] border border-[#f0f0f0]">
                  <p className="text-xs text-[#6b7280] mb-1">Value proposition</p>
                  <p className="text-sm font-medium">17 years experience &middot; 2400+ graduates &middot; certified</p>
                </div>
                <div className="rounded-xl p-4 bg-[#f8fafc] border border-[#f0f0f0]">
                  <p className="text-xs text-[#6b7280] mb-1">Objection: &ldquo;too expensive&rdquo;</p>
                  <p className="text-sm font-medium">0% installment plan, 6 months. First payment in 30 days.</p>
                </div>
              </div>
            </div>

            {[
              {
                icon: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></>,
                title: "Multi-tenant",
                desc: "Each client gets an isolated account with their own Instagram, catalog, and bot settings.",
                bg: "bg-purple-50",
                stroke: "#7c3aed",
              },
              {
                icon: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />,
                title: "Sales Funnel",
                desc: "Capture, qualify, present, collect contact. The bot guides customers step by step.",
                bg: "bg-pink-50",
                stroke: "#c026d3",
              },
              {
                icon: <><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" /></>,
                title: "Telegram Alerts",
                desc: "Hot leads go straight to your managers. Name, phone, interest, and chat history.",
                bg: "bg-emerald-50",
                stroke: "#059669",
              },
              {
                icon: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>,
                title: "Human Takeover",
                desc: "Managers can jump into any conversation with one click. The bot steps aside.",
                bg: "bg-amber-50",
                stroke: "#d97706",
              },
            ].map((f) => (
              <div key={f.title} className="feature-card">
                <div className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center mb-4`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={f.stroke} strokeWidth="2">
                    {f.icon}
                  </svg>
                </div>
                <h3 className="font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-[#6b7280] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-28 bg-[#f8fafc]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Simple pricing</h2>
            <p className="text-lg text-[#6b7280]">14-day free trial. No credit card required.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="pricing-card p-8">
              <p className="text-xs font-bold tracking-widest uppercase text-[#6b7280] mb-6">Starter</p>
              <div className="flex items-end gap-1 mb-2">
                <span className="text-5xl font-extrabold">$29</span>
                <span className="text-sm text-[#6b7280] mb-2">/mo</span>
              </div>
              <p className="text-sm text-[#6b7280] mb-8">500 conversations &middot; 1 account</p>
              <div className="space-y-3 mb-8 text-sm">
                <div className="flex items-center gap-3"><span className="text-indigo-500">&#10003;</span> Instagram DM + comments</div>
                <div className="flex items-center gap-3"><span className="text-indigo-500">&#10003;</span> Up to 10 products</div>
                <div className="flex items-center gap-3"><span className="text-indigo-500">&#10003;</span> Telegram notifications</div>
                <div className="flex items-center gap-3 text-[#6b7280]"><span>&mdash;</span> Analytics dashboard</div>
              </div>
              <Link href="/panel/register" className="btn-outline w-full text-center block">
                Start free
              </Link>
            </div>

            <div className="pricing-highlight p-8">
              <div className="flex items-center justify-between mb-6">
                <p className="text-xs font-bold tracking-widest uppercase text-indigo-600">Pro</p>
                <span className="text-xs px-3 py-1 rounded-full font-medium bg-indigo-50 text-indigo-600">Popular</span>
              </div>
              <div className="flex items-end gap-1 mb-2">
                <span className="text-5xl font-extrabold">$79</span>
                <span className="text-sm text-[#6b7280] mb-2">/mo</span>
              </div>
              <p className="text-sm text-[#6b7280] mb-8">3,000 conversations &middot; 3 accounts</p>
              <div className="space-y-3 mb-8 text-sm">
                <div className="flex items-center gap-3"><span className="text-indigo-500">&#10003;</span> Everything in Starter</div>
                <div className="flex items-center gap-3"><span className="text-indigo-500">&#10003;</span> Unlimited catalog</div>
                <div className="flex items-center gap-3"><span className="text-indigo-500">&#10003;</span> Analytics dashboard</div>
                <div className="flex items-center gap-3"><span className="text-indigo-500">&#10003;</span> Human takeover</div>
              </div>
              <Link href="/panel/register" className="btn-primary w-full text-center block">
                Start 14-day trial &rarr;
              </Link>
            </div>

            <div className="pricing-card p-8">
              <p className="text-xs font-bold tracking-widest uppercase text-[#6b7280] mb-6">Agency</p>
              <div className="flex items-end gap-1 mb-2">
                <span className="text-5xl font-extrabold">$199</span>
                <span className="text-sm text-[#6b7280] mb-2">/mo</span>
              </div>
              <p className="text-sm text-[#6b7280] mb-8">Unlimited &middot; Unlimited accounts</p>
              <div className="space-y-3 mb-8 text-sm">
                <div className="flex items-center gap-3"><span className="text-indigo-500">&#10003;</span> Everything in Pro</div>
                <div className="flex items-center gap-3"><span className="text-indigo-500">&#10003;</span> White-label</div>
                <div className="flex items-center gap-3"><span className="text-indigo-500">&#10003;</span> API access</div>
                <div className="flex items-center gap-3"><span className="text-indigo-500">&#10003;</span> Priority support</div>
              </div>
              <Link href="/panel/register" className="btn-outline w-full text-center block">
                Contact us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-28">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold tracking-tight mb-16">What our clients say</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { quote: "Used to lose 20-30 leads weekly. Manager just couldn't keep up. Now the bot responds instantly and I get ready-to-buy clients on the phone.", name: "Marina O.", role: "Beauty school, Kyiv", bg: "bg-indigo-50" },
              { quote: "Set it up in one evening. The bot knows all my products, handles objections better than some of my managers. ROI paid off in the first week.", name: "Alex D.", role: "Fitness coach, Kharkiv", bg: "bg-purple-50" },
              { quote: "Using it for 5 agency accounts. Each client gets their own bot with individual catalog. This is just a different level of work.", name: "Kate M.", role: "Digital agency, Lviv", bg: "bg-pink-50" },
            ].map((t) => (
              <div key={t.name} className="feature-card">
                <div className="flex gap-1 mb-4">
                  <span className="text-amber-400">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
                </div>
                <p className="text-sm text-[#6b7280] leading-relaxed mb-6">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${t.bg} flex items-center justify-center font-bold text-sm text-[#1a1a1a]`}>
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-[#6b7280]">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-28 bg-[#f8fafc]">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl font-bold tracking-tight mb-16">Questions</h2>

          <div className="space-y-3">
            {[
              { q: "Do I need an Instagram Business account?", a: "Yes, Instagram Business or Creator account is required by Meta API. You can switch a personal account to Business for free in Instagram settings in 2 minutes." },
              { q: "Can the bot say something wrong to a client?", a: "The bot responds strictly within the catalog you provide. If a question is outside its knowledge, it honestly says it will connect the customer with a manager. You can take over any conversation instantly." },
              { q: "How long does setup take?", a: "Connect Instagram — 5 minutes. Fill in your product catalog — 20-30 minutes. After that, the bot is live. No technical knowledge required." },
              { q: "Can I connect multiple Instagram accounts?", a: "Pro plan supports up to 3 accounts, Agency plan is unlimited. Each account has its own catalog and bot settings." },
              { q: "What if a customer refuses to give their phone number?", a: "The bot doesn't push or spam. It continues the conversation, answers questions, and gently returns to collecting contact info. The dialog stays in the system — managers can follow up manually." },
            ].map((faq) => (
              <details key={faq.q} className="feature-card overflow-hidden group">
                <summary className="flex items-center justify-between p-6 cursor-pointer">
                  <span className="font-medium pr-4">{faq.q}</span>
                  <span className="faq-icon text-xl text-indigo-500 shrink-0">+</span>
                </summary>
                <div className="px-6 pb-6 text-sm leading-relaxed text-[#6b7280]">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA + FOOTER */}
      <section className="bg-[#f0f2f5] pt-28 pb-12 px-6">
        {/* CTA Card */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="cta-card rounded-[28px] p-12 md:p-20 text-center text-white relative overflow-hidden">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-5 leading-tight relative z-10">
              Ready to keep<br />every lead?
            </h2>
            <p className="text-base md:text-lg text-white/70 mb-10 max-w-lg mx-auto leading-relaxed relative z-10">
              14 days free. No credit card. Cancel anytime.
              Your first lead could arrive tonight.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
              <Link href="/panel/register" className="bg-white text-[#1a1a1a] font-semibold text-sm py-3.5 px-8 rounded-xl hover:bg-gray-100 transition-all inline-block text-decoration-none">
                Start free trial &rarr;
              </Link>
              <a href="#how" className="text-sm text-white/70 hover:text-white transition-colors">
                See how it works
              </a>
            </div>
          </div>
        </div>

        {/* Footer Card */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-[28px] p-10 md:p-14">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">
              {/* Logo + Subscribe */}
              <div className="md:col-span-4">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="white">
                      <path d="M4 2a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V4a2 2 0 00-2-2H4zM10 2a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V4a2 2 0 00-2-2h-2zM4 8a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H4zM10 8a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z" />
                    </svg>
                  </div>
                  <span className="text-[0.95rem] font-bold text-[#1a1a1a]">Keep My Lead</span>
                </div>
                <p className="text-sm text-[#6b7280] leading-relaxed mb-5">
                  AI-powered lead capture for Instagram.<br />Never miss a customer again.
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Your email"
                    className="flex-1 text-sm px-4 py-2.5 rounded-xl border border-[#e5e7eb] bg-[#f8fafc] outline-none focus:border-indigo-300 transition-colors"
                  />
                  <button className="text-sm font-medium px-5 py-2.5 rounded-xl bg-[#1a1a1a] text-white hover:bg-black transition-colors">
                    Subscribe
                  </button>
                </div>
              </div>

              {/* Link columns */}
              <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
                <div>
                  <p className="text-xs font-semibold tracking-widest uppercase text-[#6b7280] mb-4">Product</p>
                  <div className="space-y-3 text-sm">
                    <a href="#features" className="block text-[#6b7280] hover:text-[#1a1a1a] transition-colors">Features</a>
                    <a href="#pricing" className="block text-[#6b7280] hover:text-[#1a1a1a] transition-colors">Pricing</a>
                    <a href="#how" className="block text-[#6b7280] hover:text-[#1a1a1a] transition-colors">How it works</a>
                    <a href="#faq" className="block text-[#6b7280] hover:text-[#1a1a1a] transition-colors">FAQ</a>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-widest uppercase text-[#6b7280] mb-4">Company</p>
                  <div className="space-y-3 text-sm">
                    <a href="#" className="block text-[#6b7280] hover:text-[#1a1a1a] transition-colors">About</a>
                    <a href="#" className="block text-[#6b7280] hover:text-[#1a1a1a] transition-colors">Blog</a>
                    <a href="#" className="block text-[#6b7280] hover:text-[#1a1a1a] transition-colors">Careers</a>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-widest uppercase text-[#6b7280] mb-4">Support</p>
                  <div className="space-y-3 text-sm">
                    <a href="#" className="block text-[#6b7280] hover:text-[#1a1a1a] transition-colors">Help center</a>
                    <a href="#" className="block text-[#6b7280] hover:text-[#1a1a1a] transition-colors">Contact</a>
                    <a href="#" className="block text-[#6b7280] hover:text-[#1a1a1a] transition-colors">Telegram</a>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-widest uppercase text-[#6b7280] mb-4">Legal</p>
                  <div className="space-y-3 text-sm">
                    <a href="#" className="block text-[#6b7280] hover:text-[#1a1a1a] transition-colors">Privacy</a>
                    <a href="#" className="block text-[#6b7280] hover:text-[#1a1a1a] transition-colors">Terms</a>
                    <a href="#" className="block text-[#6b7280] hover:text-[#1a1a1a] transition-colors">Cookies</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Copyright */}
            <div className="pt-8 border-t border-[#f0f0f0] flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-[#9ca3af]">&copy; 2026 Keep My Lead. All rights reserved.</p>
              <div className="flex items-center gap-5">
                <a href="#" className="text-[#9ca3af] hover:text-[#6b7280] transition-colors" aria-label="Instagram">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="5" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
                </a>
                <a href="#" className="text-[#9ca3af] hover:text-[#6b7280] transition-colors" aria-label="Telegram">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6.54l-2.16 10.2c-.16.72-.58.9-1.17.56l-3.24-2.39-1.56 1.5c-.17.17-.32.32-.65.32l.23-3.28 5.95-5.38c.26-.23-.06-.36-.4-.13l-7.35 4.62-3.16-1c-.69-.21-.7-.69.14-.99l12.37-4.76c.57-.21 1.07.14.88.99z" /></svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
