var CONTENT_VERSION = "2026-06-24-list-archive-sync-v51";


var STORAGE_KEY = "tuckio.items.v1";
var RATE_STORAGE_KEY = "tuckio.rubRates.v1";
var CATEGORY_STORAGE_KEY = "tuckio.categories.v1";
var CATEGORY_SCHEMA_STORAGE_KEY = "tuckio.categories.schema.v1";
var CATEGORY_SCHEMA_VERSION = 2;
var SETTINGS_STORAGE_KEY = "tuckio.settings.v1";
var LEGACY_STORAGE_KEYS = new Map([
  [STORAGE_KEY, "stash.items.v1"],
  [RATE_STORAGE_KEY, "stash.rubRates.v1"],
  [CATEGORY_STORAGE_KEY, "stash.categories.v1"],
  [CATEGORY_SCHEMA_STORAGE_KEY, "stash.categories.schema.v1"],
  [SETTINGS_STORAGE_KEY, "stash.settings.v1"]
]);
var BACKUP_SCHEMA = "tuckio.backup.v1";
var LEGACY_BACKUP_SCHEMA = "stash.backup.v1";
var ALLOWED_STORAGE_KEYS = new Set([
  STORAGE_KEY,
  RATE_STORAGE_KEY,
  CATEGORY_STORAGE_KEY,
  CATEGORY_SCHEMA_STORAGE_KEY,
  SETTINGS_STORAGE_KEY,
  ...LEGACY_STORAGE_KEYS.values()
]);
var STORAGE_MAX_DEPTH = 8;
var STORAGE_MAX_ARRAY_LENGTH = 500;
var STORAGE_MAX_OBJECT_KEYS = 80;
var STORAGE_MAX_STRING_LENGTH = 8192;
var SAVED_IMAGE_URL_LIMIT = 3;
var DEFAULT_SETTINGS = {
  summaryCurrency: "USD",
  backgroundTheme: "warm",
  compactView: false,
  language: "en"
};
var PANEL_LANGUAGE_EN = "en";
var PANEL_LANGUAGE_ES = "es";
var PANEL_LANGUAGE_DE = "de";
var PANEL_LANGUAGE_FR = "fr";
var PANEL_LANGUAGE_RU = "ru";
var PANEL_LANGUAGE_OPTIONS = [
  { id: PANEL_LANGUAGE_EN, label: "English", flag: "🇺🇸" },
  { id: PANEL_LANGUAGE_ES, label: "Spanish", flag: "🇪🇸" },
  { id: PANEL_LANGUAGE_DE, label: "German", flag: "🇩🇪" },
  { id: PANEL_LANGUAGE_FR, label: "French", flag: "🇫🇷" },
  { id: PANEL_LANGUAGE_RU, label: "Russian", flag: "🇷🇺" }
];
var PANEL_OVERFLOW_ROOT_INLINE_STYLE = "position:relative;display:inline-flex;flex:0 0 auto;";
var PANEL_OVERFLOW_MENU_INLINE_STYLE = "position:absolute;top:calc(100% + 8px);right:0;z-index:14;width:344px;max-width:calc(100vw - 32px);gap:6px;padding:8px;border:1px solid var(--wp-popover-border);border-radius:var(--radius);background:var(--wp-popover-bg);-webkit-backdrop-filter:var(--wp-popover-blur);backdrop-filter:var(--wp-popover-blur);box-shadow:var(--wp-popover-shadow);transform-origin:100% 0;box-sizing:border-box;";
var PANEL_OVERFLOW_GRAPHITE_MENU_INLINE_STYLE = "--wp-overflow-option-color:rgba(244,244,240,0.72);--wp-overflow-option-hover-color:rgba(255,255,250,0.96);--wp-overflow-divider-bg:rgba(255,255,255,0.1);--wp-overflow-switch-bg:rgba(255,255,255,0.14);--wp-overflow-switch-border:rgba(255,255,255,0.1);--wp-overflow-switch-on-bg:rgba(244,244,240,0.9);--wp-overflow-switch-on-border:rgba(255,255,255,0.42);--wp-overflow-switch-knob-bg:rgba(255,255,255,0.96);--wp-overflow-switch-knob-shadow:rgba(0,0,0,0.34);--wp-overflow-switch-knob-on-bg:rgba(8,11,16,0.92);--wp-overflow-select-bg:rgba(255,255,255,0.1);--wp-overflow-select-border:rgba(255,255,255,0.16);--wp-overflow-select-color:rgba(255,255,250,0.92);";
var PANEL_OVERFLOW_OPTION_INLINE_STYLE = "width:100%;height:40px;display:grid;grid-template-columns:20px minmax(0,1fr) 36px;align-items:center;gap:10px;padding:0 10px;border:0;border-radius:9px;background:transparent;color:var(--wp-overflow-option-color,rgba(8,11,16,0.72));font-family:var(--ui-font);font-size:13px;font-weight:720;line-height:1;text-align:left;white-space:nowrap;box-shadow:none;-webkit-appearance:none;appearance:none;box-sizing:border-box;";
var PANEL_OVERFLOW_LANGUAGE_INLINE_STYLE = "position:relative;width:100%;height:40px;display:grid;grid-template-columns:20px minmax(0,1fr) 148px;align-items:center;gap:18px;padding:0 10px;border-radius:9px;color:var(--wp-overflow-option-color,rgba(8,11,16,0.72));font-family:var(--ui-font);font-size:13px;font-weight:720;line-height:1;white-space:nowrap;box-sizing:border-box;";
var PANEL_OVERFLOW_LANGUAGE_TRIGGER_INLINE_STYLE = "width:148px;height:32px;display:grid;grid-template-columns:minmax(0,1fr) 20px 14px;align-items:center;gap:7px;padding:0 8px;border:1px solid var(--wp-overflow-select-border,rgba(8,11,16,0.12));border-radius:9px;background:var(--wp-overflow-select-bg,rgba(255,255,255,0.68));color:var(--wp-overflow-select-color,currentColor);font:inherit;font-size:12px;font-weight:720;text-align:left;box-sizing:border-box;";
var PANEL_OVERFLOW_LANGUAGE_MENU_INLINE_STYLE = "position:absolute;top:calc(100% + 8px);right:10px;z-index:16;width:232px;gap:6px;padding:8px;border:1px solid var(--wp-popover-border);border-radius:var(--radius);background:var(--wp-popover-bg);-webkit-backdrop-filter:var(--wp-popover-blur);backdrop-filter:var(--wp-popover-blur);box-shadow:var(--wp-popover-shadow);transform-origin:100% 0;box-sizing:border-box;";
var PANEL_OVERFLOW_LANGUAGE_OPTION_INLINE_STYLE = "width:100%;height:40px;display:grid;grid-template-columns:20px minmax(0,1fr) 24px;align-items:center;gap:10px;padding:0 10px;border:0;border-radius:9px;background:transparent;color:var(--foreground);font:inherit;font-size:13px;font-weight:700;text-align:left;white-space:nowrap;box-sizing:border-box;";
var PANEL_OVERFLOW_DIVIDER_INLINE_STYLE = "height:1px;margin:3px 4px;background:var(--wp-overflow-divider-bg,rgba(8,11,16,0.1));";
var PANEL_OVERFLOW_SWITCH_INLINE_STYLE = "position:relative;width:30px;height:18px;justify-self:end;border-radius:999px;background:var(--wp-overflow-switch-bg,rgba(8,11,16,0.14));box-shadow:inset 0 0 0 1px var(--wp-overflow-switch-border,rgba(8,11,16,0.08));overflow:visible;box-sizing:border-box;";
var PANEL_OVERFLOW_SWITCH_ON_INLINE_STYLE = "background:var(--wp-overflow-switch-on-bg,rgba(8,11,16,0.84));box-shadow:inset 0 0 0 1px var(--wp-overflow-switch-on-border,rgba(8,11,16,0.16));";
var PANEL_OVERFLOW_SWITCH_KNOB_INLINE_STYLE = "position:absolute;top:3px;left:3px;width:12px;height:12px;border-radius:999px;background:var(--wp-overflow-switch-knob-bg,rgba(255,255,255,0.96));box-shadow:0 1px 3px var(--wp-overflow-switch-knob-shadow,rgba(8,11,16,0.24));";
var PANEL_OVERFLOW_SWITCH_KNOB_ON_INLINE_STYLE = "transform:translateX(12px);background:var(--wp-overflow-switch-knob-on-bg,var(--wp-overflow-switch-knob-bg,rgba(255,255,255,0.96)));";
var GRAPHITE_BACKGROUND_THEME = "graphite";
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
var PANEL_SORT_FIELD_RECENT = "recent";
var PANEL_SORT_FIELD_NAME = "name";
var PANEL_SORT_FIELD_PRICE = "price";
var PANEL_SORT_ASC = "asc";
var PANEL_SORT_DESC = "desc";
var BRAND_ALIASES = new Map([
  ["acnestudios", "Acne Studios"],
  ["acne studios", "Acne Studios"],
  ["aime leon dore eu", "Aimé Leon Dore"],
  ["aime leon dore", "Aimé Leon Dore"],
  ["aimé leon dore eu", "Aimé Leon Dore"],
  ["aimé leon dore", "Aimé Leon Dore"],
  ["allsaints", "AllSaints"],
  ["all saints", "AllSaints"],
  ["tomfordfashion", "Tom Ford"],
  ["tom ford fashion", "Tom Ford"],
  ["tomford", "Tom Ford"],
  ["d1milano", "D1 Milano"],
  ["d1 milano", "D1 Milano"],
  ["loewe", "Loewe"],
  ["p448", "P448"],
  ["rimowa", "RIMOWA"],
  ["limestore", "LIME"],
  ["lime", "LIME"],
  ["on", "On"],
  ["pyeoptics", "PYE"],
  ["pye optics", "PYE"],
  ["sorelle", "Sorelle Era"],
  ["sorelleera", "Sorelle Era"],
  ["suitsupply", "Suitsupply"],
  ["about blank", "about:blank"],
  ["about:blank", "about:blank"],
  ["marcelo miracles", "Marcelo Miracles"],
  ["p p s", "P.P.S."],
  ["postpostscriptum", "P.P.S."],
  ["post post scriptum", "P.P.S."],
  ["sorelleera", "Sorelle Era"],
  ["sorelle era", "Sorelle Era"]
]);

var lastContextTarget = null;
var lastContextPoint = { x: Math.round(window.innerWidth * 0.72), y: 180 };
var panelState = {
  open: false,
  searchOpen: false,
  settingsOpen: false,
  categoryComposerOpen: false,
  deleteCategoryId: "",
  deleteItemId: "",
  editItemId: "",
  decisionItemId: "",
  decisionDragItemId: "",
  shortlistOpen: false,
  archivedOpen: false,
  brandCloudOpen: false,
  brandCloudSortList: false,
  filterMenuOpen: false,
  sortMenuOpen: false,
  brandFilterKey: "",
  brandFilterLabel: "",
  activeCategory: "all",
  searchQuery: "",
  sortField: PANEL_SORT_FIELD_RECENT,
  sortDirection: PANEL_SORT_DESC,
  founderPromoOpen: false,
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
  compactView: DEFAULT_SETTINGS.compactView,
  language: DEFAULT_SETTINGS.language,
  hasRenderedPanel: false,
  rebuildMotion: "",
  rebuildMotionTimer: 0,
  highlightedItemId: "",
  displacedItemId: "",
  highlightTimer: 0
};

function t(key, replacements = {}) {
  return interpolatePanelText(key, replacements);
}

function interpolatePanelText(template, replacements = {}) {
  return String(template || "").replace(/\{([A-Za-z0-9_]+)\}/g, (match, key) =>
    Object.prototype.hasOwnProperty.call(replacements, key) ? String(replacements[key]) : match
  );
}

function panelItemNoun(count) {
  return Number(count) === 1 ? "item" : "items";
}

function panelBrandNoun(count) {
  return Number(count) === 1 ? "brand" : "brands";
}

function panelCategoryDisplayLabel(category) {
  return cleanCategoryLabel(category?.label || category?.id) || t("Saved");
}

function renderPanelLanguageSelect() {
  return "";
}
