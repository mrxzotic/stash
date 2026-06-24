const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const extensionDir = path.join(root, "extension");
const backgroundSource = fs.readFileSync(path.join(extensionDir, "background.js"), "utf8");
const contentVersion = backgroundSource.match(/CONTENT_SCRIPT_VERSION = "([^"]+)"/)?.[1];
const contentScriptFiles = Array.from(
  backgroundSource.match(/const CONTENT_SCRIPT_FILES = \[([\s\S]*?)\];/)?.[1].matchAll(/"([^"]+)"/g) || [],
  (entry) => entry[1]
);
const storageKey = "tuckio.items.v1";
const chromePath = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

assert.ok(contentVersion, "CONTENT_SCRIPT_VERSION should be readable");
assert.ok(contentScriptFiles.length, "CONTENT_SCRIPT_FILES should be readable");

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function main() {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "tuckio-panel-decisions-"));
  const qaExtensionDir = path.join(tempRoot, "extension");
  const screenshotPath = path.join(root, "output/playwright/panel-decisions-e2e.png");
  fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });
  fs.cpSync(extensionDir, qaExtensionDir, { recursive: true });
  addTemporaryHostPermissions(qaExtensionDir);

  const context = await chromium.launchPersistentContext(path.join(tempRoot, "profile"), {
    headless: false,
    executablePath: chromePath,
    viewport: { width: 1280, height: 920 },
    args: [
      `--disable-extensions-except=${qaExtensionDir}`,
      `--load-extension=${qaExtensionDir}`,
      "--disable-quic",
      "--no-first-run",
      "--no-default-browser-check"
    ]
  });

  try {
    const worker = await extensionWorker(context);
    await worker.evaluate(() => chrome.storage.local.clear());
    await worker.evaluate(async ({ key, items }) => chrome.storage.local.set({ [key]: items }), {
      key: storageKey,
      items: seededItems()
    });

    const page = await context.newPage();
    await page.goto("https://example.com", { waitUntil: "domcontentloaded", timeout: 30000 });
    await openPanel(worker);
    await page.waitForFunction(() => document.getElementById("tuckio-panel-root")?.shadowRoot?.querySelector(".wp-shell"));

    const metrics = await page.evaluate(async () => {
      const root = document.getElementById("tuckio-panel-root").shadowRoot;
      const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      const rectCenterX = (rect) => rect.left + (rect.width / 2);
      const groupedRect = (nodes) => {
        const rects = Array.from(nodes, (node) => node.getBoundingClientRect()).filter((rect) => rect.width || rect.height);
        return {
          left: Math.min(...rects.map((rect) => rect.left)),
          right: Math.max(...rects.map((rect) => rect.right))
        };
      };
      const targetId = "active-54";
      const stableTopbar = root.querySelector(".wp-topbar");
      const stableItems = root.querySelector(".wp-items");
      let items = root.querySelector(".wp-items");
      let filterTrigger = root.querySelector("[data-filter-menu-trigger]");
      let filterLabel = filterTrigger.querySelector(".wp-filter-trigger-label");
      let filterTriggerWidth = filterTrigger.getBoundingClientRect().width;
      const allFilterExists = Boolean(root.querySelector(".wp-filter-all"));
      const resetExists = Boolean(root.querySelector(".wp-filter-reset, [data-panel-filter-reset]"));
      const topbarShortlistExists = Boolean(root.querySelector(".wp-actions [data-shortlist-toggle], .wp-shortlist-topbar"));
      const defaultBrandLeft = root.querySelector(".wp-brand-chip").getBoundingClientRect().left;
      const topbarCount = root.querySelector(".wp-count");
      const topbarCountRect = topbarCount.getBoundingClientRect();
      const topbarCountTextRect = groupedRect(topbarCount.querySelectorAll(".wp-count-figure, .wp-count-label"));
      const topbarCountTextCenterDelta = Math.abs(((topbarCountTextRect.left + topbarCountTextRect.right) / 2) - rectCenterX(topbarCountRect));
      const totalButton = root.querySelector(".wp-total");
      const totalValue = root.querySelector(".wp-total-value");
      const totalRect = totalButton.getBoundingClientRect();
      const totalValueRect = totalValue.getBoundingClientRect();
      const totalValueCenterDelta = Math.abs(rectCenterX(totalValueRect) - rectCenterX(totalRect));
      const topbarCountStyles = getComputedStyle(root.querySelector(".wp-count"));
      const totalChevronStyles = getComputedStyle(root.querySelector(".wp-total-chevron"));
      const totalChevronWidth = root.querySelector(".wp-total-chevron").getBoundingClientRect().width;
      const totalChevronMaxWidth = totalChevronStyles.maxWidth;
      const archiveChipStyles = getComputedStyle(root.querySelector(".wp-filter-archive"));
      const topbarCountColor = topbarCountStyles.color;
      const totalChevronOpacity = Number(totalChevronStyles.opacity);
      const archiveChipBackgroundColor = archiveChipStyles.backgroundColor;
      const archiveChipColor = archiveChipStyles.color;
      const cardTopGap = root.querySelector(".wp-image-frame").getBoundingClientRect().top -
        root.querySelector(".wp-filters").getBoundingClientRect().bottom;

      const immediateDecisionId = "active-2";
      root.querySelector(`[data-decision-menu-id="${immediateDecisionId}"]`).click();
      await sleep(160);
      root.querySelector('[data-decision-drop-action="bought"]').click();
      await sleep(260);
      const immediateBoughtCard = root.querySelector(`[data-panel-item-id="${immediateDecisionId}"]`);
      const immediateBoughtStatus = immediateBoughtCard?.querySelector(".wp-decision-status");
      const immediateBoughtStatusText = immediateBoughtStatus?.textContent.trim() || "";
      const immediateBoughtStatusClass = immediateBoughtStatus?.className || "";
      root.querySelector("[data-archive-view-toggle]").click();
      await sleep(260);
      const immediateReturnedActive = !root.querySelector(".wp-items").classList.contains("is-archive-view");

      root.querySelector("[data-panel-overflow-trigger]").click();
      await sleep(80);
      const overflowMenu = root.querySelector("[data-panel-overflow-menu]");
      const overflowMenuWidth = Math.round(overflowMenu.getBoundingClientRect().width);
      const languageTrigger = root.querySelector("[data-panel-language-trigger]");
      const languageLabelRect = root.querySelector("#wp-language-label").getBoundingClientRect();
      const languageTriggerRect = languageTrigger.getBoundingClientRect();
      const languageTriggerGap = Math.round(languageTriggerRect.left - languageLabelRect.right);
      const languageCurrentRect = languageTrigger.querySelector(".wp-language-current").getBoundingClientRect();
      const languageTriggerFlagRect = languageTrigger.querySelector(".wp-language-flag").getBoundingClientRect();
      const languageTriggerFlagAfterLabel = languageTriggerFlagRect.left >= languageCurrentRect.right - 1;
      languageTrigger.click();
      await sleep(120);
      const languageMenu = root.querySelector("[data-panel-language-menu]");
      const languageMenuWidth = Math.round(languageMenu.getBoundingClientRect().width);
      const languageOption = root.querySelector('[data-panel-language="en"]');
      const languageOptionLabelRect = languageOption.querySelector(".wp-language-label").getBoundingClientRect();
      const languageOptionFlagRect = languageOption.querySelector(".wp-language-flag").getBoundingClientRect();
      const languageOptionFlagAfterLabel = languageOptionFlagRect.left >= languageOptionLabelRect.right - 1;
      languageTrigger.click();
      await sleep(80);
      root.querySelector("[data-panel-overflow-menu] [data-founder-promo-trigger]").click();
      await sleep(160);
      const aboutDialogVisible = Boolean(root.querySelector("[data-founder-promo-dialog]"));
      const overflowHiddenAfterAboutOpen = root.querySelector("[data-panel-overflow-menu]").hidden;
      const overflowExpandedAfterAboutOpen = root.querySelector("[data-panel-overflow-trigger]").getAttribute("aria-expanded");
      root.querySelector("[data-founder-promo-close]").click();
      await sleep(120);
      const aboutDialogClosed = !root.querySelector("[data-founder-promo-dialog]");
      const overflowHiddenAfterAboutClose = root.querySelector("[data-panel-overflow-menu]").hidden;
      const overflowExpandedAfterAboutClose = root.querySelector("[data-panel-overflow-trigger]").getAttribute("aria-expanded");
      root.querySelector("[data-panel-overflow-trigger]").click();
      await sleep(80);
      root.querySelector("[data-panel-theme-toggle]").click();
      await sleep(120);
      const themeShell = root.querySelector(".wp-shell");
      const themeMotionClass = themeShell.classList.contains("is-theme-rebuild");
      const themeGraphiteClass = themeShell.classList.contains("wp-theme-graphite");
      const themeTopbarStable = root.querySelector(".wp-topbar") === stableTopbar;
      const themeItemsStable = root.querySelector(".wp-items") === stableItems;
      root.querySelector("[data-panel-theme-toggle]").click();
      await sleep(660);
      const themeRestoredLight = !themeShell.classList.contains("wp-theme-graphite");
      const themeTopbarStableAfterRestore = root.querySelector(".wp-topbar") === stableTopbar;
      const themeItemsStableAfterRestore = root.querySelector(".wp-items") === stableItems;

      root.querySelector("[data-panel-compact-toggle]").click();
      await sleep(160);
      const compactItems = root.querySelector(".wp-items");
      const compactList = root.querySelector(".wp-compact-list");
      const compactRow = root.querySelector(".wp-compact-item");
      const compactThumb = root.querySelector(".wp-compact-thumb");
      const compactActions = root.querySelector(".wp-compact-actions");
      const compactPrice = root.querySelector(".wp-compact-price");
      const compactArchiveButton = root.querySelector(".wp-compact-actions [data-decision-menu-id]");
      const compactTitle = root.querySelector(".wp-compact-copy .wp-item-title");
      const compactState = root.querySelector(".wp-compact-state");
      const compactIndex = root.querySelector(".wp-compact-index");
      const compactRowStyles = getComputedStyle(compactRow);
      const compactActionsStyles = getComputedStyle(compactActions);
      const compactArchiveButtonStyles = getComputedStyle(compactArchiveButton);
      const compactTitleStyles = getComputedStyle(compactTitle);
      const compactItemsRect = compactItems.getBoundingClientRect();
      const compactListRect = compactList.getBoundingClientRect();
      const compactRowRect = compactRow.getBoundingClientRect();
      const compactThumbRect = compactThumb.getBoundingClientRect();
      const compactActionsRect = compactActions.getBoundingClientRect();
      const compactPriceRect = compactPrice.getBoundingClientRect();
      const compactTitleRect = compactTitle.getBoundingClientRect();
      const compactStateRect = compactState.getBoundingClientRect();
      const compactIndexRect = compactIndex?.getBoundingClientRect();
      const compactModeClass = compactItems.classList.contains("is-compact");
      const compactSwitchClass = compactItems.classList.contains("is-view-mode-switching");
      const compactTopbarStable = root.querySelector(".wp-topbar") === stableTopbar;
      const compactIndexExists = Boolean(compactIndex);
      const compactIndexText = compactIndex?.textContent.trim() || "";
      const compactIndexBeforeThumb = compactIndexRect
        ? compactIndexRect.right <= compactThumbRect.left + 1
        : false;
      const compactGridTemplateColumns = compactRowStyles.gridTemplateColumns;
      const compactGridColumns = compactGridTemplateColumns.split(/\s+/).map((value) => Number.parseFloat(value));
      const compactActionsPosition = compactActionsStyles.position;
      const compactActionsOpacity = Number(compactActionsStyles.opacity);
      const compactInactiveActionOpacity = Number(compactArchiveButtonStyles.opacity);
      const compactActionsBeforePrice = compactActionsRect.right <= compactPriceRect.left + 1;
      const compactActionsBelowTitle = compactActionsRect.top >= compactTitleRect.bottom - 1;
      const compactCopyWidth = Math.round(compactTitleRect.width);
      const compactStateBeforePrice = compactStateRect.width === 0 || compactStateRect.right <= compactPriceRect.left + 1;
      const compactTitleWhiteSpace = compactTitleStyles.whiteSpace;
      const compactTitleTextOverflow = compactTitleStyles.textOverflow;
      const compactTitleLineClamp = compactTitleStyles.webkitLineClamp ||
        compactTitleStyles.getPropertyValue("-webkit-line-clamp") ||
        "";
      const compactPriceCenterDelta = Math.abs(
        (compactPriceRect.top + compactPriceRect.bottom) / 2 -
        (compactRowRect.top + compactRowRect.bottom) / 2
      );
      compactArchiveButton.focus();
      await sleep(220);
      const compactActionsFocusOpacity = Number(getComputedStyle(compactActions).opacity);
      compactArchiveButton.click();
      await sleep(260);
      const compactArchiveDecisionMode = root.querySelector(".wp-shell").classList.contains("is-decision-mode");
      const compactArchiveDropTrayOpacity = Number(getComputedStyle(root.querySelector("[data-decision-drop-tray]")).opacity);
      root.querySelector("[data-decision-cancel]").click();
      await sleep(120);
      await sleep(360);
      const compactTopGap = root.querySelector(".wp-compact-thumb").getBoundingClientRect().top -
        root.querySelector(".wp-filters").getBoundingClientRect().bottom;
      root.querySelector("[data-panel-compact-toggle]").click();
      await sleep(520);
      const compactRestoredCardView = !root.querySelector(".wp-items").classList.contains("is-compact");
      const compactTopbarStableAfterRestore = root.querySelector(".wp-topbar") === stableTopbar;
      root.querySelector("[data-panel-overflow-trigger]").click();
      await sleep(120);

      root.querySelector("[data-panel-search]").click();
      await sleep(120);
      const searchInput = root.querySelector("[data-search]");
      searchInput.value = "__tuckio_no_match_qa__";
      searchInput.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: searchInput.value }));
      await sleep(120);
      const noMatchEmpty = root.querySelector(".wp-empty");
      const noMatchIcon = noMatchEmpty?.querySelector(".wp-empty-state-icon");
      const noMatchIconStyles = noMatchIcon ? getComputedStyle(noMatchIcon) : null;
      const noMatchIconMask = noMatchIconStyles?.webkitMaskImage ||
        noMatchIconStyles?.maskImage ||
        noMatchIconStyles?.getPropertyValue("-webkit-mask-image") ||
        "";
      const noMatchIconColor = noMatchIconStyles?.color || "";
      const noMatchIconWidth = noMatchIcon?.getBoundingClientRect().width || 0;
      const noMatchTitle = noMatchEmpty?.querySelector("strong")?.textContent.trim() || "";
      const noMatchDetail = Array.from(noMatchEmpty?.querySelectorAll("span") || [])
        .find((node) => !node.classList.contains("wp-phosphor"))
        ?.textContent
        .trim() || "";
      const noMatchVisibleCardCount = root.querySelectorAll("[data-panel-item-id]").length;
      root.querySelector("[data-clear-search]").click();
      await sleep(80);
      root.querySelector("[data-clear-search]").click();
      await sleep(160);

      root.querySelector("[data-brand-cloud-toggle]").click();
      await sleep(180);
      let brandChip = root.querySelector("[data-brand-cloud-toggle]");
      const brandViewMotionClass = root.querySelector(".wp-shell").classList.contains("is-view-rebuild");
      const brandCloudItem = root.querySelector(".wp-brand-cloud-item");
      const brandCloudItemAnimationName = brandCloudItem ? getComputedStyle(brandCloudItem).animationName : "";
      const brandTopbarStable = root.querySelector(".wp-topbar") === stableTopbar;
      const brandTopbarAnimationName = getComputedStyle(stableTopbar).animationName;
      const brandFiltersAnimationName = getComputedStyle(root.querySelector(".wp-filters")).animationName;
      const brandActiveClass = brandChip.classList.contains("is-active");
      const brandActiveBackgroundColor = getComputedStyle(brandChip).backgroundColor;
      const brandActiveColor = getComputedStyle(brandChip).color;
      const brandActiveClearExists = Boolean(brandChip.querySelector(".wp-chip-clear"));
      root.querySelector("[data-panel-sort-trigger]").click();
      await sleep(80);
      root.querySelector('[data-panel-sort-option][data-panel-sort-field="name"][data-panel-sort-direction="asc"]').click();
      await sleep(220);
      const brandWheel = root.querySelector(".wp-brand-cloud.is-sort-list");
      const brandWheelStyle = getComputedStyle(brandWheel);
      const brandWheelItemStyle = getComputedStyle(brandWheel.querySelector(".wp-brand-cloud-item"));
      const brandWheelMask = brandWheelStyle.webkitMaskImage ||
        brandWheelStyle.maskImage ||
        brandWheelStyle.getPropertyValue("-webkit-mask-image");
      const brandWheelScrollable = brandWheel.scrollHeight > brandWheel.clientHeight + 8;
      const brandWheelOverflowY = brandWheelStyle.overflowY;
      const brandWheelSnapType = brandWheelStyle.scrollSnapType;
      const brandWheelSnapAlign = brandWheelItemStyle.scrollSnapAlign;
      const brandWheelScrollbarWidth = brandWheelStyle.scrollbarWidth;
      const brandWheelJustifyContent = brandWheelStyle.justifyContent;
      root.querySelector("[data-panel-sort-trigger]").click();
      await sleep(80);
      root.querySelector('[data-panel-sort-option][data-panel-sort-field="recent"][data-panel-sort-direction="desc"]').click();
      await sleep(220);
      brandChip.click();
      await sleep(660);
      brandChip = root.querySelector("[data-brand-cloud-toggle]");
      const brandClosedActive = brandChip.classList.contains("is-active");
      filterTrigger = root.querySelector("[data-filter-menu-trigger]");
      filterLabel = filterTrigger.querySelector(".wp-filter-trigger-label");
      filterTriggerWidth = filterTrigger.getBoundingClientRect().width;

      filterTrigger.click();
      await sleep(220);
      const filterExpandedRect = filterTrigger.getBoundingClientRect();
      const filterLabelRect = filterLabel.getBoundingClientRect();
      const filterLabelPosition = getComputedStyle(filterLabel).position;
      const filterOpenBackgroundColor = getComputedStyle(filterTrigger).backgroundColor;
      const filterOpenActive = filterTrigger.classList.contains("is-active");
      const filterLabelInsidePill = filterLabelRect.top >= filterExpandedRect.top - 1 &&
        filterLabelRect.bottom <= filterExpandedRect.bottom + 1;
      filterTrigger.click();
      await sleep(80);

      const sortTrigger = root.querySelector("[data-panel-sort-trigger]");
      const sortTriggerWidth = sortTrigger.getBoundingClientRect().width;
      sortTrigger.click();
      await sleep(220);
      const sortExpandedTrigger = root.querySelector("[data-panel-sort-trigger]");
      const sortLabel = sortExpandedTrigger.querySelector(".wp-sort-current");
      const sortExpandedRect = sortExpandedTrigger.getBoundingClientRect();
      const sortLabelRect = sortLabel.getBoundingClientRect();
      const sortLabelPosition = getComputedStyle(sortLabel).position;
      const sortLabelInsidePill = sortLabelRect.top >= sortExpandedRect.top - 1 &&
        sortLabelRect.bottom <= sortExpandedRect.bottom + 1;
      sortExpandedTrigger.click();
      await sleep(80);

      root.querySelector("[data-filter-menu-trigger]").click();
      await sleep(80);
      root.querySelector('[data-category="tops"]').click();
      await sleep(220);
      const activeFilterTrigger = root.querySelector("[data-filter-menu-trigger]");
      const activeFilterLabel = activeFilterTrigger.querySelector(".wp-filter-trigger-label");
      const activeFilterLabelColor = getComputedStyle(activeFilterLabel).color;
      const activeFilterBackgroundColor = getComputedStyle(activeFilterTrigger).backgroundColor;
      const activeFilterText = activeFilterLabel.textContent.trim();
      const activeFilterClear = activeFilterTrigger.querySelector("[data-filter-clear]");
      const activeFilterClearExists = Boolean(activeFilterClear);
      const scopedBrandLeft = root.querySelector(".wp-brand-chip").getBoundingClientRect().left;
      const brandLeftDeltaAfterScope = Math.abs(scopedBrandLeft - defaultBrandLeft);
      const chipLabelExists = Boolean(root.querySelector(".wp-chip-label"));
      const brandChipText = root.querySelector(".wp-brand-chip")?.textContent.trim() || "";
      const archiveChipText = root.querySelector(".wp-filter-archive")?.textContent.trim() || "";
      activeFilterClear.click();
      await sleep(180);
      const filterClearedActive = root.querySelector("[data-filter-menu-trigger]").classList.contains("is-active");
      const filterClearedText = root.querySelector(".wp-filter-trigger-label").textContent.trim();

      root.querySelector("[data-filter-menu-trigger]").click();
      await sleep(80);
      root.querySelector('[data-category="tops"]').click();
      await sleep(220);

      items = root.querySelector(".wp-items");
      items.style.scrollBehavior = "auto";
      items.scrollTop = 360;
      await sleep(80);
      const beforeScrollTop = items.scrollTop;
      const scrollHeight = items.scrollHeight;
      const clientHeight = items.clientHeight;
      const star = root.querySelector(`[data-shortlist-id="${targetId}"]`);
      star.focus();
      const starFocusedBeforePointer = root.activeElement === star;
      star.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, detail: 1 }));
      await sleep(220);
      const card = root.querySelector(`[data-panel-item-id="${targetId}"]`);
      const afterScrollTop = items.scrollTop;
      const starFocusedAfterPointer = root.activeElement === star;
      const starStyles = getComputedStyle(star);
      const starIcon = star.querySelector(".wp-card-action-icon");
      const starFillStyles = getComputedStyle(starIcon, "::before");
      const starContourStyles = getComputedStyle(starIcon, "::after");
      const starIconStyles = getComputedStyle(starIcon);
      const starRect = star.getBoundingClientRect();
      const starOpacity = Number(starStyles.opacity);
      const starBackgroundColor = starStyles.backgroundColor;
      const starIconAnimationName = starIconStyles.animationName;
      const starFillAnimationName = starFillStyles.animationName;
      const starFillBackground = starFillStyles.backgroundColor;
      const starFillClipPath = starFillStyles.clipPath ||
        starFillStyles.webkitClipPath ||
        starFillStyles.getPropertyValue("clip-path") ||
        starFillStyles.getPropertyValue("-webkit-clip-path");
      const starContourBackground = starContourStyles.backgroundColor;
      const starActive = star.classList.contains("is-active");
      const starTwinkling = star.classList.contains("is-twinkling");
      const panelStyleText = root.querySelector("style")?.textContent || "";
      const shortlistChip = root.querySelector("[data-shortlist-toggle]");
      const shortlistChipInRail = Boolean(shortlistChip?.closest("[data-filter-rail]"));
      const shortlistChipFirst = root.querySelector("[data-filter-rail]")?.firstElementChild === shortlistChip;

      root.querySelector("[data-panel-compact-toggle]").click();
      await sleep(260);
      const compactActiveStar = root.querySelector(`.wp-compact-item [data-shortlist-id="${targetId}"]`);
      const compactActiveStarActions = compactActiveStar?.closest(".wp-compact-actions");
      const compactActiveStarIcon = compactActiveStar?.querySelector(".wp-card-action-icon");
      const compactActiveStarStyles = compactActiveStar ? getComputedStyle(compactActiveStar) : null;
      const compactActiveStarActionsStyles = compactActiveStarActions ? getComputedStyle(compactActiveStarActions) : null;
      const compactActiveStarIconStyles = compactActiveStarIcon ? getComputedStyle(compactActiveStarIcon) : null;
      const compactActiveStarFillStyles = compactActiveStarIcon ? getComputedStyle(compactActiveStarIcon, "::before") : null;
      const compactActiveStarContourStyles = compactActiveStarIcon ? getComputedStyle(compactActiveStarIcon, "::after") : null;
      const compactActiveStarRect = compactActiveStar?.getBoundingClientRect();
      const compactActiveStarVisible = Boolean(compactActiveStar) &&
        Number(compactActiveStarStyles.opacity) >= 0.95 &&
        Number(compactActiveStarActionsStyles.opacity) >= 0.95;
      const compactActiveStarWidth = Math.round(compactActiveStarRect?.width || 0);
      const compactActiveStarIconWidth = Math.round(compactActiveStarIcon?.getBoundingClientRect().width || 0);
      const compactActiveStarFillBackground = compactActiveStarFillStyles?.backgroundColor || "";
      const compactActiveStarContourBackground = compactActiveStarContourStyles?.backgroundColor || "";
      const compactActiveStarAnimationName = compactActiveStarIconStyles?.animationName || "";
      const compactActiveStarTwinkling = compactActiveStar?.classList.contains("is-twinkling") || false;
      root.querySelector("[data-panel-compact-toggle]").click();
      await sleep(420);

      shortlistChip.click();
      await sleep(120);
      const filteredIds = Array.from(root.querySelectorAll("[data-panel-item-id]"), (node) => node.dataset.panelItemId);
      root.querySelector(`[data-shortlist-id="${targetId}"]`).click();
      await sleep(260);
      const shortlistChipAfterLastUnstar = root.querySelector("[data-shortlist-toggle]");
      const shortlistResetVisibleIds = Array.from(root.querySelectorAll("[data-panel-item-id]"), (node) => node.dataset.panelItemId);
      const shortlistResetCountText = root.querySelector(".wp-count")?.textContent.trim() || "";
      const trayButton = root.querySelector(`[data-decision-menu-id="${targetId}"]`);
      trayButton.click();
      await sleep(220);
      const clickModeShell = root.querySelector(".wp-shell");
      const clickModeDropTray = root.querySelector("[data-decision-drop-tray]");
      const clickModeDropTrayStyles = getComputedStyle(clickModeDropTray);
      const clickModeScrim = root.querySelector("[data-decision-cancel]");
      const clickModeScrimOpacity = Number(getComputedStyle(clickModeScrim).opacity);
      const clickModeClass = clickModeShell.classList.contains("is-decision-mode");
      const inlineTrayExists = Boolean(root.querySelector(".wp-decision-tray"));
      const clickModeDropTrayOpacity = Number(clickModeDropTrayStyles.opacity);
      const clickModeDropTrayPointerEvents = clickModeDropTrayStyles.pointerEvents;
      clickModeScrim.click();
      await sleep(120);
      const decisionModeAfterCancel = root.querySelector(".wp-shell").classList.contains("is-decision-mode");

      const dragCard = root.querySelector(`[data-panel-item-id="${targetId}"]`);
      const dataTransfer = new DataTransfer();
      dragCard.dispatchEvent(new DragEvent("dragstart", { bubbles: true, cancelable: true, dataTransfer }));
      await sleep(220);
      const dropTray = root.querySelector("[data-decision-drop-tray]");
      const dropTrayStyles = getComputedStyle(dropTray);
      const dragClass = root.querySelector(".wp-shell").classList.contains("is-decision-dragging");
      const dropTrayOpacity = Number(dropTrayStyles.opacity);
      const dropTrayPointerEvents = dropTrayStyles.pointerEvents;
      const dropTrayBackground = dropTrayStyles.backgroundImage ||
        dropTrayStyles.getPropertyValue("background-image");
      const dropTarget = root.querySelector('[data-decision-drop-action="bought"]');
      dropTarget.dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer }));
      await sleep(260);
      const dropTrayAfterDecisionStyles = getComputedStyle(root.querySelector("[data-decision-drop-tray]"));
      const decisionModeAfterDrop = root.querySelector(".wp-shell").classList.contains("is-decision-mode");
      const draggingModeAfterDrop = root.querySelector(".wp-shell").classList.contains("is-decision-dragging");
      const dropTrayOpacityAfterDecision = Number(dropTrayAfterDecisionStyles.opacity);
      const dropTrayPointerEventsAfterDecision = dropTrayAfterDecisionStyles.pointerEvents;
      const archiveViewMotionClass = root.querySelector(".wp-shell").classList.contains("is-view-rebuild");
      const archivedItems = root.querySelector(".wp-items");
      const archivedCard = root.querySelector(`[data-panel-item-id="${targetId}"]`);
      const decisionStatus = archivedCard?.querySelector(".wp-decision-status");
      const archiveToggle = root.querySelector("[data-archive-view-toggle]");
      const archiveTopbarStable = root.querySelector(".wp-topbar") === stableTopbar;
      const archiveTopbarAnimationName = getComputedStyle(stableTopbar).animationName;
      root.querySelector("[data-panel-compact-toggle]").click();
      await sleep(180);
      const archivedCompactRow = root.querySelector(`[data-panel-item-id="${targetId}"]`);
      const archivedCompactItems = root.querySelector(".wp-items");
      const archivedCompactList = archivedCompactRow?.closest(".wp-compact-list");
      const archivedCompactIndex = archivedCompactRow?.querySelector(".wp-compact-index");
      const archivedCompactStatus = archivedCompactRow?.querySelector(".wp-compact-state .wp-decision-status");
      const archivedCompactMetaStatus = archivedCompactRow?.querySelector(".wp-compact-meta .wp-decision-status");
      const archivedCompactTitle = archivedCompactRow?.querySelector(".wp-compact-copy .wp-item-title");
      const archivedCompactActions = archivedCompactRow?.querySelector(".wp-compact-actions");
      const archivedCompactTitleRect = archivedCompactTitle?.getBoundingClientRect();
      const archivedCompactActionsRect = archivedCompactActions?.getBoundingClientRect();
      const archivedCompactStateRect = archivedCompactRow?.querySelector(".wp-compact-state")?.getBoundingClientRect();
      const archivedCompactPriceRect = archivedCompactRow?.querySelector(".wp-compact-price")?.getBoundingClientRect();
      const archivedCompactRowRect = archivedCompactRow?.getBoundingClientRect();
      const archivedCompactRowStyles = archivedCompactRow ? getComputedStyle(archivedCompactRow) : null;
      const archivedCompactTitleStyles = archivedCompactTitle ? getComputedStyle(archivedCompactTitle) : null;
      const archivedCompactStatusText = archivedCompactStatus?.textContent.trim() || "";
      const archivedCompactStatusOutsideCopy = Boolean(archivedCompactStatus) && !archivedCompactMetaStatus;
      const archivedCompactStatusBeforePrice = archivedCompactStateRect && archivedCompactPriceRect
        ? archivedCompactStateRect.right <= archivedCompactPriceRect.left + 1
        : false;
      const archivedCompactGridColumns = (archivedCompactRowStyles?.gridTemplateColumns || "")
        .split(/\s+/)
        .map((value) => Number.parseFloat(value));
      const archivedCompactTitleWidth = Math.round(archivedCompactTitleRect?.width || 0);
      const archivedCompactRowHeight = Math.round(archivedCompactRowRect?.height || 0);
      const archivedCompactPriceCenterDelta = archivedCompactPriceRect && archivedCompactRowRect
        ? Math.abs((archivedCompactPriceRect.top + archivedCompactPriceRect.bottom) / 2 -
          (archivedCompactRowRect.top + archivedCompactRowRect.bottom) / 2)
        : 999;
      const archivedCompactActionsBelowTitle = archivedCompactActionsRect && archivedCompactTitleRect
        ? archivedCompactActionsRect.top >= archivedCompactTitleRect.bottom - 1
        : false;
      const archivedCompactModeClass = archivedCompactItems.classList.contains("is-compact");
      const archivedCompactListExists = Boolean(archivedCompactList);
      const archivedCompactCardColumnsExist = Boolean(archivedCompactItems.querySelector("[data-panel-column]"));
      const archivedCompactRowClass = archivedCompactRow?.classList.contains("wp-compact-item") || false;
      const archivedCompactIndexText = archivedCompactIndex?.textContent.trim() || "";
      const archivedCompactTitleWhiteSpace = archivedCompactTitleStyles?.whiteSpace || "";
      const archivedCompactTitleTextOverflow = archivedCompactTitleStyles?.textOverflow || "";
      const archivedCompactPriceCenterDeltaRounded = Math.round(archivedCompactPriceCenterDelta);
      root.querySelector("[data-panel-compact-toggle]").click();
      await sleep(520);
      archiveToggle.click();
      await sleep(260);
      const clickDecisionTargetId = "active-56";
      root.querySelector(`[data-decision-menu-id="${clickDecisionTargetId}"]`).click();
      await sleep(180);
      root.querySelector('[data-decision-drop-action="bought"]').click();
      await sleep(260);
      const clickBoughtDropTrayStyles = getComputedStyle(root.querySelector("[data-decision-drop-tray]"));
      const clickBoughtDecisionModeAfterChoice = root.querySelector(".wp-shell").classList.contains("is-decision-mode");
      const clickBoughtDraggingModeAfterChoice = root.querySelector(".wp-shell").classList.contains("is-decision-dragging");
      const clickBoughtDropTrayOpacityAfterDecision = Number(clickBoughtDropTrayStyles.opacity);
      const clickBoughtDropTrayPointerEventsAfterDecision = clickBoughtDropTrayStyles.pointerEvents;
      const clickBoughtArchivedCardVisible = Boolean(root.querySelector(`[data-panel-item-id="${clickDecisionTargetId}"]`));

      return {
        filterTriggerWidth: Math.round(filterTriggerWidth),
        allFilterExists,
        resetExists,
        topbarShortlistExists,
        topbarCountTextCenterDelta,
        totalValueCenterDelta,
        topbarCountColor,
        totalChevronOpacity,
        totalChevronWidth,
        totalChevronMaxWidth,
        archiveChipBackgroundColor,
        archiveChipColor,
        cardTopGap,
        immediateBoughtStatusText,
        immediateBoughtStatusClass,
        immediateReturnedActive,
        overflowMenuWidth,
        languageMenuWidth,
        languageTriggerGap,
        languageTriggerFlagAfterLabel,
        languageOptionFlagAfterLabel,
        aboutDialogVisible,
        aboutDialogClosed,
        overflowHiddenAfterAboutOpen,
        overflowExpandedAfterAboutOpen,
        overflowHiddenAfterAboutClose,
        overflowExpandedAfterAboutClose,
        themeMotionClass,
        themeGraphiteClass,
        themeTopbarStable,
        themeItemsStable,
        themeRestoredLight,
        themeTopbarStableAfterRestore,
        themeItemsStableAfterRestore,
        compactModeClass,
        compactSwitchClass,
        compactTopbarStable,
        compactIndexExists,
        compactIndexText,
        compactIndexBeforeThumb,
        compactGridTemplateColumns,
        compactGridColumns,
        compactListWidth: compactListRect.width,
        compactItemsWidth: compactItemsRect.width,
        compactThumbWidth: Math.round(compactThumbRect.width),
        compactThumbHeight: Math.round(compactThumbRect.height),
        compactCopyWidth,
        compactTitleWhiteSpace,
        compactTitleTextOverflow,
        compactTitleLineClamp,
        compactStateBeforePrice,
        compactPriceCenterDelta: Math.round(compactPriceCenterDelta),
        compactTopGap,
        compactActionsPosition,
        compactActionsOpacity,
        compactInactiveActionOpacity,
        compactActionsBeforePrice,
        compactActionsBelowTitle,
        compactActionsFocusOpacity,
        compactArchiveButtonExists: Boolean(compactArchiveButton),
        compactArchiveDecisionMode,
        compactArchiveDropTrayOpacity,
        compactRestoredCardView,
        compactTopbarStableAfterRestore,
        noMatchIconExists: Boolean(noMatchIcon),
        noMatchIconMask,
        noMatchIconColor,
        noMatchIconWidth: Math.round(noMatchIconWidth),
        noMatchTitle,
        noMatchDetail,
        noMatchVisibleCardCount,
        brandActiveClass,
        brandViewMotionClass,
        brandCloudItemAnimationName,
        brandTopbarStable,
        brandTopbarAnimationName,
        brandFiltersAnimationName,
        brandActiveBackgroundColor,
        brandActiveColor,
        brandActiveClearExists,
        brandWheelScrollable,
        brandWheelOverflowY,
        brandWheelSnapType,
        brandWheelSnapAlign,
        brandWheelScrollbarWidth,
        brandWheelJustifyContent,
        brandWheelMask,
        brandClosedActive,
        filterExpandedWidth: Math.round(filterExpandedRect.width),
        filterOpenBackgroundColor,
        filterOpenActive,
        filterLabelPosition,
        filterLabelInsidePill,
        activeFilterLabelColor,
        activeFilterBackgroundColor,
        activeFilterText,
        activeFilterClearExists,
        filterClearedActive,
        filterClearedText,
        sortTriggerWidth: Math.round(sortTriggerWidth),
        sortExpandedWidth: Math.round(sortExpandedRect.width),
        sortLabelPosition,
        sortLabelInsidePill,
        beforeScrollTop,
        afterScrollTop,
        scrollHeight,
        clientHeight,
        starActive,
        starTwinkling,
        starIconAnimationName,
        starFillAnimationName,
        starFocusedBeforePointer,
        starFocusedAfterPointer,
        cardBurst: card.classList.contains("is-shortlist-burst"),
        starOpacity,
        starBackgroundColor,
        starButtonWidth: Math.round(starRect.width),
        starFillBackground,
        starFillClipPath,
        starContourBackground,
        compactActiveStarVisible,
        compactActiveStarWidth,
        compactActiveStarIconWidth,
        compactActiveStarFillBackground,
        compactActiveStarContourBackground,
        compactActiveStarAnimationName,
        compactActiveStarTwinkling,
        imageSweepExists: Boolean(card.querySelector(".wp-shortlist-sweep")),
        panelStyleHasSweep: panelStyleText.includes("wpShortlistSweep") ||
          panelStyleText.includes(".wp-shortlist-sweep"),
        shortlistChipText: shortlistChip.textContent.trim(),
        shortlistChipInRail,
        shortlistChipFirst,
        brandLeftDeltaAfterScope,
        chipLabelExists,
        brandChipText,
        archiveChipText,
        filteredIds,
        shortlistChipAfterLastUnstarExists: Boolean(shortlistChipAfterLastUnstar),
        shortlistChipAfterLastUnstarActive: shortlistChipAfterLastUnstar?.classList.contains("is-active") || false,
        shortlistResetVisibleCount: shortlistResetVisibleIds.length,
        shortlistResetCountText,
        clickModeClass,
        inlineTrayExists,
        clickModeScrimOpacity,
        clickModeDropTrayOpacity,
        clickModeDropTrayPointerEvents,
        decisionModeAfterCancel,
        dragClass,
        dropTrayOpacity,
        dropTrayPointerEvents,
        dropTrayBackground,
        decisionModeAfterDrop,
        draggingModeAfterDrop,
        dropTrayOpacityAfterDecision,
        dropTrayPointerEventsAfterDecision,
        decisionIconCount: root.querySelectorAll(".wp-decision-drop-tray .wp-decision-pill-icon").length,
        archiveViewOpen: archivedItems.classList.contains("is-archive-view"),
        archivedCardVisible: Boolean(archivedCard),
        archiveToggleActive: archiveToggle?.classList.contains("is-active") || false,
        archiveViewMotionClass,
        archiveTopbarStable,
        archiveTopbarAnimationName,
        archivedCompactModeClass,
        archivedCompactListExists,
        archivedCompactCardColumnsExist,
        archivedCompactRowClass,
        archivedCompactIndexText,
        archivedCompactGridColumns,
        archivedCompactStatusText,
        archivedCompactStatusOutsideCopy,
        archivedCompactStatusBeforePrice,
        archivedCompactTitleWidth,
        archivedCompactRowHeight,
        archivedCompactTitleWhiteSpace,
        archivedCompactTitleTextOverflow,
        archivedCompactPriceCenterDelta: archivedCompactPriceCenterDeltaRounded,
        archivedCompactActionsBelowTitle,
        archiveToggleClearExists: Boolean(archiveToggle?.querySelector(".wp-chip-clear")),
        decisionStatusText: decisionStatus?.textContent.trim() || "",
        decisionStatusClass: decisionStatus?.className || "",
        clickBoughtDecisionModeAfterChoice,
        clickBoughtDraggingModeAfterChoice,
        clickBoughtDropTrayOpacityAfterDecision,
        clickBoughtDropTrayPointerEventsAfterDecision,
        clickBoughtArchivedCardVisible
      };
    });

    console.log(`panel decisions e2e metrics ${JSON.stringify(metrics)}`);
    assert.ok(metrics.filterTriggerWidth <= 96, `Filter trigger should not keep a wide right gutter: ${metrics.filterTriggerWidth}px`);
    assert.equal(metrics.allFilterExists, false, "Permanent All chip should not render");
    assert.equal(metrics.resetExists, false, "Separate reset/undo chip should not render");
    assert.equal(metrics.topbarShortlistExists, false, "Shortlist state should not render as a separate topbar badge");
    assert.ok(metrics.topbarCountTextCenterDelta <= 2, `Topbar item count should be centered: ${metrics.topbarCountTextCenterDelta}px`);
    assert.ok(metrics.totalValueCenterDelta <= 2, `Summary value should center while chevron is hidden: ${metrics.totalValueCenterDelta}px`);
    assert.match(metrics.topbarCountColor, /rgba?\(8, 11, 16, 0\.46\)/, "Topbar item count should stay muted under the total value");
    assert.equal(metrics.totalChevronOpacity, 0, "Total currency chevron should be hidden until hover, focus, or open");
    assert.ok(metrics.totalChevronWidth <= 1, `Hidden total currency chevron should collapse its layout width: ${metrics.totalChevronWidth}px`);
    assert.match(metrics.totalChevronMaxWidth, /^0px$/, "Hidden total currency chevron should collapse through max-width");
    assert.match(metrics.archiveChipBackgroundColor, /rgba?\(255, 255, 255, 0\.38\)/, "Archive count chip should be muted while inactive");
    assert.match(metrics.archiveChipColor, /rgba?\(8, 11, 16, 0\.52\)/, "Archive count chip should use muted text while inactive");
    assert.ok(metrics.cardTopGap <= 32, `Card view should start close under the filter row: ${metrics.cardTopGap}px`);
    assert.equal(metrics.immediateBoughtStatusText, "Bought", "First decision after opening the panel should show Bought immediately");
    assert.match(metrics.immediateBoughtStatusClass, /is-bought/, "First decision after opening should render bought badge styling immediately");
    assert.equal(metrics.immediateReturnedActive, true, "E2E should return from the immediate archive check before continuing");
    assert.ok(metrics.overflowMenuWidth >= 340, `Overflow menu should not feel cramped: ${metrics.overflowMenuWidth}px`);
    assert.ok(metrics.languageMenuWidth >= 228, `Language dropdown should not feel cramped: ${metrics.languageMenuWidth}px`);
    assert.ok(metrics.languageTriggerGap >= 16, `Language label should not stick to the select: ${metrics.languageTriggerGap}px`);
    assert.equal(metrics.languageTriggerFlagAfterLabel, true, "Collapsed language trigger should place the flag after the label");
    assert.equal(metrics.languageOptionFlagAfterLabel, true, "Language dropdown should keep flags after labels");
    assert.equal(metrics.aboutDialogVisible, true, "About should open from the overflow menu");
    assert.equal(metrics.aboutDialogClosed, true, "About close should remove the dialog");
    assert.equal(metrics.overflowHiddenAfterAboutOpen, true, "Opening About should close the overflow menu");
    assert.equal(metrics.overflowExpandedAfterAboutOpen, "false", "Opening About should clear overflow expanded state");
    assert.equal(metrics.overflowHiddenAfterAboutClose, true, "Closing About should leave the overflow menu closed");
    assert.equal(metrics.overflowExpandedAfterAboutClose, "false", "Closing About should leave overflow expanded state false");
    assert.equal(metrics.themeMotionClass, false, "Dark mode toggle should not use rebuild motion");
    assert.equal(metrics.themeGraphiteClass, true, "Dark mode toggle should apply the graphite theme in place");
    assert.equal(metrics.themeTopbarStable, true, "Dark mode toggle should not replace the topbar node");
    assert.equal(metrics.themeItemsStable, true, "Dark mode toggle should not replace the item node");
    assert.equal(metrics.themeRestoredLight, true, "Dark mode e2e should restore the light theme before continuing");
    assert.equal(metrics.themeTopbarStableAfterRestore, true, "Dark mode motion cleanup should not rerender the topbar at the end");
    assert.equal(metrics.themeItemsStableAfterRestore, true, "Dark mode motion cleanup should not rerender items at the end");
    assert.equal(metrics.compactModeClass, true, "List view toggle should switch the item area into compact mode");
    assert.equal(metrics.compactSwitchClass, true, "List view toggle should use the content-only switch motion");
    assert.equal(metrics.compactTopbarStable, true, "List view toggle should not replace the topbar node");
    assert.equal(metrics.compactIndexExists, true, "List view should render visible row numbers");
    assert.equal(metrics.compactIndexText, "1", "List row number should be plain numeric text without a hash prefix");
    assert.equal(metrics.compactIndexBeforeThumb, true, "List row number should sit before the thumbnail");
    assert.equal(metrics.compactGridColumns[0], 28, `List view index column should stay narrow: ${metrics.compactGridTemplateColumns}`);
    assert.equal(metrics.compactGridColumns[1], 78, `List view thumb column should be 78px: ${metrics.compactGridTemplateColumns}`);
    assert.ok(metrics.compactGridColumns[2] >= 100, `List view copy column should get real width: ${metrics.compactGridTemplateColumns}`);
    assert.ok(metrics.compactGridColumns[3] >= 72, `List view price column should keep a compact floor: ${metrics.compactGridTemplateColumns}`);
    assert.ok(metrics.compactListWidth >= metrics.compactItemsWidth - 28, `List view should use the panel width: list ${metrics.compactListWidth}px, items ${metrics.compactItemsWidth}px`);
    assert.equal(metrics.compactThumbWidth, 78, "List thumbnails should use the wider full-width row sizing");
    assert.equal(metrics.compactThumbHeight, 98, "List thumbnails should be taller to show products better");
    assert.ok(metrics.compactCopyWidth >= 100, `List copy column should remain readable: ${metrics.compactCopyWidth}px`);
    assert.equal(metrics.compactTitleWhiteSpace, "normal", "List item titles should wrap instead of ellipsizing");
    assert.equal(metrics.compactTitleTextOverflow, "clip", "List item titles should not use CSS ellipsis");
    assert.match(metrics.compactTitleLineClamp, /none|unset/, "List item titles should not use line clamp");
    assert.equal(metrics.compactStateBeforePrice, true, "List status/action column should stay before the price column");
    assert.ok(metrics.compactPriceCenterDelta <= 8, `List price should be vertically centered in the row: ${metrics.compactPriceCenterDelta}px`);
    assert.ok(metrics.compactTopGap <= 32, `List view should start close under the filter row: ${metrics.compactTopGap}px`);
    assert.equal(metrics.compactActionsPosition, "relative", "List actions should sit in the row flow below the copy");
    assert.equal(metrics.compactActionsOpacity, 1, "List action row should stay present so an active star can remain visible");
    assert.equal(metrics.compactInactiveActionOpacity, 0, "Inactive List actions should stay hidden until hover or focus");
    assert.equal(metrics.compactActionsBeforePrice, true, "List actions should not overlap the price column");
    assert.equal(metrics.compactActionsBelowTitle, true, "List actions should sit below the title instead of cutting through text");
    assert.equal(metrics.compactArchiveButtonExists, true, "List view should expose the archive decision action");
    assert.ok(metrics.compactActionsFocusOpacity >= 0.95, "List actions should reveal on keyboard focus");
    assert.equal(metrics.compactArchiveDecisionMode, true, "List archive action should open decision mode");
    assert.ok(metrics.compactArchiveDropTrayOpacity >= 0.95, "List archive action should show the bottom decision tray");
    assert.equal(metrics.compactRestoredCardView, true, "List view e2e should restore card view before continuing");
    assert.equal(metrics.compactTopbarStableAfterRestore, true, "Leaving list view should not replace the topbar node");
    assert.equal(metrics.noMatchTitle, "No matches", "Search with no results should render the no-match empty state");
    assert.equal(metrics.noMatchDetail, "Try another name, category, or source.", "Search no-match empty state should keep the focused helper copy");
    assert.equal(metrics.noMatchVisibleCardCount, 0, "Search no-match state should not leave stale cards visible");
    assert.equal(metrics.noMatchIconExists, true, "Search no-match empty state should render an icon");
    assert.ok(metrics.noMatchIconWidth >= 40, `Search no-match icon should be visibly sized: ${metrics.noMatchIconWidth}px`);
    assert.match(metrics.noMatchIconMask, /magnifying-glass-minus\.svg/i, "Search no-match icon should use the Phosphor search-minus asset");
    assert.match(metrics.noMatchIconColor, /rgba?\(8, 11, 16, 0\.34\)/, "Search no-match icon should stay visually quiet");
    assert.equal(metrics.brandActiveClass, true, "Opening Brands should mark the chip active");
    assert.equal(metrics.brandViewMotionClass, false, "Opening Brands should not replay the whole view");
    assert.match(metrics.brandCloudItemAnimationName, /^none$/, "Opening Brands should not restart item entrance animation");
    assert.equal(metrics.brandTopbarStable, true, "Opening Brands should not replace the topbar node");
    assert.match(metrics.brandTopbarAnimationName, /^none$/, "Opening Brands should not animate the topbar");
    assert.match(metrics.brandFiltersAnimationName, /^none$/, "Opening Brands should not animate the filter chrome");
    assert.match(metrics.brandActiveBackgroundColor, /rgba?\(8, 11, 16, 0\.86\)/, "Active Brands should use the selected black surface");
    assert.match(metrics.brandActiveColor, /rgb\(255, 255, 255\)|rgba\(255, 255, 255, 1\)/, "Active Brands should use selected foreground text");
    assert.equal(metrics.brandActiveClearExists, true, "Active Brands should expose an inline close affordance");
    assert.equal(metrics.brandWheelScrollable, true, "Sorted brand list should scroll internally when brands overflow");
    assert.equal(metrics.brandWheelOverflowY, "auto", "Sorted brand list should accept mouse-wheel scrolling");
    assert.match(metrics.brandWheelSnapType, /y/, "Sorted brand list should use vertical scroll snap");
    assert.match(metrics.brandWheelSnapAlign, /center/, "Sorted brand rows should snap toward the center");
    assert.equal(metrics.brandWheelScrollbarWidth, "none", "Sorted brand list should hide native scrollbars");
    assert.equal(metrics.brandWheelJustifyContent, "flex-start", "Sorted brand list should scroll from the top instead of overflowing around center");
    assert.match(metrics.brandWheelMask, /linear-gradient/i, "Sorted brand list should fade at the top and bottom like a wheel");
    assert.equal(metrics.brandClosedActive, false, "Clicking active Brands should return to the main list state");
    assert.ok(metrics.filterExpandedWidth > metrics.filterTriggerWidth, "Filter label should expand inside the trigger pill");
    assert.equal(metrics.filterOpenActive, false, "Opening Filter should not mark it active without an applied filter");
    assert.doesNotMatch(metrics.filterOpenBackgroundColor, /rgba?\(8, 11, 16, 0\.86\)/, "Opening Filter should not paint the selected black surface");
    assert.equal(metrics.filterLabelPosition, "static", "Filter label should not render as a detached tooltip");
    assert.equal(metrics.filterLabelInsidePill, true, "Filter label should stay inside the trigger pill bounds");
    assert.match(metrics.activeFilterBackgroundColor, /rgba?\(8, 11, 16, 0\.86\)/, "Applied Filter should use the selected black surface");
    assert.match(metrics.activeFilterLabelColor, /rgb\(255, 255, 255\)|rgba\(255, 255, 255, 1\)/, "Applied Filter label should be white on the selected surface");
    assert.equal(metrics.activeFilterText, "Filter (1)", "Applied Filter should expose the active filter count");
    assert.equal(metrics.activeFilterClearExists, true, "Applied Filter should expose an inline clear affordance");
    assert.equal(metrics.filterClearedActive, false, "Filter clear affordance should remove the active filter state");
    assert.equal(metrics.filterClearedText, "Filter", "Filter clear affordance should restore the default label");
    assert.ok(metrics.sortExpandedWidth > metrics.sortTriggerWidth, "Sort label should expand inside the trigger pill");
    assert.equal(metrics.sortLabelPosition, "static", "Sort label should not render as a detached tooltip");
    assert.equal(metrics.sortLabelInsidePill, true, "Sort label should stay inside the trigger pill bounds");
    assert.ok(metrics.scrollHeight > metrics.clientHeight, "Seeded panel should be scrollable");
    assert.ok(metrics.beforeScrollTop > 0, "E2E should exercise a scrolled list");
    assert.ok(Math.abs(metrics.afterScrollTop - metrics.beforeScrollTop) <= 4, "Shortlist click should not reset list scroll");
    assert.equal(metrics.starActive, true, "Star should become active");
    assert.equal(metrics.starTwinkling, false, "Shortlist star should not use twinkle animation");
    assert.match(metrics.starIconAnimationName, /^none$/, "Shortlist star icon should not animate");
    assert.match(metrics.starFillAnimationName, /^none$/, "Shortlist star fill should not animate");
    assert.equal(metrics.starFocusedBeforePointer, true, "E2E should exercise the pointer-click focus path");
    assert.equal(metrics.starFocusedAfterPointer, false, "Pointer shortlist click should not leave hover actions stuck via focus-within");
    assert.equal(metrics.cardBurst, false, "Shortlist click should not add a card sweep state");
    assert.equal(metrics.imageSweepExists, false, "Shortlist click should not add an image sweep layer");
    assert.equal(metrics.panelStyleHasSweep, false, "Runtime panel styles should not include the removed shortlist sweep");
    assert.ok(metrics.starOpacity >= 0.95, "Active star should be visible without hover");
    assert.ok(metrics.starButtonWidth >= 28 && metrics.starButtonWidth <= 34, `Active star should keep the normal action size: ${metrics.starButtonWidth}px`);
    assert.match(metrics.starBackgroundColor, /rgba?\(0, 0, 0, 0\)|transparent/i, "Active star button should not use a square backing slab");
    assert.match(metrics.starContourBackground, /rgba?\(8, 11, 16, 0\.76\)/, "Active star should use a dark contour layer for contrast");
    assert.match(metrics.starFillClipPath, /polygon/i, "Active star should use a solid filled star shape");
    assert.match(metrics.starFillBackground, /rgb\(255, 216, 77\)/, "Active star should use a static filled star color");
    assert.equal(metrics.compactActiveStarVisible, true, "Active shortlist star should remain visible in List view without hover");
    assert.equal(metrics.compactActiveStarTwinkling, false, "List active star should not twinkle");
    assert.ok(metrics.compactActiveStarWidth >= 26 && metrics.compactActiveStarWidth <= 30, `List active star should keep compact action size: ${metrics.compactActiveStarWidth}px`);
    assert.ok(metrics.compactActiveStarIconWidth >= 16 && metrics.compactActiveStarIconWidth <= 18, `List active star icon should stay normal size: ${metrics.compactActiveStarIconWidth}px`);
    assert.match(metrics.compactActiveStarFillBackground, /rgb\(255, 216, 77\)/, "List active star should use the same static filled star color");
    assert.match(metrics.compactActiveStarContourBackground, /rgba?\(8, 11, 16, 0\.76\)/, "List active star should keep the contour");
    assert.match(metrics.compactActiveStarAnimationName, /^none$/, "List active star should not animate");
    assert.equal(metrics.shortlistChipText, "1", "Shortlist chip should expose the shortlist count");
    assert.equal(metrics.shortlistChipInRail, true, "Shortlist state should live in the filter chip row");
    assert.equal(metrics.shortlistChipFirst, true, "Shortlist chip should lead the scope row when present");
    assert.ok(metrics.brandLeftDeltaAfterScope <= 3, `Brand chip should not shift when Filter becomes active: ${metrics.brandLeftDeltaAfterScope}px`);
    assert.equal(metrics.chipLabelExists, false, "Brand and archive chips should not render text labels");
    assert.match(metrics.brandChipText, /^\d+$/, "Brand chip should stay icon plus count only");
    assert.match(metrics.archiveChipText, /^\d+$/, "Archive chip should stay icon plus count only");
    assert.deepEqual(metrics.filteredIds, ["active-54"], "Shortlist chip should filter the visible list");
    assert.equal(metrics.shortlistChipAfterLastUnstarExists, false, "Removing the last star in shortlist scope should remove the shortlist chip");
    assert.equal(metrics.shortlistChipAfterLastUnstarActive, false, "Removing the last star should clear active shortlist scope");
    assert.ok(metrics.shortlistResetVisibleCount > 1, `Removing the last star should return to the broader list: ${metrics.shortlistResetVisibleCount}`);
    assert.doesNotMatch(metrics.shortlistResetCountText, /^1 of /, "Removing the last star should refresh the scoped summary count");
    assert.equal(metrics.clickModeClass, true, "Archive button should open global decision mode");
    assert.equal(metrics.inlineTrayExists, false, "Archive button should not render an inline decision tray under the card");
    assert.ok(metrics.clickModeScrimOpacity >= 0.95, "Decision mode should dim the panel above the bottom tray");
    assert.ok(metrics.clickModeDropTrayOpacity >= 0.95, "Archive button should reveal the bottom decision tray");
    assert.equal(metrics.clickModeDropTrayPointerEvents, "auto", "Bottom tray should accept clicks in decision mode");
    assert.equal(metrics.decisionModeAfterCancel, false, "Clicking the dimmed panel should cancel decision mode");
    assert.equal(metrics.dragClass, true, "Dragging a card should mark the shell as dragging");
    assert.ok(metrics.dropTrayOpacity >= 0.95, "Drag mode should reveal the drop tray");
    assert.equal(metrics.dropTrayPointerEvents, "auto", "Drop tray should accept drops while dragging");
    assert.match(metrics.dropTrayBackground, /linear-gradient/i, "Drop tray should fade upward with a gradient");
    assert.equal(metrics.decisionModeAfterDrop, false, "Dropping on Bought should close decision mode");
    assert.equal(metrics.draggingModeAfterDrop, false, "Dropping on Bought should clear drag mode");
    assert.ok(metrics.dropTrayOpacityAfterDecision <= 0.05, "Dropping on Bought should hide the bottom decision tray");
    assert.equal(metrics.dropTrayPointerEventsAfterDecision, "none", "Dropping on Bought should disable bottom tray hit testing");
    assert.equal(metrics.decisionIconCount, 3, "Drop tray decisions should render icons");
    assert.equal(metrics.archiveViewOpen, true, "After a decision the archive list should open");
    assert.equal(metrics.archivedCardVisible, true, "Decided item should be visible in the archive list");
    assert.equal(metrics.archiveToggleActive, true, "Archive chip should show the active archive list");
    assert.equal(metrics.archiveViewMotionClass, false, "Archive reveal should not replay the whole view");
    assert.equal(metrics.archiveTopbarStable, true, "Archive reveal should not replace the topbar node");
    assert.match(metrics.archiveTopbarAnimationName, /^none$/, "Archive reveal should not animate the topbar");
    assert.equal(metrics.archivedCompactModeClass, true, "Archive should respect List view mode");
    assert.equal(metrics.archivedCompactListExists, true, "Archive List view should render the same compact list wrapper");
    assert.equal(metrics.archivedCompactCardColumnsExist, false, "Archive List view should not keep card columns");
    assert.equal(metrics.archivedCompactRowClass, true, "Archive items in List view should use compact row markup");
    assert.equal(metrics.archivedCompactIndexText, "1", "Archive compact row should get the same plain row numbering");
    assert.equal(metrics.archivedCompactGridColumns[0], 28, "Archive compact row should keep the normal index column");
    assert.equal(metrics.archivedCompactGridColumns[1], 78, "Archive compact row should keep the normal thumbnail column");
    assert.ok(metrics.archivedCompactGridColumns[2] >= 100, "Archive compact row should keep readable copy width");
    assert.ok(metrics.archivedCompactGridColumns[3] >= 72, "Archive compact row should keep the compact price column");
    assert.equal(metrics.archivedCompactStatusText, "Bought", "List archive row should show Bought immediately");
    assert.equal(metrics.archivedCompactStatusOutsideCopy, true, "List decision badge should not live inside the title column");
    assert.equal(metrics.archivedCompactStatusBeforePrice, true, "List decision badge should sit before the price column");
    assert.ok(metrics.archivedCompactTitleWidth >= 100, `Archived list title should remain readable: ${metrics.archivedCompactTitleWidth}px`);
    assert.equal(metrics.archivedCompactTitleWhiteSpace, "normal", "Archive compact titles should wrap like the main List view");
    assert.equal(metrics.archivedCompactTitleTextOverflow, "clip", "Archive compact titles should not use CSS ellipsis");
    assert.ok(metrics.archivedCompactPriceCenterDelta <= 8, `Archive compact price should be vertically centered: ${metrics.archivedCompactPriceCenterDelta}px`);
    assert.equal(metrics.archivedCompactActionsBelowTitle, true, "Archive compact actions should sit below the title");
    assert.ok(metrics.archivedCompactRowHeight <= 124, `Archived list row should stay dense: ${metrics.archivedCompactRowHeight}px`);
    assert.equal(metrics.archiveToggleClearExists, true, "Active archive chip should expose an inline close affordance");
    assert.equal(metrics.decisionStatusText, "Bought", "Archived card should display the persisted Bought decision");
    assert.match(metrics.decisionStatusClass, /is-bought/, "Bought decision badge should use bought styling");
    assert.equal(metrics.clickBoughtDecisionModeAfterChoice, false, "Clicking Bought in the bottom tray should close decision mode");
    assert.equal(metrics.clickBoughtDraggingModeAfterChoice, false, "Clicking Bought should leave drag mode closed");
    assert.ok(metrics.clickBoughtDropTrayOpacityAfterDecision <= 0.05, "Clicking Bought should hide the bottom decision tray");
    assert.equal(metrics.clickBoughtDropTrayPointerEventsAfterDecision, "none", "Clicking Bought should disable bottom tray hit testing");
    assert.equal(metrics.clickBoughtArchivedCardVisible, true, "Clicking Bought should move the item into the archive view");

    const stored = await worker.evaluate((key) => chrome.storage.local.get(key), storageKey);
    const decided = stored[storageKey].find((item) => item.id === "active-54");
    const clickedDecided = stored[storageKey].find((item) => item.id === "active-56");
    assert.equal(decided?.decision?.state, "bought", "Dropping on Bought should persist the decision");
    assert.ok(decided?.archivedAt, "Dropping on Bought should archive the item");
    assert.equal(clickedDecided?.decision?.state, "bought", "Clicking Bought should persist the decision");
    assert.ok(clickedDecided?.archivedAt, "Clicking Bought should archive the item");

    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`panel decisions e2e passed ${JSON.stringify(metrics)}`);
    console.log(`panel screenshot: ${screenshotPath}`);
  } finally {
    await context.close().catch(() => {});
  }
}

function addTemporaryHostPermissions(dir) {
  const manifestPath = path.join(dir, "manifest.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  manifest.host_permissions = ["http://*/*", "https://*/*"];
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

async function extensionWorker(context) {
  return context.serviceWorkers()[0] || context.waitForEvent("serviceworker", { timeout: 15000 });
}

async function openPanel(worker) {
  await worker.evaluate(async ({ files, version }) => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files });
    await chrome.tabs.sendMessage(tab.id, { type: "TUCKIO_TOGGLE_PANEL_V2", contentVersion: version });
  }, { files: contentScriptFiles, version: contentVersion });
}

function seededItems() {
  const imageUrl = "https://example.com/product.jpg";
  const activeItems = Array.from({ length: 60 }, (_, index) => ({
    id: `active-${index + 1}`,
    title: `Product ${index + 1}`,
    brand: `Brand ${index % 24}`,
    url: `https://example.com/products/active-${index + 1}`,
    category: index % 2 ? "tops" : "bags",
    price: { amount: 80 + index, currency: "USD", originalText: `$${80 + index}` },
    priceText: `$${80 + index}`,
    priceAmount: 80 + index,
    currency: "USD",
    imageUrl,
    imageUrls: [imageUrl],
    createdAt: new Date(Date.UTC(2026, 0, 1, 0, index)).toISOString()
  }));
  return [
    ...activeItems,
    {
      ...activeItems[0],
      id: "archived-1",
      title: "Archived Product",
      url: "https://example.com/products/archived-1",
      archivedAt: new Date(Date.UTC(2026, 0, 2)).toISOString()
    }
  ];
}
