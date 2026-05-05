export type SupportedLanguage =
  | "tr"
  | "fa"
  | "sr"
  | "ru"
  | "es"
  | "fr"
  | "de"
  | "ja"
  | "ar"
  | "hi"
  | "it"
  | "pt";

export interface TopicMeta {
  id: number;
  title: string;
  description: string;
  place: {
    tr: string;
    fa: string;
    en: string;
    sr: string;
  };
  terms: {
    tr: string[];
    fa: string[];
    en: string[];
    sr: string[];
  };
}

export const TOPIC_META: TopicMeta[] = [
  {
    id: 1,
    title: "At the Airport",
    description: "Check-in, boarding, and baggage claim.",
    place: { tr: "havaalanı", fa: "فرودگاه", en: "airport", sr: "aerodrom" },
    terms: {
      tr: ["pasaport", "bilet", "kapı", "uçuş", "bavul", "gecikme"],
      fa: ["گذرنامه", "بلیت", "گیت", "پرواز", "چمدان", "تاخیر"],
      en: ["passport", "ticket", "gate", "flight", "suitcase", "delay"],
      sr: ["pasoš", "karta", "kapija", "let", "kofer", "kašnjenje"],
    },
  },
  {
    id: 2,
    title: "At the Hotel",
    description: "Booking rooms and requesting services.",
    place: { tr: "otel", fa: "هتل", en: "hotel", sr: "hotel" },
    terms: {
      tr: ["rezervasyon", "oda", "anahtar", "resepsiyon", "kahvaltı", "asansör"],
      fa: ["رزرو", "اتاق", "کلید", "پذیرش", "صبحانه", "آسانسور"],
      en: ["reservation", "room", "key", "reception", "breakfast", "elevator"],
      sr: ["rezervacija", "soba", "ključ", "recepција", " breakfast", "lift"],
    },
  },
  {
    id: 3,
    title: "At a Café",
    description: "Ordering drinks and snacks.",
    place: { tr: "kafe", fa: "کافه", en: "cafe", sr: "kafa" },
    terms: {
      tr: ["kahve", "çay", "menü", "sipariş", "şeker", "hesap"],
      fa: ["قهوه", "چای", "منو", "سفارش", "شکر", "حساب"],
      en: ["coffee", "tea", "menu", "order", "sugar", "bill"],
      sr: ["kafa", "čaj", "meni", "narudžba", "šećer", "račun"],
    },
  },
  {
    id: 4,
    title: "At a Restaurant",
    description: "Ordering food and asking for the bill.",
    place: { tr: "restoran", fa: "رستوران", en: "restaurant", sr: "restoran" },
    terms: {
      tr: ["masa", "garson", "menü", "yemek", "içecek", "hesap"],
      fa: ["میز", "گارسون", "منو", "غذا", "نوشیدنی", "حساب"],
      en: ["table", "waiter", "menu", "food", "drink", "bill"],
      sr: ["stol", "kelner", "meni", "jelo", "piće", "račun"],
    },
  },
  {
    id: 5,
    title: "At the Grocery Store",
    description: "Shopping for items and asking prices.",
    place: { tr: "market", fa: "فروشگاه مواد غذایی", en: "grocery store", sr: "prodavnica" },
    terms: {
      tr: ["sepet", "fiyat", "kilo", "sebze", "meyve", "kasa"],
      fa: ["سبد", "قیمت", "کیلو", "سبزیجات", "میوه", "صندوق"],
      en: ["basket", "price", "kilo", "vegetables", "fruit", "checkout"],
      sr: ["korpa", "cena", "kilogram", "povrće", "voće", "kasa"],
    },
  },
  {
    id: 6,
    title: "At the Bus Stop",
    description: "Asking for directions.",
    place: { tr: "otobüs durağı", fa: "ایستگاه اتوبوس", en: "bus stop", sr: "autobuska stanica" },
    terms: {
      tr: ["durak", "otobüs", "hat", "bilet", "saat", "yön"],
      fa: ["ایستگاه", "اتوبوس", "خط", "بلیت", "زمان", "جهت"],
      en: ["stop", "bus", "line", "ticket", "time", "direction"],
      sr: ["stanica", "autobus", "linija", "karta", "vrijeme", "smjer"],
    },
  },
  {
    id: 7,
    title: "At the Train Station",
    description: "Buying tickets and finding schedules.",
    place: { tr: "tren istasyonu", fa: "ایستگاه قطار", en: "train station", sr: "železnička stanica" },
    terms: {
      tr: ["tren", "peron", "bilet", "sefer", "varış", "kalkış"],
      fa: ["قطار", "سکو", "بلیت", "حرکت", "ورود", "خروج"],
      en: ["train", "platform", "ticket", "trip", "arrival", "departure"],
      sr: ["vlak", "platforma", "kartica", "putovanje", "dolazak", "polazak"],
    },
  },
  {
    id: 8,
    title: "At the Pharmacy",
    description: "Asking for medication and dosage.",
    place: { tr: "eczane", fa: "داروخانه", en: "pharmacy", sr: "apteka" },
    terms: {
      tr: ["ilaç", "ağrı", "doz", "reçete", "tablet", "şurup"],
      fa: ["دارو", "درد", "دوز", "نسخه", "قرص", "شربت"],
      en: ["medicine", "pain", "dose", "prescription", "tablet", "syrup"],
      sr: ["lekar", "bolja", "dоzа", "recept", "tableta", "sirup"],
    },
  },
  {
    id: 9,
    title: "At the Doctor's Office",
    description: "Describing symptoms and seeing a doctor.",
    place: { tr: "doktor muayenehanesi", fa: "مطب پزشک", en: "doctor's office", sr: "klinika" },
    terms: {
      tr: ["randevu", "doktor", "ateş", "öksürük", "muayene", "tedavi"],
      fa: ["نوبت", "پزشک", "تب", "سرفه", "معاینه", "درمان"],
      en: ["appointment", "doctor", "fever", "cough", "checkup", "treatment"],
      sr: ["termin", "lekar", "grip", "kašlja", "pregled", "tretman"],
    },
  },
  {
    id: 10,
    title: "At School",
    description: "Introducing yourself and academics.",
    place: { tr: "okul", fa: "مدرسه", en: "school", sr: "škola" },
    terms: {
      tr: ["öğretmen", "öğrenci", "sınıf", "ders", "ödev", "sınav"],
      fa: ["معلم", "دانش‌آموز", "کلاس", "درس", "تکلیف", "امتحان"],
      en: ["teacher", "student", "class", "lesson", "homework", "exam"],
      sr: ["učitelj", "učenik", "razred", "čas", "domaći zadatak", "ispit"],
    },
  },
  {
    id: 11,
    title: "At Work",
    description: "Meetings, tasks, and colleagues.",
    place: { tr: "iş yeri", fa: "محل کار", en: "workplace", sr: "posao" },
    terms: {
      tr: ["toplantı", "görev", "meslektaş", "ofis", "proje", "takvim"],
      fa: ["جلسه", "وظیفه", "همکار", "دفتر", "پروژه", "تقویم"],
      en: ["meeting", "task", "colleague", "office", "project", "calendar"],
      sr: ["sastanak", "zadatak", "kolega", "kancelarija", "projekat", "kalendar"],
    },
  },
  {
    id: 12,
    title: "At the Bank",
    description: "Transactions, currency, and accounts.",
    place: { tr: "banka", fa: "بانک", en: "bank", sr: "banka" },
    terms: {
      tr: ["hesap", "kart", "para", "transfer", "döviz", "imza"],
      fa: ["حساب", "کارت", "پول", "انتقال", "ارز", "امضا"],
      en: ["account", "card", "money", "transfer", "currency", "signature"],
      sr: ["račun", "kartica", "novac", "prebacivanje", "valuta", "potpis"],
    },
  },
  {
    id: 13,
    title: "At the Post Office",
    description: "Sending packages and buying stamps.",
    place: { tr: "postane", fa: "اداره پست", en: "post office", sr: "poštanski ured" },
    terms: {
      tr: ["paket", "pul", "adres", "teslimat", "zarf", "kargo"],
      fa: ["بسته", "تمبر", "آدرس", "تحویل", "پاکت", "پست"],
      en: ["package", "stamp", "address", "delivery", "envelope", "mail"],
      sr: ["paket", "marka", "adresa", "dostava", "koverta", "pošta"],
    },
  },
  {
    id: 14,
    title: "At the Shopping Mall",
    description: "Sizes, prices, and returns.",
    place: { tr: "alışveriş merkezi", fa: "مرکز خرید", en: "shopping mall", sr: "tržnica" },
    terms: {
      tr: ["beden", "fiyat", "indirim", "ödeme", "fiş", "iade"],
      fa: ["سایز", "قیمت", "تخفیف", "پرداخت", "رسید", "مرجوعی"],
      en: ["size", "price", "discount", "payment", "receipt", "return"],
      sr: ["veličina", "cena", "popust", "plaćanje", "račun", "povratak"],
    },
  },
  {
    id: 15,
    title: "At a Friend's House",
    description: "Small talk and socializing.",
    place: { tr: "arkadaşın evi", fa: "خانه دوست", en: "friend's house", sr: "kuća prijatelja" },
    terms: {
      tr: ["misafir", "çay", "sohbet", "aile", "yemek", "teşekkürler"],
      fa: ["مهمان", "چای", "گفتگو", "خانواده", "غذا", "ممنون"],
      en: ["guest", "tea", "conversation", "family", "food", "thanks"],
      sr: ["gost", "čaj", "razgovor", "obitelj", "hrana", "hvala"],
    },
  },
];

export function getTopicMetaById(id: number): TopicMeta | undefined {
  return TOPIC_META.find((t) => t.id === id);
}

