function toggledGraphiteThemeId() {
  return panelState.backgroundTheme === GRAPHITE_BACKGROUND_THEME ? DEFAULT_SETTINGS.backgroundTheme : GRAPHITE_BACKGROUND_THEME;
}

function syncPanelTopbarPreferenceControls(root = document.getElementById("tuckio-panel-root")?.shadowRoot) {
  if (!root) {
    return;
  }

  root.querySelectorAll("[data-panel-view-toggle]").forEach((button) => {
    const label = panelState.compactView ? t("Switch to card view") : t("Switch to list view");
    button.setAttribute("aria-label", label);
    button.dataset.panelHint = panelViewToggleHint();
    button.innerHTML = renderPanelViewToggleIcon();
  });

  const themeButton = root.querySelector("[data-panel-theme-toggle]");
  if (themeButton) {
    const isGraphite = panelState.backgroundTheme === GRAPHITE_BACKGROUND_THEME;
    themeButton.classList.toggle("is-toggle-active", isGraphite);
    themeButton.setAttribute("aria-checked", String(isGraphite));
    themeButton.setAttribute("aria-label", isGraphite ? t("Dark mode on") : t("Dark mode off"));
    themeButton.setAttribute("title", t("Dark mode"));
    themeButton.innerHTML = renderPanelThemeToggleContents();
  }

  const hintsButton = root.querySelector("[data-panel-hover-hints-toggle]");
  if (hintsButton) {
    hintsButton.classList.toggle("is-toggle-active", panelState.hoverHints);
    hintsButton.setAttribute("aria-checked", String(panelState.hoverHints));
    hintsButton.setAttribute("aria-label", panelState.hoverHints ? t("Hover hints on") : t("Hover hints off"));
    hintsButton.innerHTML = renderPanelHoverHintsToggleContents();
  }

  if (!panelState.hoverHints && typeof hidePanelHint === "function") {
    hidePanelHint(root);
  }
}

function renderPanelThemeToggleContents() {
  const isGraphite = panelState.backgroundTheme === GRAPHITE_BACKGROUND_THEME;
  return `
    ${phosphorMoonIcon("wp-overflow-option-icon")}
    <span>${escapeHtml(t("Dark mode"))}</span>
    ${renderPanelOverflowSwitch(isGraphite)}
  `;
}

function renderPanelHoverHintsToggleContents() {
  return `
    ${phosphorInfoIcon("wp-overflow-option-icon")}
    <span>${escapeHtml(t("Hover hints"))}</span>
    ${renderPanelOverflowSwitch(panelState.hoverHints)}
  `;
}

function renderPanelOverflowSwitch(isActive) {
  const switchStyle = `${PANEL_OVERFLOW_SWITCH_INLINE_STYLE}${isActive ? PANEL_OVERFLOW_SWITCH_ON_INLINE_STYLE : ""}`;
  const knobStyle = `${PANEL_OVERFLOW_SWITCH_KNOB_INLINE_STYLE}${isActive ? PANEL_OVERFLOW_SWITCH_KNOB_ON_INLINE_STYLE : ""}`;
  return `<span class="wp-overflow-switch${isActive ? " is-on" : ""}" style="${escapeAttribute(switchStyle)}" aria-hidden="true"><span class="wp-overflow-switch-knob" style="${escapeAttribute(knobStyle)}"></span></span>`;
}

function bindPanelPreferenceEvents(root) {
  root.querySelector("[data-panel-theme-toggle]")?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    closePanelLanguageMenu(root);
    safelyRunPanelAction(async () => {
      await savePanelSettings(
        { backgroundTheme: toggledGraphiteThemeId() },
        { rerender: false, syncSummary: false }
      );
    });
  });

  root.querySelector("[data-panel-hover-hints-toggle]")?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    closePanelLanguageMenu(root);
    safelyRunPanelAction(async () => {
      await savePanelSettings(
        { hoverHints: !panelState.hoverHints },
        { rerender: false, syncSummary: false }
      );
    });
  });

  root.querySelector("[data-panel-language-trigger]")?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    togglePanelLanguageMenu(event.currentTarget);
  });

  root.querySelector("[data-panel-language-menu]")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-panel-language]");
    if (!button) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    const language = cleanText(button.dataset.panelLanguage).toLowerCase();
    if (!isPanelLanguage(language) || language === panelState.language) {
      closePanelLanguageMenu(root);
      return;
    }
    panelState.settingsOpen = false;
    safelyRunPanelAction(() => savePanelSettings({ language }));
  });
}

function togglePanelLanguageMenu(trigger) {
  const languageRoot = trigger.closest("[data-panel-language-root]");
  const menu = languageRoot?.querySelector("[data-panel-language-menu]");
  if (!languageRoot || !menu) {
    return;
  }

  const willOpen = menu.hidden;
  closePanelLanguageMenu(languageRoot.getRootNode());
  menu.hidden = !willOpen;
  languageRoot.classList.toggle("is-open", willOpen);
  trigger.setAttribute("aria-expanded", String(willOpen));
}

function closePanelLanguageMenu(scope = document.getElementById("tuckio-panel-root")?.shadowRoot) {
  scope?.querySelectorAll?.("[data-panel-language-root]").forEach((languageRoot) => {
    languageRoot.classList.remove("is-open");
    languageRoot.querySelector("[data-panel-language-menu]")?.setAttribute("hidden", "");
    languageRoot.querySelector("[data-panel-language-trigger]")?.setAttribute("aria-expanded", "false");
  });
}
