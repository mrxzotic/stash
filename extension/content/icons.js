// Phosphor Light icons are vendored in extension/assets/phosphor-light.
// Do not add custom/self-authored SVG paths here.
var PHOSPHOR_LIGHT_ICON_FILES = {
  search: "magnifying-glass",
  settings: "gear-six",
  dotsThreeVertical: "dots-three-vertical",
  list: "list-bullets",
  grid: "grid-four",
  moon: "moon",
  sun: "sun",
  chevronDown: "caret-down",
  chevronLeft: "caret-left",
  chevronRight: "caret-right",
  check: "check",
  x: "x",
  plus: "plus",
  archive: "archive",
  info: "info",
  pause: "pause",
  play: "play",
  link: "link",
  pencil: "pencil-simple",
  trash: "trash",
  undo: "arrow-u-up-left",
  arrowDown: "arrow-down",
  arrowUp: "arrow-up",
  download: "download-simple",
  upload: "upload-simple",
  at: "at",
  send: "paper-plane-tilt",
  mail: "envelope-simple",
  code: "code",
  globe: "globe",
  percent: "percent",
  image: "image-square",
  imageOff: "image-broken",
  tag: "tag",
  star: "star",
  searchMinus: "magnifying-glass-minus",
  shoppingBag: "shopping-bag",
  xLogo: "x-logo",
  githubLogo: "github-logo"
};

function phosphorIconAttribute(value) {
  return String(value || "").replace(/[&<>"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;"
  })[character]);
}

function phosphorIconAssetUrl(fileName) {
  const path = `assets/phosphor-light/${fileName}.svg`;

  try {
    return chrome.runtime.getURL(path);
  } catch (error) {
    if (/extension context invalidated/i.test(String(error?.message || error))) {
      return "";
    }
    return path;
  }
}

function phosphorIcon(iconName, className = "wp-phosphor") {
  const fileName = PHOSPHOR_LIGHT_ICON_FILES[iconName];
  const iconUrl = fileName ? phosphorIconAssetUrl(fileName) : "";

  if (!iconUrl) {
    return "";
  }

  const classes = Array.from(new Set(["wp-phosphor", ...String(className || "").split(/\s+/).filter(Boolean)]))
    .join(" ")
    .trim();
  const style = `--wp-icon-url: url("${iconUrl.replace(/["\\]/g, "")}");`;

  return `<span class="${phosphorIconAttribute(classes)}" style="${phosphorIconAttribute(style)}" aria-hidden="true"></span>`;
}

function phosphorSearchIcon(className = "wp-phosphor") {
  return phosphorIcon("search", className);
}

function phosphorSettingsIcon(className = "wp-phosphor") {
  return phosphorIcon("settings", className);
}

function phosphorDotsThreeVerticalIcon(className = "wp-phosphor") {
  return phosphorIcon("dotsThreeVertical", className);
}

function phosphorListIcon(className = "wp-phosphor") {
  return phosphorIcon("list", className);
}

function phosphorGridIcon(className = "wp-phosphor") {
  return phosphorIcon("grid", className);
}

function phosphorMoonIcon(className = "wp-phosphor") {
  return phosphorIcon("moon", className);
}

function phosphorSunIcon(className = "wp-phosphor") {
  return phosphorIcon("sun", className);
}

function phosphorChevronDownIcon(className = "wp-phosphor") {
  return phosphorIcon("chevronDown", className);
}

function phosphorChevronLeftIcon(className = "wp-phosphor") {
  return phosphorIcon("chevronLeft", className);
}

function phosphorChevronRightIcon(className = "wp-phosphor") {
  return phosphorIcon("chevronRight", className);
}

function phosphorCheckIcon(className = "wp-phosphor") {
  return phosphorIcon("check", className);
}

function phosphorXIcon(className = "wp-phosphor") {
  return phosphorIcon("x", className);
}

function phosphorPlusIcon(className = "wp-phosphor") {
  return phosphorIcon("plus", className);
}

function phosphorArchiveIcon(className = "wp-phosphor") {
  return phosphorIcon("archive", className);
}

function phosphorInfoIcon(className = "wp-phosphor") {
  return phosphorIcon("info", className);
}

function phosphorPauseIcon(className = "wp-phosphor") {
  return phosphorIcon("pause", className);
}

function phosphorPlayIcon(className = "wp-phosphor") {
  return phosphorIcon("play", className);
}

function phosphorLinkIcon(className = "wp-phosphor") {
  return phosphorIcon("link", className);
}

function phosphorPencilIcon(className = "wp-phosphor") {
  return phosphorIcon("pencil", className);
}

function phosphorTrashIcon(className = "wp-phosphor") {
  return phosphorIcon("trash", className);
}

function phosphorUndoIcon(className = "wp-phosphor") {
  return phosphorIcon("undo", className);
}

function phosphorArrowDownIcon(className = "wp-phosphor") {
  return phosphorIcon("arrowDown", className);
}

function phosphorArrowUpIcon(className = "wp-phosphor") {
  return phosphorIcon("arrowUp", className);
}

function phosphorDownloadIcon(className = "wp-phosphor") {
  return phosphorIcon("download", className);
}

function phosphorUploadIcon(className = "wp-phosphor") {
  return phosphorIcon("upload", className);
}

function phosphorAtSignIcon(className = "wp-phosphor") {
  return phosphorIcon("at", className);
}

function phosphorSendIcon(className = "wp-phosphor") {
  return phosphorIcon("send", className);
}

function phosphorMailIcon(className = "wp-phosphor") {
  return phosphorIcon("mail", className);
}

function phosphorCodeIcon(className = "wp-phosphor") {
  return phosphorIcon("code", className);
}

function phosphorGlobeIcon(className = "wp-phosphor") {
  return phosphorIcon("globe", className);
}

function phosphorPercentIcon(className = "wp-phosphor") {
  return phosphorIcon("percent", className);
}

function phosphorImageIcon(className = "wp-phosphor") {
  return phosphorIcon("image", className);
}

function phosphorImageOffIcon(className = "wp-phosphor") {
  return phosphorIcon("imageOff", className);
}

function phosphorTagIcon(className = "wp-phosphor") {
  return phosphorIcon("tag", className);
}

function phosphorStarIcon(className = "wp-phosphor") {
  return phosphorIcon("star", className);
}

function phosphorSearchMinusIcon(className = "wp-phosphor") {
  return phosphorIcon("searchMinus", className);
}

function phosphorShoppingBagIcon(className = "wp-phosphor") {
  return phosphorIcon("shoppingBag", className);
}

function phosphorXLogoIcon(className = "wp-phosphor") {
  return phosphorIcon("xLogo", className);
}

function phosphorGithubLogoIcon(className = "wp-phosphor") {
  return phosphorIcon("githubLogo", className);
}
