function refreshPanelSummaryRate(options = {}) {
  const currency = cleanText(panelState.summaryCurrency).toUpperCase();
  const currencies = panelRateCurrencies(currency);
  if (!panelState.open || !currency || panelState.summaryRateLoading === currency) {
    return;
  }
  if (panelCurrencyRatesAreFresh(currencies)) {
    return;
  }

  panelState.summaryRateLoading = currency;
  Promise.all(currencies.map(getCurrencyRate))
    .then((rates) => {
      if (!panelState.open || panelState.summaryCurrency !== currency) {
        return;
      }
      panelState.currencyRates = {
        ...panelState.currencyRates,
        ...Object.fromEntries(rates.map(panelCurrencyRateEntry).filter(Boolean))
      };
      panelState.summaryRate = panelCurrencyRateFor(currency);
      renderPanelSummaryOnly({ animate: options.animateSummary, skipWhileAnimating: true });
      renderPanelPricesOnly({ animate: options.animateSummary });
    })
    .catch(() => {
      panelState.summaryRate = defaultSummaryRate(currency);
      renderPanelSummaryOnly({ animate: options.animateSummary, skipWhileAnimating: true });
      renderPanelPricesOnly({ animate: options.animateSummary });
    })
    .finally(() => {
      if (panelState.summaryRateLoading === currency) {
        panelState.summaryRateLoading = "";
      }
    });
}

function defaultSummaryRate(currency) {
  const code = isSummaryCurrency(currency)
    ? cleanText(currency).toUpperCase()
    : DEFAULT_SETTINGS.summaryCurrency;
  return {
    currency: code,
    value: DEFAULT_CURRENCY_RATES[code],
    source: "default",
    updatedAt: 0
  };
}

function panelRateCurrencies(targetCurrency) {
  const codes = new Set([targetCurrency]);
  panelState.items.forEach((item) => {
    const price = item?.price || normalizePanelPrice(item || {});
    const code = cleanText(price.currency ?? item?.currency).toUpperCase();
    if (isSummaryCurrency(code)) {
      codes.add(code);
    }
  });
  return Array.from(codes).filter(isSummaryCurrency);
}

function panelCurrencyRatesAreFresh(currencies) {
  const now = Date.now();
  return currencies.every((currency) => {
    const rate = panelCachedCurrencyRate(currency);
    return Number.isFinite(rate?.value) && now - rate.updatedAt < RATE_MAX_AGE_MS;
  });
}

function panelCachedCurrencyRate(currency) {
  const code = cleanText(currency).toUpperCase();
  return panelState.summaryRate?.currency === code
    ? panelState.summaryRate
    : panelState.currencyRates?.[code];
}

function panelCurrencyRateEntry(rate) {
  const code = cleanText(rate?.currency).toUpperCase();
  return isSummaryCurrency(code) ? [code, rate] : null;
}

function panelCurrencyRateFor(currency) {
  const code = cleanText(currency).toUpperCase();
  const rate = panelState.currencyRates?.[code];
  return Number.isFinite(rate?.value) ? rate : defaultSummaryRate(code);
}
