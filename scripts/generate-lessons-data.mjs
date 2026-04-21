import fs from "fs";
import path from "path";

const languageFolders = [
  "spanish",
  "french",
  "german",
  "japanese",
  "arabic",
  "turkish",
  "italian",
  "portuguese",
  "serbian",
  "persian",
  "hindi",
  "russian",
];

const topicMeta = [
  {
    id: 1,
    title: "At the Airport",
    description: "Check-in, boarding, and baggage claim.",
    place: { tr: "havaalanı", fa: "فرودگاه", en: "airport" },
    terms: {
      tr: ["pasaport", "bilet", "kapı", "uçuş", "bavul", "gecikme"],
      fa: ["گذرنامه", "بلیت", "گیت", "پرواز", "چمدان", "تاخیر"],
      en: ["passport", "ticket", "gate", "flight", "suitcase", "delay"],
    },
  },
  {
    id: 2,
    title: "At the Hotel",
    description: "Booking rooms and requesting services.",
    place: { tr: "otel", fa: "هتل", en: "hotel" },
    terms: {
      tr: ["rezervasyon", "oda", "anahtar", "resepsiyon", "kahvaltı", "asansör"],
      fa: ["رزرو", "اتاق", "کلید", "پذیرش", "صبحانه", "آسانسور"],
      en: ["reservation", "room", "key", "reception", "breakfast", "elevator"],
    },
  },
  {
    id: 3,
    title: "At a Café",
    description: "Ordering drinks and snacks.",
    place: { tr: "kafe", fa: "کافه", en: "cafe" },
    terms: {
      tr: ["kahve", "çay", "menü", "sipariş", "şeker", "hesap"],
      fa: ["قهوه", "چای", "منو", "سفارش", "شکر", "حساب"],
      en: ["coffee", "tea", "menu", "order", "sugar", "bill"],
    },
  },
  {
    id: 4,
    title: "At a Restaurant",
    description: "Ordering food and asking for the bill.",
    place: { tr: "restoran", fa: "رستوران", en: "restaurant" },
    terms: {
      tr: ["masa", "garson", "menü", "yemek", "içecek", "hesap"],
      fa: ["میز", "گارسون", "منو", "غذا", "نوشیدنی", "حساب"],
      en: ["table", "waiter", "menu", "food", "drink", "bill"],
    },
  },
  {
    id: 5,
    title: "At the Grocery Store",
    description: "Shopping for items and asking prices.",
    place: { tr: "market", fa: "فروشگاه مواد غذایی", en: "grocery store" },
    terms: {
      tr: ["sepet", "fiyat", "kilo", "sebze", "meyve", "kasa"],
      fa: ["سبد", "قیمت", "کیلو", "سبزیجات", "میوه", "صندوق"],
      en: ["basket", "price", "kilo", "vegetables", "fruit", "checkout"],
    },
  },
  {
    id: 6,
    title: "At the Bus Stop",
    description: "Asking for directions.",
    place: { tr: "otobüs durağı", fa: "ایستگاه اتوبوس", en: "bus stop" },
    terms: {
      tr: ["durak", "otobüs", "hat", "bilet", "saat", "yön"],
      fa: ["ایستگاه", "اتوبوس", "خط", "بلیت", "زمان", "جهت"],
      en: ["stop", "bus", "line", "ticket", "time", "direction"],
    },
  },
  {
    id: 7,
    title: "At the Train Station",
    description: "Buying tickets and finding schedules.",
    place: { tr: "tren istasyonu", fa: "ایستگاه قطار", en: "train station" },
    terms: {
      tr: ["tren", "peron", "bilet", "sefer", "varış", "kalkış"],
      fa: ["قطار", "سکو", "بلیت", "حرکت", "ورود", "خروج"],
      en: ["train", "platform", "ticket", "trip", "arrival", "departure"],
    },
  },
  {
    id: 8,
    title: "At the Pharmacy",
    description: "Asking for medication and dosage.",
    place: { tr: "eczane", fa: "داروخانه", en: "pharmacy" },
    terms: {
      tr: ["ilaç", "ağrı", "doz", "reçete", "tablet", "şurup"],
      fa: ["دارو", "درد", "دوز", "نسخه", "قرص", "شربت"],
      en: ["medicine", "pain", "dose", "prescription", "tablet", "syrup"],
    },
  },
  {
    id: 9,
    title: "At the Doctor's Office",
    description: "Describing symptoms and seeing a doctor.",
    place: { tr: "doktor muayenehanesi", fa: "مطب پزشک", en: "doctor's office" },
    terms: {
      tr: ["randevu", "doktor", "ateş", "öksürük", "muayene", "tedavi"],
      fa: ["نوبت", "پزشک", "تب", "سرفه", "معاینه", "درمان"],
      en: ["appointment", "doctor", "fever", "cough", "checkup", "treatment"],
    },
  },
  {
    id: 10,
    title: "At School",
    description: "Introducing yourself and academics.",
    place: { tr: "okul", fa: "مدرسه", en: "school" },
    terms: {
      tr: ["öğretmen", "öğrenci", "sınıf", "ders", "ödev", "sınav"],
      fa: ["معلم", "دانش‌آموز", "کلاس", "درس", "تکلیف", "امتحان"],
      en: ["teacher", "student", "class", "lesson", "homework", "exam"],
    },
  },
  {
    id: 11,
    title: "At Work",
    description: "Meetings, tasks, and colleagues.",
    place: { tr: "iş yeri", fa: "محل کار", en: "workplace" },
    terms: {
      tr: ["toplantı", "görev", "meslektaş", "ofis", "proje", "takvim"],
      fa: ["جلسه", "وظیفه", "همکار", "دفتر", "پروژه", "تقویم"],
      en: ["meeting", "task", "colleague", "office", "project", "calendar"],
    },
  },
  {
    id: 12,
    title: "At the Bank",
    description: "Transactions, currency, and accounts.",
    place: { tr: "banka", fa: "بانک", en: "bank" },
    terms: {
      tr: ["hesap", "kart", "para", "transfer", "döviz", "imza"],
      fa: ["حساب", "کارت", "پول", "انتقال", "ارز", "امضا"],
      en: ["account", "card", "money", "transfer", "currency", "signature"],
    },
  },
  {
    id: 13,
    title: "At the Post Office",
    description: "Sending packages and buying stamps.",
    place: { tr: "postane", fa: "اداره پست", en: "post office" },
    terms: {
      tr: ["paket", "pul", "adres", "teslimat", "zarf", "kargo"],
      fa: ["بسته", "تمبر", "آدرس", "تحویل", "پاکت", "پست"],
      en: ["package", "stamp", "address", "delivery", "envelope", "mail"],
    },
  },
  {
    id: 14,
    title: "At the Shopping Mall",
    description: "Sizes, prices, and returns.",
    place: { tr: "alışveriş merkezi", fa: "مرکز خرید", en: "shopping mall" },
    terms: {
      tr: ["beden", "fiyat", "indirim", "ödeme", "fiş", "iade"],
      fa: ["سایز", "قیمت", "تخفیف", "پرداخت", "رسید", "مرجوعی"],
      en: ["size", "price", "discount", "payment", "receipt", "return"],
    },
  },
  {
    id: 15,
    title: "At a Friend's House",
    description: "Small talk and socializing.",
    place: { tr: "arkadaşın evi", fa: "خانه دوست", en: "friend's house" },
    terms: {
      tr: ["misafir", "çay", "sohbet", "aile", "yemek", "teşekkürler"],
      fa: ["مهمان", "چای", "گفتگو", "خانواده", "غذا", "ممنون"],
      en: ["guest", "tea", "conversation", "family", "food", "thanks"],
    },
  },
];

function slugify(input) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function trTemplates(place, terms, enTerms) {
  const [t1, t2, t3, t4, t5, t6] = terms;
  const [e1, e2, e3, e4, e5, e6] = enTerms;
  return {
    vocabulary: terms.map((w, i) => ({ local: w, english: enTerms[i] ?? enTerms[0] })),
    keySentences: [
      { local: `${place} için ${t1} nerede?`, english: `Where is the ${e1} for the ${place}?`, answerLocal: `${t1} sağ tarafta.`, answerEnglish: `The ${e1} is on the right side.` },
      { local: `${t2} alabilir miyim?`, english: `Can I get a ${e2}?`, answerLocal: "Evet, hemen hazırlıyorum.", answerEnglish: "Yes, I will prepare it right away." },
      { local: `${t3} saat kaçta başlıyor?`, english: `What time does ${e3} start?`, answerLocal: `${t3} saat üçte başlıyor.`, answerEnglish: `${e3} starts at 3 o'clock.` },
      { local: `${t4} hakkında yardımcı olur musunuz?`, english: `Can you help with ${e4}?`, answerLocal: "Tabii, birlikte kontrol edelim.", answerEnglish: "Of course, let's check together." },
      { local: `${t5} var mı?`, english: `Do you have ${e5}?`, answerLocal: "Evet, burada mevcut.", answerEnglish: "Yes, it is available here." },
      { local: `Teşekkürler, ${t6} için ne yapmalıyım?`, english: `Thanks, what should I do for ${e6}?`, answerLocal: "Lütfen şu sırayı takip edin.", answerEnglish: "Please follow this order." },
    ],
    dialogue: [
      { speaker: "Staff", local: `Merhaba, ${place} hoş geldiniz.`, english: `Hello, welcome to the ${place}.` },
      { speaker: "You", local: `${t1} hakkında bilgi alabilir miyim?`, english: `Can I get information about ${e1}?` },
      { speaker: "Staff", local: `Tabii, ${t1} bu tarafta.`, english: `Sure, the ${e1} is on this side.` },
      { speaker: "You", local: `${t2} almak istiyorum.`, english: `I want to get ${e2}.` },
      { speaker: "Staff", local: "Tamam, hemen yardımcı oluyorum.", english: "Okay, I will help right away." },
      { speaker: "You", local: "Çok teşekkür ederim.", english: "Thank you very much." },
    ],
    listening: [
      { prompt: `${t1} nerede?`, promptEnglish: `Where is the ${e1}?`, options: [{ local: `${t1} sağ tarafta.`, english: `The ${e1} is on the right side.` }, { local: "Bilmiyorum.", english: "I don't know." }, { local: "Daha sonra gelin.", english: "Come later." }], correct: 0 },
      { prompt: `${t2} alabilir miyim?`, promptEnglish: `Can I get ${e2}?`, options: [{ local: "Evet, tabii.", english: "Yes, of course." }, { local: "Hayır, kapalı.", english: "No, it's closed." }, { local: "Belki yarın.", english: "Maybe tomorrow." }], correct: 0 },
      { prompt: `${t3} saat kaçta?`, promptEnglish: `What time is ${e3}?`, options: [{ local: "Saat üçte.", english: "At 3 o'clock." }, { local: "Bugün değil.", english: "Not today." }, { local: "Hiç yok.", english: "There isn't any." }], correct: 0 },
    ],
    speakingPrompts: [
      { ai: `Merhaba. ${place} için ilk sorunuz nedir?`, aiEnglish: `Hello. What's your first question for the ${place}?`, expected: `${t1} nerede?`, expectedEnglish: `Where is the ${e1}?` },
      { ai: `${t2} ile ilgili ne söylersiniz?`, aiEnglish: `What would you say about ${e2}?`, expected: `${t2} alabilir miyim?`, expectedEnglish: `Can I get ${e2}?` },
      { ai: `${t3} saatini sorar mısınız?`, aiEnglish: `Can you ask the time for ${e3}?`, expected: `${t3} saat kaçta?`, expectedEnglish: `What time is ${e3}?` },
    ],
  };
}

function faTemplates(place, terms, enTerms) {
  const [t1, t2, t3, t4, t5, t6] = terms;
  const [e1, e2, e3, e4, e5, e6] = enTerms;
  return {
    vocabulary: terms.map((w, i) => ({ local: w, english: enTerms[i] ?? enTerms[0] })),
    keySentences: [
      { local: `برای ${place} ${t1} کجاست؟`, english: `Where is the ${e1} for the ${place}?`, answerLocal: `${t1} سمت راست است.`, answerEnglish: `The ${e1} is on the right side.` },
      { local: `می‌توانم ${t2} بگیرم؟`, english: `Can I get ${e2}?`, answerLocal: "بله، همین الان آماده می‌کنم.", answerEnglish: "Yes, I will prepare it right now." },
      { local: `${t3} چه ساعتی شروع می‌شود؟`, english: `What time does ${e3} start?`, answerLocal: `${t3} ساعت سه شروع می‌شود.`, answerEnglish: `${e3} starts at 3 o'clock.` },
      { local: `در مورد ${t4} کمک می‌کنید؟`, english: `Can you help with ${e4}?`, answerLocal: "حتما، با هم بررسی می‌کنیم.", answerEnglish: "Sure, we will check together." },
      { local: `${t5} دارید؟`, english: `Do you have ${e5}?`, answerLocal: "بله، اینجا موجود است.", answerEnglish: "Yes, it is available here." },
      { local: `ممنون، برای ${t6} چه کار کنم؟`, english: `Thanks, what should I do for ${e6}?`, answerLocal: "لطفا این مراحل را انجام دهید.", answerEnglish: "Please follow these steps." },
    ],
    dialogue: [
      { speaker: "Staff", local: `سلام، به ${place} خوش آمدید.`, english: `Hello, welcome to the ${place}.` },
      { speaker: "You", local: `می‌توانم درباره ${t1} سوال کنم؟`, english: `Can I ask about ${e1}?` },
      { speaker: "Staff", local: `بله، ${t1} این طرف است.`, english: `Yes, the ${e1} is this way.` },
      { speaker: "You", local: `می‌خواهم ${t2} بگیرم.`, english: `I want to get ${e2}.` },
      { speaker: "Staff", local: "حتما، الان کمک می‌کنم.", english: "Sure, I will help now." },
      { speaker: "You", local: "خیلی ممنون.", english: "Thank you very much." },
    ],
    listening: [
      { prompt: `${t1} کجاست؟`, promptEnglish: `Where is the ${e1}?`, options: [{ local: `${t1} سمت راست است.`, english: `The ${e1} is on the right side.` }, { local: "نمی‌دانم.", english: "I don't know." }, { local: "بعدا بیایید.", english: "Come later." }], correct: 0 },
      { prompt: `می‌توانم ${t2} بگیرم؟`, promptEnglish: `Can I get ${e2}?`, options: [{ local: "بله، حتما.", english: "Yes, of course." }, { local: "خیر، بسته است.", english: "No, it's closed." }, { local: "شاید فردا.", english: "Maybe tomorrow." }], correct: 0 },
      { prompt: `${t3} چه ساعتی است؟`, promptEnglish: `What time is ${e3}?`, options: [{ local: "ساعت سه.", english: "At 3 o'clock." }, { local: "امروز نه.", english: "Not today." }, { local: "اصلا نیست.", english: "There isn't any." }], correct: 0 },
    ],
    speakingPrompts: [
      { ai: `سلام. اولین سوال شما برای ${place} چیست؟`, aiEnglish: `Hello. What's your first question for the ${place}?`, expected: `${t1} کجاست؟`, expectedEnglish: `Where is the ${e1}?` },
      { ai: `درباره ${t2} چه می‌گویید؟`, aiEnglish: `What would you say about ${e2}?`, expected: `می‌توانم ${t2} بگیرم؟`, expectedEnglish: `Can I get ${e2}?` },
      { ai: `ساعت ${t3} را بپرسید.`, aiEnglish: `Ask the time for ${e3}.`, expected: `${t3} چه ساعتی است؟`, expectedEnglish: `What time is ${e3}?` },
    ],
  };
}

function buildQuizFromLesson(lessonData) {
  return [
    {
      question: `What does "${lessonData.vocabulary[0].local}" mean?`,
      options: [
        lessonData.vocabulary[0].english,
        lessonData.vocabulary[1].english,
        lessonData.vocabulary[2].english,
        lessonData.vocabulary[3].english,
      ],
      correct: 0,
    },
    {
      question: `Choose the best meaning for "${lessonData.vocabulary[1].local}".`,
      options: [
        lessonData.vocabulary[3].english,
        lessonData.vocabulary[1].english,
        lessonData.vocabulary[4].english,
        lessonData.vocabulary[2].english,
      ],
      correct: 1,
    },
    {
      question: `A correct response to "${lessonData.listening[0].promptEnglish}" is:`,
      options: lessonData.listening[0].options.map((o) => o.english),
      correct: lessonData.listening[0].correct,
    },
    {
      question: "Which phrase asks for help politely?",
      options: [
        lessonData.keySentences[3].local,
        lessonData.keySentences[2].answerLocal,
        lessonData.keySentences[1].answerLocal,
        lessonData.keySentences[0].answerLocal,
      ],
      correct: 0,
    },
  ];
}

function toCsv(rows) {
  const escape = (value) => `"${String(value).replace(/"/g, '""')}"`;
  const header = ["section", "payload_json"].join(",");
  const lines = rows.map((row) => [escape(row.section), escape(row.payload_json)].join(","));
  return [header, ...lines].join("\n");
}

function writeCsvForLanguage(language, lesson, lessonData, lessonDir) {
  const rows = [];
  rows.push({
    section: "metadata",
    payload_json: JSON.stringify({
      title: lesson.title,
      description: lesson.description,
    }),
  });
  lessonData.vocabulary.forEach((item) =>
    rows.push({ section: "vocabulary", payload_json: JSON.stringify(item) })
  );
  lessonData.keySentences.forEach((item) =>
    rows.push({ section: "keySentence", payload_json: JSON.stringify(item) })
  );
  lessonData.dialogue.forEach((item) =>
    rows.push({ section: "dialogue", payload_json: JSON.stringify(item) })
  );
  lessonData.listening.forEach((item) =>
    rows.push({ section: "listening", payload_json: JSON.stringify(item) })
  );
  lessonData.speakingPrompts.forEach((item) =>
    rows.push({ section: "speakingPrompt", payload_json: JSON.stringify(item) })
  );
  buildQuizFromLesson(lessonData).forEach((item) =>
    rows.push({ section: "quizQuestion", payload_json: JSON.stringify(item) })
  );

  const outPath = path.join(lessonDir, "lesson-data.csv");
  fs.writeFileSync(outPath, toCsv(rows));
}

function ensureLessonFolders() {
  const root = path.join(process.cwd(), "lessons");
  fs.mkdirSync(root, { recursive: true });

  for (const language of languageFolders) {
    const languageDir = path.join(root, language);
    fs.mkdirSync(languageDir, { recursive: true });

    for (const lesson of topicMeta) {
      const lessonDir = path.join(
        languageDir,
        `lesson-${String(lesson.id).padStart(2, "0")}-${slugify(lesson.title)}`
      );
      fs.mkdirSync(lessonDir, { recursive: true });

      if (language === "turkish") {
        writeCsvForLanguage(
          "turkish",
          lesson,
          trTemplates(lesson.place.tr, lesson.terms.tr, lesson.terms.en),
          lessonDir
        );
      } else if (language === "persian") {
        writeCsvForLanguage(
          "persian",
          lesson,
          faTemplates(lesson.place.fa, lesson.terms.fa, lesson.terms.en),
          lessonDir
        );
      } else {
        const placeholder = path.join(lessonDir, "README.md");
        if (!fs.existsSync(placeholder)) {
          fs.writeFileSync(
            placeholder,
            `# ${lesson.title}\n\nPlaceholder lesson folder for ${language}.\n`
          );
        }
      }
    }
  }
}

ensureLessonFolders();
console.log("Generated lessons folder structure and CSV data for Turkish/Persian.");
