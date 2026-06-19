var SETTINGS_PROMO_ENABLED = true;
var SETTINGS_PROMO_URL = "https://x.com/imalexkornev";
var SETTINGS_PROMO_IMAGE = "assets/alex-kornev.png";

function renderSettingsPromo() {
  if (!SETTINGS_PROMO_ENABLED) {
    return "";
  }

  return `
    <a class="wp-settings-promo" href="${escapeAttribute(SETTINGS_PROMO_URL)}" target="_blank" rel="noreferrer" aria-label="Follow Alex Kornev on X">
      <img src="${escapeAttribute(settingsPromoImageUrl())}" alt="">
      <span>Follow</span>
    </a>
  `;
}

function settingsPromoImageUrl() {
  try {
    return chrome.runtime.getURL(SETTINGS_PROMO_IMAGE);
  } catch {
    return "";
  }
}
