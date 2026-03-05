"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type Lang = "ua" | "en";

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: "ua",
  setLang: () => {},
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("ua");
  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}

export function useT() {
  const { lang } = useLang();
  return useCallback((ua: string, en: string) => (lang === "ua" ? ua : en), [lang]);
}

export const t = {
  nav: {
    howItWorks: { ua: "Як це працює", en: "How it works" },
    pricing: { ua: "Тарифи", en: "Pricing" },
    faq: { ua: "FAQ", en: "FAQ" },
    signIn: { ua: "Увійти", en: "Sign in" },
    getStarted: { ua: "Почати", en: "Get started" },
    dashboard: { ua: "Панель", en: "Dashboard" },
  },
  hero: {
    badge: { ua: "Instagram AI Асистент", en: "Instagram AI Assistant" },
    title1: { ua: "Ваші ліди", en: "Your leads" },
    title2: { ua: "більше не\nвтікають", en: "never slip\naway again" },
    desc: {
      ua: "Поки ви спите — бот відповідає. Кваліфікує. Прогріває. І доставляє готового до покупки клієнта вашій команді.",
      en: "While you sleep — the bot responds. Qualifies. Nurtures. And delivers a ready-to-buy customer to your team.",
    },
    cta: { ua: "Підключити Instagram", en: "Connect Instagram" },
    watchDemo: { ua: "Дивитись демо", en: "Watch demo" },
    alreadyConnected: { ua: "вже підключили свій Instagram", en: "already connected their Instagram" },
    readyToBuy: { ua: "готового до покупки", en: "ready-to-buy" },
  },
  marquee: {
    items: {
      ua: ["INSTAGRAM ЛІДИ", "АВТО-ВІДПОВІДЬ В DM", "CLAUDE AI", "ГАРЯЧІ ЛІДИ МЕНЕДЖЕРУ", "ПРАЦЮЄ 24/7"],
      en: ["INSTAGRAM LEADS", "AUTO-REPLY IN DM", "CLAUDE AI", "HOT LEADS TO MANAGER", "WORKS 24/7"],
    },
  },
  // iPhone chat
  chat: {
    repliedToStory: { ua: "Відповів на вашу історію", en: "Replied to your story" },
    msg1: { ua: "Хочу записатися! Скільки коштує курс? 🔥", en: "I want to enroll! How much is the course? 🔥" },
    msg2: { ua: "Привіт! 👋 Я асистент школи Beauty Expert. Курс перманентного макіяжу — чудовий вибір!", en: "Hi! 👋 I'm the assistant for Beauty Expert school. Our permanent makeup course — great choice!" },
    msg3: { ua: "Що входить? І скільки коштує?", en: "What's included? And how much?" },
    msg4: { ua: "3 місяці практики, живі моделі, міжнародний сертифікат. Розстрочка 0%! Як вас звати і ваш телефон?", en: "3 months of practice, live models, international certificate. 0% installment available! What's your name and phone?" },
    msg5: { ua: "Настя, +380 99 123 4567", en: "Nastya, +1 555 123 4567" },
    hotLead: { ua: "Гарячий лід відправлено менеджеру", en: "Hot lead sent to manager" },
  },
  // Before / After section
  beforeAfter: {
    label: { ua: "Без бота vs З ботом", en: "Without bot vs With bot" },
    title1: { ua: "Поки ти спиш —", en: "While you sleep —" },
    title2: { ua: "лід вже пішов", en: "the lead is gone" },
    desc: {
      ua: "Менеджер відповідає через 4 години. Бот — через 2 секунди. Різниця в грошах.",
      en: "Manager responds in 4 hours. Bot — in 2 seconds. The difference is money.",
    },
    before: { ua: "Без бота", en: "Without bot" },
    after: { ua: "З ботом", en: "With bot" },
    beforeMsg1: { ua: "Скільки коштує курс? 🔥", en: "How much is the course? 🔥" },
    beforeMsg2: { ua: "Хочу записатися сьогодні", en: "I want to enroll today" },
    beforeMsg3: { ua: "Доброго дня! Курс коштує...", en: "Good morning! The course costs..." },
    beforeBadge: {
      ua: "Відповідь через 8 год 25 хв. Лід пішов до конкурентів",
      en: "Response after 8h 25min. Lead went to competitors",
    },
    beforeStatus: { ua: "Продаж втрачено", en: "Sale lost" },
    afterMsg1: { ua: "Скільки коштує курс? 🔥", en: "How much is the course? 🔥" },
    afterMsg2: {
      ua: "Привіт! 👋 Курс коштує 12 990 грн. Є розстрочка 0%. Як тебе звати?",
      en: "Hi! 👋 The course is $299. 0% installment available. What's your name?",
    },
    afterMsg3: { ua: "Настя, +380 99 123 45 67", en: "Nastya, +1 555 123 4567" },
    afterBadge: {
      ua: "Гарячий лід відправлено менеджеру",
      en: "Hot lead sent to manager",
    },
    afterStatus: { ua: "Угоду закрито вранці", en: "Deal closed in the morning" },
  },
  // Live Feed section
  liveFeed: {
    label: { ua: "Прямо зараз", en: "Right now" },
    title1: { ua: "Ліди течуть —", en: "Leads flow in —" },
    title2: { ua: "жоден не втрачається", en: "none get lost" },
    desc: {
      ua: "Кожен, хто написав в Instagram, проходить кваліфікацію. Менеджер отримує тільки гарячих — з ім'ям, номером і контекстом.",
      en: "Everyone who writes on Instagram gets qualified. Manager only gets hot ones — with name, number, and context.",
    },
    hotLeadsNow: { ua: "Гарячі ліди — зараз", en: "Hot leads — now" },
    today: { ua: "сьогодні", en: "today" },
    qualified: { ua: "кваліфіковано", en: "qualified" },
    avgResponse: { ua: "сер. відповідь", en: "avg response" },
    conversion: { ua: "конверсія", en: "conversion" },
    justNow: { ua: "щойно", en: "just now" },
    leads: {
      ua: [
        { name: "Анастасія К.", action: "Залишила номер телефону", tag: "hot" },
        { name: "Дмитро В.", action: "Запитав про розстрочку", tag: "warm" },
        { name: "Марина С.", action: "Кваліфікована ботом", tag: "qual" },
        { name: "Ольга П.", action: "Написала \"хочу записатися\"", tag: "hot" },
        { name: "Сергій М.", action: "Просить зателефонувати", tag: "qual" },
        { name: "Катя Л.", action: "Відповіла на story", tag: "warm" },
        { name: "Нікіта Р.", action: "Залишив email", tag: "qual" },
        { name: "Юлія Ф.", action: "Запитала про курс", tag: "warm" },
      ],
      en: [
        { name: "Anastasia K.", action: "Left phone number", tag: "hot" },
        { name: "Dmitro V.", action: "Asked about installment", tag: "warm" },
        { name: "Marina S.", action: "Qualified by bot", tag: "qual" },
        { name: "Olga P.", action: "Wrote \"want to enroll\"", tag: "hot" },
        { name: "Sergiy M.", action: "Asks for a call", tag: "qual" },
        { name: "Kate L.", action: "Replied to story", tag: "warm" },
        { name: "Nikita R.", action: "Left email", tag: "qual" },
        { name: "Yulia F.", action: "Asked about course", tag: "warm" },
      ],
    },
    tagLabels: {
      ua: { hot: "🔥 Гарячий", warm: "💬 Теплий", qual: "✓ Готов" },
      en: { hot: "🔥 Hot", warm: "💬 Warm", qual: "✓ Ready" },
    },
  },
  // Timeline section
  timeline: {
    label: { ua: "Одна ніч · Один лід", en: "One night · One lead" },
    title1: { ua: "Від \"цікаво\"", en: "From \"interested\"" },
    title2: { ua: "до \"оплачено\"", en: "to \"paid\"" },
    desc: {
      ua: "Поки менеджер спить — бот проводить повний цикл кваліфікації. Вранці в CRM вже готовий клієнт.",
      en: "While the manager sleeps — the bot runs the full qualification cycle. In the morning, there's a ready client in the CRM.",
    },
    steps: {
      ua: [
        { time: "23:47", label: "Вхідне", text: "Настя написала в Instagram", sub: "\"Скільки коштує курс? Хочу записатися 🔥\"" },
        { time: "23:47:02", label: "Відповідь бота", text: "Бот привітався і розповів про курс", mini: "⚡ 2 секунди", miniClass: "mini-cyan" },
        { time: "23:49", label: "Кваліфікація", text: "Настя залишила ім'я та номер телефону", mini: "✓ Дані отримано", miniClass: "mini-green" },
        { time: "23:49", label: "Сповіщення", text: "Менеджер отримав картку ліда в CRM", sub: "Ім'я · Телефон · Історія діалогу · Інтерес" },
        { time: "09:03", label: "Підсумок", text: "Менеджер зателефонував. Угоду закрито.", mini: "🔥 12 990 грн", miniClass: "mini-orange" },
      ],
      en: [
        { time: "23:47", label: "Incoming", text: "Nastya wrote on Instagram", sub: "\"How much is the course? I want to enroll 🔥\"" },
        { time: "23:47:02", label: "Bot reply", text: "Bot greeted and told about the course", mini: "⚡ 2 seconds", miniClass: "mini-cyan" },
        { time: "23:49", label: "Qualification", text: "Nastya left her name and phone number", mini: "✓ Data received", miniClass: "mini-green" },
        { time: "23:49", label: "Notification", text: "Manager received lead card in CRM", sub: "Name · Phone · Chat history · Interest" },
        { time: "09:03", label: "Result", text: "Manager called. Deal closed.", mini: "🔥 $299", miniClass: "mini-orange" },
      ],
    },
  },
  // How it works
  how: {
    title: { ua: "Як це працює", en: "How it works" },
    desc: {
      ua: "Підключіть Instagram, налаштуйте каталог — і бот починає продавати. Без коду, без технічних навичок.",
      en: "Connect Instagram, set up your catalog — and the bot starts selling. No code, no tech skills.",
    },
    steps: {
      ua: [
        { num: "01", title: "Підключіть Instagram", desc: "OAuth в один клік. Без API-ключів, паролів та технічних налаштувань." },
        { num: "02", title: "Додайте продукти", desc: "Описи, ціни, переваги, обробка заперечень. Бот знає ваш бізнес." },
        { num: "03", title: "Бот продає за вас", desc: "Відповідає на коментарі, спілкується в DM, обробляє заперечення та збирає контакти." },
        { num: "04", title: "Лід менеджеру", desc: "Ім'я + телефон + інтерес потрапляють у Telegram. Менеджер дзвонить гарячому клієнту." },
      ],
      en: [
        { num: "01", title: "Connect Instagram", desc: "One-click OAuth. No API keys, passwords, or technical setup required." },
        { num: "02", title: "Add your products", desc: "Descriptions, prices, value props, objection handlers. The bot knows your business." },
        { num: "03", title: "Bot sells for you", desc: "Responds to comments, chats in DMs, handles objections, and collects contacts." },
        { num: "04", title: "Lead to manager", desc: "Name + phone + interest land in Telegram. Manager calls a hot customer." },
      ],
    },
  },
  // Features
  features: {
    title1: { ua: "Не просто чат-бот.", en: "Not just a chatbot." },
    title2: { ua: "Ваш найрозумніший продавець.", en: "Your smartest salesperson." },
    deepKnowledge: {
      title: { ua: "Глибоке знання продукту", en: "Deep Product Knowledge" },
      desc: {
        ua: "Бот знає переваги, заперечення, цільову аудиторію та процес покупки. Розмови як з вашим найкращим менеджером.",
        en: "The bot knows value props, objections, target audience, and buying process. Conversations feel like talking to your best sales rep.",
      },
      valueProp: { ua: "Переваги", en: "Value proposition" },
      valuePropText: { ua: "17 років досвіду · сертифікат · 2400+ випускників", en: "17 years experience · certified · 2400+ graduates" },
      objection: { ua: "Заперечення: \"дорого\"", en: "Objection: \"too expensive\"" },
      objectionText: { ua: "Розстрочка 0%, 6 місяців. Перший платіж через 30 днів.", en: "0% installment, 6 months. First payment in 30 days." },
    },
    multiTenant: { title: { ua: "Мультитенант", en: "Multi-tenant" }, desc: { ua: "Кожен клієнт отримує ізольований акаунт зі своїм Instagram, каталогом та налаштуваннями бота.", en: "Each client gets an isolated account with their own Instagram, catalog, and bot settings." } },
    salesFunnel: { title: { ua: "Воронка продажів", en: "Sales Funnel" }, desc: { ua: "Захоплення, кваліфікація, презентація, збір контакту. Бот веде клієнтів крок за кроком.", en: "Capture, qualify, present, collect contact. The bot guides customers step by step." } },
    telegramAlerts: { title: { ua: "Сповіщення в Telegram", en: "Telegram Alerts" }, desc: { ua: "Гарячі ліди потрапляють прямо до менеджерів. Ім'я, телефон, інтерес та повна історія чату.", en: "Hot leads go straight to your managers. Name, phone, interest, and full chat history." } },
    humanTakeover: { title: { ua: "Передача менеджеру", en: "Human Takeover" }, desc: { ua: "Менеджери можуть підключитися до будь-якої розмови одним кліком. Бот відходить у бік.", en: "Managers can jump into any conversation with one click. The bot steps aside." } },
  },
  // Pricing
  pricing: {
    title: { ua: "Прості тарифи", en: "Simple pricing" },
    desc: { ua: "14 днів безкоштовно. Без кредитної картки.", en: "14-day free trial. No credit card required." },
    starter: { ua: "Стартер", en: "Starter" },
    pro: { ua: "Про", en: "Pro" },
    agency: { ua: "Агенція", en: "Agency" },
    popular: { ua: "Популярний", en: "Popular" },
    mo: { ua: "/міс", en: "/mo" },
    starterDesc: { ua: "500 розмов · 1 акаунт", en: "500 conversations · 1 account" },
    proDesc: { ua: "3 000 розмов · 3 акаунти", en: "3,000 conversations · 3 accounts" },
    agencyDesc: { ua: "Необмежено · Необмежено акаунтів", en: "Unlimited · Unlimited accounts" },
    starterFeatures: {
      ua: ["Instagram DM + коментарі", "До 10 продуктів", "Сповіщення в Telegram"],
      en: ["Instagram DM + comments", "Up to 10 products", "Telegram notifications"],
    },
    starterDisabled: { ua: "Аналітична панель", en: "Analytics dashboard" },
    proFeatures: {
      ua: ["Все зі Стартера", "Необмежений каталог", "Аналітична панель", "Передача менеджеру"],
      en: ["Everything in Starter", "Unlimited catalog", "Analytics dashboard", "Human takeover"],
    },
    agencyFeatures: {
      ua: ["Все з Про", "White-label", "Доступ до API", "Пріоритетна підтримка"],
      en: ["Everything in Pro", "White-label", "API access", "Priority support"],
    },
    startFree: { ua: "Почати безкоштовно", en: "Start free" },
    tryFree: { ua: "Спробувати 14 днів безкоштовно", en: "Try 14 days free" },
    contactUs: { ua: "Зв'язатися з нами", en: "Contact us" },
  },
  // Testimonials
  testimonials: {
    title: { ua: "Що кажуть наші клієнти", en: "What our clients say" },
    items: {
      ua: [
        { quote: "Раніше втрачала 20-30 лідів щотижня. Менеджер просто не встигав. Тепер бот відповідає миттєво і я отримую готових до покупки клієнтів по телефону.", name: "Марина О.", role: "Школа краси, Київ" },
        { quote: "Налаштувала за один вечір. Бот знає всі мої продукти, обробляє заперечення краще за деяких менеджерів. ROI окупився за перший тиждень.", name: "Олексій Д.", role: "Фітнес-тренер, Харків" },
        { quote: "Використовую для 5 акаунтів агенції. Кожен клієнт має свого бота з індивідуальним каталогом. Це просто інший рівень роботи.", name: "Катерина М.", role: "Діджитал агенція, Львів" },
      ],
      en: [
        { quote: "Used to lose 20-30 leads weekly. Manager just couldn't keep up. Now the bot responds instantly and I get ready-to-buy clients on the phone.", name: "Marina O.", role: "Beauty school, Kyiv" },
        { quote: "Set it up in one evening. The bot knows all my products, handles objections better than some of my managers. ROI paid off in the first week.", name: "Alex D.", role: "Fitness coach, Kharkiv" },
        { quote: "Using it for 5 agency accounts. Each client gets their own bot with individual catalog. This is just a different level of work.", name: "Kate M.", role: "Digital agency, Lviv" },
      ],
    },
  },
  // FAQ
  faq: {
    title: { ua: "Питання", en: "Questions" },
    items: {
      ua: [
        { q: "Чи потрібен бізнес-акаунт Instagram?", a: "Так, потрібен Instagram Business або Creator акаунт для Meta API. Ви можете перемкнути особистий акаунт на Business безкоштовно в налаштуваннях Instagram за 2 хвилини." },
        { q: "Чи може бот сказати щось неправильне клієнту?", a: "Бот відповідає строго в межах каталогу, який ви надаєте. Якщо питання за межами його знань, він чесно скаже, що з'єднає клієнта з менеджером. Ви можете перехопити будь-яку розмову миттєво." },
        { q: "Скільки часу займає налаштування?", a: "Підключити Instagram — 5 хвилин. Заповнити каталог продуктів — 20-30 хвилин. Після цього бот працює. Ніяких технічних знань не потрібно." },
        { q: "Чи можу я підключити кілька акаунтів Instagram?", a: "Тариф Про підтримує до 3 акаунтів, тариф Агенція — необмежено. Кожен акаунт має свій каталог та налаштування бота." },
        { q: "Що якщо клієнт відмовляється давати номер телефону?", a: "Бот не тисне і не спамить. Він продовжує розмову, відповідає на питання і м'яко повертається до збору контактної інформації. Діалог залишається в системі — менеджери можуть продовжити вручну." },
      ],
      en: [
        { q: "Do I need an Instagram Business account?", a: "Yes, Instagram Business or Creator account is required by Meta API. You can switch a personal account to Business for free in Instagram settings in 2 minutes." },
        { q: "Can the bot say something wrong to a client?", a: "The bot responds strictly within the catalog you provide. If a question is outside its knowledge, it honestly says it will connect the customer with a manager. You can take over any conversation instantly." },
        { q: "How long does setup take?", a: "Connect Instagram — 5 minutes. Fill in your product catalog — 20-30 minutes. After that, the bot is live. No technical knowledge required." },
        { q: "Can I connect multiple Instagram accounts?", a: "Pro plan supports up to 3 accounts, Agency plan is unlimited. Each account has its own catalog and bot settings." },
        { q: "What if a customer refuses to give their phone number?", a: "The bot doesn't push or spam. It continues the conversation, answers questions, and gently returns to collecting contact info. The dialog stays in the system — managers can follow up manually." },
      ],
    },
  },
  // CTA
  cta: {
    label: { ua: "Почніть зараз", en: "Start now" },
    title1: { ua: "Перестаньте втрачати", en: "Stop losing" },
    title2: { ua: "лідів сьогодні", en: "leads today" },
    desc: {
      ua: "14 днів безкоштовно. Без кредитної картки. Скасувати будь-коли. Ваш перший лід може прийти сьогодні ввечері.",
      en: "14 days free. No credit card. Cancel anytime. Your first lead could arrive tonight.",
    },
    button: { ua: "Підключити Instagram безкоштовно", en: "Connect Instagram free" },
    sub: {
      ua: "Налаштування за 10 хвилин · Працює 24/7 · Підтримка в Telegram",
      en: "Setup takes 10 minutes · Works 24/7 · Telegram support",
    },
  },
  footer: {
    rights: { ua: "Усі права захищені", en: "All rights reserved" },
    privacy: { ua: "Політика конфіденційності", en: "Privacy Policy" },
    terms: { ua: "Умови використання", en: "Terms of Service" },
  },
} as const;
