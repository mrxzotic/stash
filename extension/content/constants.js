var CONTENT_VERSION = "2026-06-19-loewe-cta-price-glass-parser-v1";


var STORAGE_KEY = "stash.items.v1";
var RATE_STORAGE_KEY = "stash.rubRates.v1";
var CATEGORY_STORAGE_KEY = "stash.categories.v1";
var CATEGORY_SCHEMA_STORAGE_KEY = "stash.categories.schema.v1";
var CATEGORY_SCHEMA_VERSION = 2;
var SETTINGS_STORAGE_KEY = "stash.settings.v1";
var ALLOWED_STORAGE_KEYS = new Set([
  STORAGE_KEY,
  RATE_STORAGE_KEY,
  CATEGORY_STORAGE_KEY,
  CATEGORY_SCHEMA_STORAGE_KEY,
  SETTINGS_STORAGE_KEY
]);
var STORAGE_MAX_DEPTH = 8;
var STORAGE_MAX_ARRAY_LENGTH = 500;
var STORAGE_MAX_OBJECT_KEYS = 80;
var STORAGE_MAX_STRING_LENGTH = 8192;
var DEFAULT_SETTINGS = {
  summaryCurrency: "USD",
  backgroundTheme: "warm"
};
var DEFAULT_CATEGORIES = [
  { id: "tops", label: "Tops" },
  { id: "bottoms", label: "Bottoms" },
  { id: "outerwear", label: "Outerwear" },
  { id: "shoes", label: "Shoes" },
  { id: "bags", label: "Bags" },
  { id: "accessories", label: "Accessories" }
];
var DEFAULT_RUB_RATES = {
  RUB: 1,
  USD: 89,
  EUR: 96,
  UAH: 2.2,
  GBP: 113,
  JPY: 0.62,
  AUD: 59,
  CAD: 65,
  CHF: 102,
  CNY: 12.2,
  KRW: 0.065,
  AED: 24.2,
  SAR: 23.7,
  QAR: 24.5,
  KWD: 291,
  BHD: 236,
  OMR: 231,
  TRY: 2.75,
  KZT: 0.17,
  GEL: 32.8,
  AMD: 0.23,
  PLN: 24,
  SEK: 9.4,
  NOK: 8.8,
  DKK: 12.9,
  HKD: 11.4,
  SGD: 68
};
var CURRENCY_SYMBOLS = {
  RUB: "₽",
  USD: "$",
  EUR: "€",
  UAH: "₴",
  GBP: "£",
  JPY: "¥",
  AUD: "A$",
  CAD: "C$",
  CHF: "CHF",
  CNY: "CN¥",
  KRW: "KRW",
  AED: "AED",
  SAR: "SAR",
  QAR: "QAR",
  KWD: "KWD",
  BHD: "BHD",
  OMR: "OMR",
  TRY: "TRY",
  KZT: "KZT",
  GEL: "GEL",
  AMD: "AMD",
  PLN: "PLN",
  SEK: "SEK",
  NOK: "NOK",
  DKK: "DKK",
  HKD: "HKD",
  SGD: "S$"
};
var LEADING_SYMBOL_CURRENCIES = new Set([
  "USD",
  "GBP",
  "JPY",
  "AUD",
  "CAD",
  "CNY",
  "HKD",
  "SGD"
]);
var CURRENCY_CODE_PATTERN =
  "USD|EUR|GBP|JPY|AUD|CAD|CHF|CNY|KRW|RUB|UAH|AED|SAR|QAR|KWD|BHD|OMR|TRY|KZT|GEL|AMD|PLN|SEK|NOK|DKK|HKD|SGD";
var SUMMARY_CURRENCY_PICKER_OPTIONS = ["USD", "EUR", "GBP", "CHF", "RUB", "UAH"];
var RATE_MAX_AGE_MS = 24 * 60 * 60 * 1000;
var BRAND_ALIASES = new Map([
  ["aime leon dore eu", "Aimé Leon Dore"],
  ["aime leon dore", "Aimé Leon Dore"],
  ["aimé leon dore eu", "Aimé Leon Dore"],
  ["aimé leon dore", "Aimé Leon Dore"],
  ["tomfordfashion", "Tom Ford"],
  ["tom ford fashion", "Tom Ford"],
  ["tomford", "Tom Ford"],
  ["loewe", "Loewe"],
  ["rimowa", "RIMOWA"],
  ["on", "On"],
  ["suitsupply", "Suitsupply"],
  ["about blank", "about:blank"],
  ["about:blank", "about:blank"],
  ["marcelo miracles", "Marcelo Miracles"]
]);

var lastContextTarget = null;
var lastContextPoint = { x: Math.round(window.innerWidth * 0.72), y: 180 };
var panelState = {
  open: false,
  searchOpen: false,
  settingsOpen: false,
  activeCategory: "all",
  searchQuery: "",
  items: [],
  categories: DEFAULT_CATEGORIES,
  summaryCurrency: DEFAULT_SETTINGS.summaryCurrency,
  summaryRate: {
    currency: DEFAULT_SETTINGS.summaryCurrency,
    value: DEFAULT_RUB_RATES[DEFAULT_SETTINGS.summaryCurrency],
    source: "fallback",
    updatedAt: 0
  },
  summaryRateLoading: "",
  backgroundTheme: DEFAULT_SETTINGS.backgroundTheme,
  hasRenderedPanel: false,
  highlightedItemId: "",
  highlightTimer: 0
};
