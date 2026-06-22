var STASH_I18N_LANGUAGE_IDS = [
  PANEL_LANGUAGE_ES,
  PANEL_LANGUAGE_DE,
  PANEL_LANGUAGE_FR,
  PANEL_LANGUAGE_RU
];
var STASH_I18N_MESSAGE_ROWS = [
  ["About", "Acerca de", "Über", "À propos", "О Stashed"],
  ["About Stashed", "Acerca de Stashed", "Über Stashed", "À propos de Stashed", "О Stashed"],
  ["Add", "Añadir", "Hinzufügen", "Ajouter", "Добавить"],
  ["Add category", "Añadir categoría", "Kategorie hinzufügen", "Ajouter une catégorie", "Добавить категорию"],
  ["All", "Todo", "Alle", "Tout", "Все"],
  ["Archive", "Archivar", "Archivieren", "Archiver", "Архивировать"],
  ["Archived items will appear here.", "Los artículos archivados aparecerán aquí.", "Archivierte Artikel erscheinen hier.", "Les articles archivés apparaîtront ici.", "Архивные товары появятся здесь."],
  ["Archived items: {count}", "Artículos archivados: {count}", "Archivierte Artikel: {count}", "Articles archivés : {count}", "В архиве: {count}"],
  ["Auto-close in {seconds}s", "Cierre automático en {seconds} s", "Schließt automatisch in {seconds} s", "Fermeture automatique dans {seconds} s", "Закроется через {seconds} с"],
  ["Auto-close paused", "Cierre automático en pausa", "Automatisches Schließen pausiert", "Fermeture automatique en pause", "Автозакрытие на паузе"],
  ["Backup", "Copia de seguridad", "Sicherung", "Sauvegarde", "Бэкап"],
  ["Backup JSON did not include any valid saved items.", "La copia JSON no incluye artículos guardados válidos.", "Die JSON-Sicherung enthält keine gültigen gespeicherten Artikel.", "La sauvegarde JSON ne contient aucun article enregistré valide.", "В JSON-бэкапе нет валидных сохранённых товаров."],
  ["Backup JSON must include an items array.", "La copia JSON debe incluir un array items.", "Die JSON-Sicherung muss ein items-Array enthalten.", "La sauvegarde JSON doit inclure un tableau items.", "JSON-бэкап должен содержать массив items."],
  ["Bags", "Bolsos", "Taschen", "Sacs", "Сумки"],
  ["Bottoms", "Pantalones", "Hosen", "Bas", "Низ"],
  ["Brand", "Marca", "Marke", "Marque", "Бренд"],
  ["Brands by saved item count", "Marcas por número de artículos guardados", "Marken nach Anzahl gespeicherter Artikel", "Marques par nombre d’articles enregistrés", "Бренды по количеству сохранённых товаров"],
  ["Cancel", "Cancelar", "Abbrechen", "Annuler", "Отмена"],
  ["Cancel category", "Cancelar categoría", "Kategorie abbrechen", "Annuler la catégorie", "Отменить категорию"],
  ["Cancel edit", "Cancelar edición", "Bearbeitung abbrechen", "Annuler la modification", "Отменить редактирование"],
  ["Category", "Categoría", "Kategorie", "Catégorie", "Категория"],
  ["Choose a Stashed JSON backup under 6 MB.", "Elige una copia JSON de Stashed de menos de 6 MB.", "Wähle eine Stashed JSON-Sicherung unter 6 MB.", "Choisis une sauvegarde JSON Stashed de moins de 6 Mo.", "Выберите JSON-бэкап Stashed меньше 6 МБ."],
  ["Choose a valid Stashed JSON backup.", "Elige una copia JSON válida de Stashed.", "Wähle eine gültige Stashed JSON-Sicherung.", "Choisis une sauvegarde JSON Stashed valide.", "Выберите валидный JSON-бэкап Stashed."],
  ["Choose summary currency", "Elegir moneda del resumen", "Währung der Summe wählen", "Choisir la devise du résumé", "Выбрать валюту итога"],
  ["Clear search", "Borrar búsqueda", "Suche löschen", "Effacer la recherche", "Очистить поиск"],
  ["Clear the brand filter to see the rest of your saved products.", "Borra el filtro de marca para ver el resto de tus productos guardados.", "Lösche den Markenfilter, um die übrigen gespeicherten Produkte zu sehen.", "Efface le filtre de marque pour voir le reste de tes produits enregistrés.", "Сбросьте фильтр бренда, чтобы увидеть остальные сохранённые товары."],
  ["Close", "Cerrar", "Schließen", "Fermer", "Закрыть"],
  ["Close search", "Cerrar búsqueda", "Suche schließen", "Fermer la recherche", "Закрыть поиск"],
  ["Could not import JSON", "No se pudo importar el JSON", "JSON konnte nicht importiert werden", "Impossible d’importer le JSON", "Не удалось импортировать JSON"],
  ["Could not save this item", "No se pudo guardar este artículo", "Dieser Artikel konnte nicht gespeichert werden", "Impossible d’enregistrer cet article", "Не удалось сохранить товар"],
  ["Currency", "Moneda", "Währung", "Devise", "Валюта"],
  ["Dark mode", "Modo oscuro", "Dunkler Modus", "Mode sombre", "Тёмная тема"],
  ["Dark mode off", "Modo oscuro desactivado", "Dunkler Modus aus", "Mode sombre désactivé", "Тёмная тема выключена"],
  ["Dark mode on", "Modo oscuro activado", "Dunkler Modus an", "Mode sombre activé", "Тёмная тема включена"],
  ["Date", "Fecha", "Datum", "Date", "Дата"],
  ["Date newest", "Más recientes", "Neueste zuerst", "Plus récents", "Сначала новые"],
  ["Date oldest", "Más antiguos", "Älteste zuerst", "Plus anciens", "Сначала старые"],
  ["Delete", "Eliminar", "Löschen", "Supprimer", "Удалить"],
  ["Delete {category}?", "¿Eliminar {category}?", "{category} löschen?", "Supprimer {category} ?", "Удалить {category}?"],
  ["Delete {item}?", "¿Eliminar {item}?", "{item} löschen?", "Supprimer {item} ?", "Удалить {item}?"],
  ["Edit", "Editar", "Bearbeiten", "Modifier", "Изменить"],
  ["Edit item", "Editar artículo", "Artikel bearbeiten", "Modifier l’article", "Изменить товар"],
  ["Export JSON", "Exportar JSON", "JSON exportieren", "Exporter JSON", "Экспорт JSON"],
  ["Export Stashed JSON", "Exportar JSON de Stashed", "Stashed JSON exportieren", "Exporter le JSON Stashed", "Экспортировать JSON Stashed"],
  ["Filter", "Filtro", "Filter", "Filtre", "Фильтр"],
  ["Filter ({count})", "Filtro ({count})", "Filter ({count})", "Filtre ({count})", "Фильтр ({count})"],
  ["Founder", "Fundador", "Gründer", "Fondateur", "Основатель"],
  ["Founder contact links", "Enlaces de contacto del fundador", "Kontaktlinks des Gründers", "Liens de contact du fondateur", "Контакты основателя"],
  ["Founder contacts", "Contactos del fundador", "Kontakte des Gründers", "Contacts du fondateur", "Контакты основателя"],
  ["Image URL", "URL de imagen", "Bild-URL", "URL de l’image", "URL изображения"],
  ["Import JSON", "Importar JSON", "JSON importieren", "Importer JSON", "Импорт JSON"],
  ["Import Stashed JSON", "Importar JSON de Stashed", "Stashed JSON importieren", "Importer le JSON Stashed", "Импортировать JSON Stashed"],
  ["Import merges with saved items.", "La importación se fusiona con los artículos guardados.", "Importe werden mit gespeicherten Artikeln zusammengeführt.", "L’import fusionne avec les articles enregistrés.", "Импорт объединяется с сохранёнными товарами."],
  ["Item {number}", "Artículo {number}", "Artikel {number}", "Article {number}", "Товар {number}"],
  ["Items stay saved and move back to All.", "Los artículos siguen guardados y vuelven a Todo.", "Artikel bleiben gespeichert und wandern zurück zu Alle.", "Les articles restent enregistrés et reviennent dans Tout.", "Товары останутся сохранёнными и вернутся во Все."],
  ["JSON backup", "Copia JSON", "JSON-Sicherung", "Sauvegarde JSON", "JSON-бэкап"],
  ["Language", "Idioma", "Sprache", "Langue", "Язык"],
  ["List view", "Vista de lista", "Listenansicht", "Vue liste", "Список"],
  ["List view off", "Vista de lista desactivada", "Listenansicht aus", "Vue liste désactivée", "Список выключен"],
  ["List view on", "Vista de lista activada", "Listenansicht an", "Vue liste activée", "Список включён"],
  ["Local JSON backup", "Copia JSON local", "Lokale JSON-Sicherung", "Sauvegarde JSON locale", "Локальный JSON-бэкап"],
  ["More options", "Más opciones", "Weitere Optionen", "Plus d’options", "Ещё"],
  ["Name", "Nombre", "Name", "Nom", "Название"],
  ["Name A-Z", "Nombre A-Z", "Name A-Z", "Nom A-Z", "Название А-Я"],
  ["Name Z-A", "Nombre Z-A", "Name Z-A", "Nom Z-A", "Название Я-А"],
  ["New category", "Nueva categoría", "Neue Kategorie", "Nouvelle catégorie", "Новая категория"],
  ["Next image{label}", "Imagen siguiente{label}", "Nächstes Bild{label}", "Image suivante{label}", "Следующее изображение{label}"],
  ["No archived items", "No hay artículos archivados", "Keine archivierten Artikel", "Aucun article archivé", "В архиве пусто"],
  ["No items here", "No hay artículos aquí", "Keine Artikel hier", "Aucun article ici", "Здесь пусто"],
  ["No matches", "Sin resultados", "Keine Treffer", "Aucun résultat", "Ничего не найдено"],
  ["Not found", "No encontrado", "Nicht gefunden", "Introuvable", "Не найдено"],
  ["Oops, image missing", "Falta la imagen", "Bild fehlt", "Image manquante", "Изображение не найдено"],
  ["Open Stash", "Abrir Stash", "Stash öffnen", "Ouvrir Stash", "Открыть Stash"],
  ["Open Stash panel", "Abrir panel de Stash", "Stash-Panel öffnen", "Ouvrir le panneau Stash", "Открыть панель Stash"],
  ["Open {item}", "Abrir {item}", "{item} öffnen", "Ouvrir {item}", "Открыть {item}"],
  ["Outerwear", "Abrigos", "Outerwear", "Manteaux", "Верхняя одежда"],
  ["Pause auto-close", "Pausar cierre automático", "Automatisches Schließen pausieren", "Suspendre la fermeture automatique", "Приостановить автозакрытие"],
  ["Previous image{label}", "Imagen anterior{label}", "Vorheriges Bild{label}", "Image précédente{label}", "Предыдущее изображение{label}"],
  ["Price", "Precio", "Preis", "Prix", "Цена"],
  ["Price high-low", "Precio de mayor a menor", "Preis absteigend", "Prix décroissant", "Цена по убыванию"],
  ["Price low-high", "Precio de menor a mayor", "Preis aufsteigend", "Prix croissant", "Цена по возрастанию"],
  ["Products saved to {category} will appear here.", "Los productos guardados en {category} aparecerán aquí.", "In {category} gespeicherte Produkte erscheinen hier.", "Les produits enregistrés dans {category} apparaîtront ici.", "Товары из категории {category} появятся здесь."],
  ["Remove current image{label}", "Eliminar imagen actual{label}", "Aktuelles Bild entfernen{label}", "Supprimer l’image actuelle{label}", "Удалить текущее изображение{label}"],
  ["Remove image", "Eliminar imagen", "Bild entfernen", "Supprimer l’image", "Удалить изображение"],
  ["Remove {category}", "Eliminar {category}", "{category} entfernen", "Supprimer {category}", "Удалить {category}"],
  ["Restore", "Restaurar", "Wiederherstellen", "Restaurer", "Восстановить"],
  ["Resume auto-close", "Reanudar cierre automático", "Automatisches Schließen fortsetzen", "Reprendre la fermeture automatique", "Возобновить автозакрытие"],
  ["Save", "Guardar", "Speichern", "Enregistrer", "Сохранить"],
  ["Save current item", "Guardar artículo actual", "Aktuellen Artikel speichern", "Enregistrer l’article actuel", "Сохранить текущий товар"],
  ["Save products from any shop into a compact local wishlist.", "Guarda productos de cualquier tienda en una wishlist local compacta.", "Speichere Produkte aus jedem Shop in einer kompakten lokalen Wunschliste.", "Enregistre des produits de n’importe quelle boutique dans une wishlist locale compacte.", "Сохраняйте товары из любых магазинов в компактный локальный wishlist."],
  ["Save your first product", "Guarda tu primer producto", "Speichere dein erstes Produkt", "Enregistre ton premier produit", "Сохраните первый товар"],
  ["Saved", "Guardado", "Gespeichert", "Enregistré", "Сохранено"],
  ["Saved products that match this view will appear here.", "Los productos guardados que coincidan con esta vista aparecerán aquí.", "Gespeicherte Produkte, die zu dieser Ansicht passen, erscheinen hier.", "Les produits enregistrés correspondant à cette vue apparaîtront ici.", "Сохранённые товары для этого вида появятся здесь."],
  ["Search", "Buscar", "Suchen", "Rechercher", "Поиск"],
  ["Search saved", "Buscar guardados", "Gespeicherte durchsuchen", "Rechercher dans les enregistrés", "Поиск по сохранённым"],
  ["Saving current item", "Guardando artículo actual", "Aktueller Artikel wird gespeichert", "Enregistrement de l’article actuel", "Сохраняю текущий товар"],
  ["Shoes", "Calzado", "Schuhe", "Chaussures", "Обувь"],
  ["Show all saved items", "Mostrar todos los artículos guardados", "Alle gespeicherten Artikel anzeigen", "Afficher tous les articles enregistrés", "Показать все сохранённые товары"],
  ["Sort", "Ordenar", "Sortieren", "Trier", "Сортировка"],
  ["Sort saved items: {label}", "Ordenar artículos guardados: {label}", "Gespeicherte Artikel sortieren: {label}", "Trier les articles enregistrés : {label}", "Сортировать сохранённые товары: {label}"],
  ["Stashed categories", "Categorías de Stashed", "Stashed-Kategorien", "Catégories Stashed", "Категории Stashed"],
  ["Stashed was reloaded. Refresh this page and try again.", "Stashed se recargó. Actualiza esta página e inténtalo de nuevo.", "Stashed wurde neu geladen. Aktualisiere diese Seite und versuche es erneut.", "Stashed a été rechargé. Actualise cette page et réessaie.", "Stashed был перезагружен. Обновите страницу и попробуйте снова."],
  ["This removes it from Stashed.", "Esto lo elimina de Stashed.", "Dadurch wird es aus Stashed entfernt.", "Cela le supprime de Stashed.", "Товар будет удалён из Stashed."],
  ["Tops", "Partes superiores", "Oberteile", "Hauts", "Верх"],
  ["Try a product page or product card.", "Prueba una página o tarjeta de producto.", "Probiere eine Produktseite oder Produktkarte.", "Essaie une page produit ou une carte produit.", "Попробуйте страницу товара или карточку товара."],
  ["Try another name, category, or source.", "Prueba otro nombre, categoría o fuente.", "Versuche einen anderen Namen, eine andere Kategorie oder Quelle.", "Essaie un autre nom, une autre catégorie ou une autre source.", "Попробуйте другое название, категорию или источник."],
  ["Undo", "Deshacer", "Rückgängig", "Annuler", "Отменить"],
  ["Undo save", "Deshacer guardado", "Speichern rückgängig machen", "Annuler l’enregistrement", "Отменить сохранение"],
  ["Unexpected Stashed storage key.", "Clave de almacenamiento de Stashed inesperada.", "Unerwarteter Stashed-Speicherschlüssel.", "Clé de stockage Stashed inattendue.", "Неожиданный ключ хранилища Stashed."],
  ["Use the plus button or right-click a product card, image, link, or product page and choose Save to Stashed.", "Usa el botón más o haz clic derecho en una tarjeta, imagen, enlace o página de producto y elige Save to Stashed.", "Nutze die Plus-Schaltfläche oder klicke mit der rechten Maustaste auf Produktkarte, Bild, Link oder Produktseite und wähle Save to Stashed.", "Utilise le bouton plus ou fais un clic droit sur une carte, image, lien ou page produit, puis choisis Save to Stashed.", "Используйте кнопку плюса или кликните правой кнопкой по карточке, изображению, ссылке или странице товара и выберите Save to Stashed."],
  [" for {item}", " de {item}", " für {item}", " pour {item}", " для {item}"],
  [" from {item}", " de {item}", " von {item}", " de {item}", " у {item}"],
  ["{action} {item}", "{action} {item}", "{action} {item}", "{action} {item}", "{action} {item}"],
  ["{count} {brandNoun}. Close brands", "{count} {brandNoun}. Cerrar marcas", "{count} {brandNoun}. Marken schließen", "{count} {brandNoun}. Fermer les marques", "{count} {brandNoun}. Закрыть бренды"],
  ["{count} {brandNoun}. Show brands", "{count} {brandNoun}. Mostrar marcas", "{count} {brandNoun}. Marken anzeigen", "{count} {brandNoun}. Afficher les marques", "{count} {brandNoun}. Показать бренды"],
  ["{item} product image", "Imagen de producto de {item}", "Produktbild von {item}", "Image produit de {item}", "Изображение товара {item}"],
  ["{label}. Close category filter menu", "{label}. Cerrar menú de categorías", "{label}. Kategoriemenü schließen", "{label}. Fermer le menu des catégories", "{label}. Закрыть меню категорий"],
  ["{label}. Open category filter menu", "{label}. Abrir menú de categorías", "{label}. Kategoriemenü öffnen", "{label}. Ouvrir le menu des catégories", "{label}. Открыть меню категорий"],
  ["{label} saved", "{label} guardados", "{label} gespeichert", "{label} enregistrés", "{label} сохранено"],
  ["0 items from {brand}", "0 artículos de {brand}", "0 Artikel von {brand}", "0 article de {brand}", "0 товаров от {brand}"],
  ["0 items in {category}", "0 artículos en {category}", "0 Artikel in {category}", "0 article dans {category}", "0 товаров в {category}"],
  ["Accessories", "Accesorios", "Accessoires", "Accessoires", "Аксессуары"],
  ["Showing {label} items", "Mostrando {label}", "{label} angezeigt", "{label} affichés", "Показано: {label}"],
  ["this brand", "esta marca", "dieser Marke", "cette marque", "этого бренда"],
  ["this category", "esta categoría", "diese Kategorie", "cette catégorie", "эта категория"],
  ["of", "de", "von", "sur", "из"]
];
var STASH_I18N_MESSAGES = {};
STASH_I18N_LANGUAGE_IDS.forEach((language, index) => {
  STASH_I18N_MESSAGES[language] = Object.fromEntries(
    STASH_I18N_MESSAGE_ROWS.map(([key, ...values]) => [key, values[index]])
  );
});

function t(key, replacements = {}) {
  const messages = STASH_I18N_MESSAGES[panelCurrentLanguage()] || {};
  return interpolatePanelText(messages[key] || key, replacements);
}

function panelCurrentLanguage() {
  const language = String(panelState?.language || DEFAULT_SETTINGS.language).toLowerCase();
  return PANEL_LANGUAGE_OPTIONS.some((option) => option.id === language)
    ? language
    : DEFAULT_SETTINGS.language;
}

function panelItemNoun(count) {
  const singular = Number(count) === 1;
  switch (panelCurrentLanguage()) {
    case PANEL_LANGUAGE_ES:
      return singular ? "artículo" : "artículos";
    case PANEL_LANGUAGE_DE:
      return "Artikel";
    case PANEL_LANGUAGE_FR:
      return singular ? "article" : "articles";
    case PANEL_LANGUAGE_RU:
      return panelRussianPlural(count, "товар", "товара", "товаров");
    default:
      return singular ? "item" : "items";
  }
}

function panelBrandNoun(count) {
  const singular = Number(count) === 1;
  switch (panelCurrentLanguage()) {
    case PANEL_LANGUAGE_ES:
      return singular ? "marca" : "marcas";
    case PANEL_LANGUAGE_DE:
      return singular ? "Marke" : "Marken";
    case PANEL_LANGUAGE_FR:
      return singular ? "marque" : "marques";
    case PANEL_LANGUAGE_RU:
      return panelRussianPlural(count, "бренд", "бренда", "брендов");
    default:
      return singular ? "brand" : "brands";
  }
}

function panelRussianPlural(count, one, few, many) {
  const value = Math.abs(Number(count) || 0);
  const mod10 = value % 10;
  const mod100 = value % 100;
  if (mod10 === 1 && mod100 !== 11) {
    return one;
  }
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return few;
  }
  return many;
}

function panelCategoryDisplayLabel(category) {
  const label = cleanCategoryLabel(category?.label || category?.id);
  const defaultCategory = DEFAULT_CATEGORIES.find((item) => item.id === category?.id);
  if (defaultCategory && cleanCategoryLabel(defaultCategory.label) === label) {
    return t(defaultCategory.label);
  }
  return label || t("Saved");
}

function panelLanguageOptionLabel(language) {
  return panelLanguageOption(language)?.label || language;
}

function panelLanguageOption(language) {
  return PANEL_LANGUAGE_OPTIONS.find((option) => option.id === language);
}

function panelLanguageFlag(language) {
  return panelLanguageOption(language)?.flag || "";
}

function renderPanelLanguageSelect() {
  const label = t("Language");
  const currentLanguage = panelCurrentLanguage();
  const currentOption = panelLanguageOption(currentLanguage);
  return `
    <div class="wp-overflow-language wp-overflow-language-root" style="${escapeAttribute(PANEL_OVERFLOW_LANGUAGE_INLINE_STYLE)}" role="none" data-panel-language-root>
      ${phosphorGlobeIcon("wp-overflow-option-icon")}
      <span id="wp-language-label">${escapeHtml(label)}</span>
      <button class="wp-overflow-language-trigger" style="${escapeAttribute(PANEL_OVERFLOW_LANGUAGE_TRIGGER_INLINE_STYLE)}" type="button" role="menuitem" aria-labelledby="wp-language-label wp-language-current" aria-haspopup="menu" aria-expanded="false" data-panel-language-trigger>
        <span class="wp-language-flag" aria-hidden="true">${escapeHtml(currentOption?.flag || "")}</span>
        <span id="wp-language-current" class="wp-language-current">${escapeHtml(currentOption?.label || currentLanguage)}</span>
        ${phosphorChevronDownIcon("wp-language-chevron")}
      </button>
      <div class="wp-language-menu" style="${escapeAttribute(PANEL_OVERFLOW_LANGUAGE_MENU_INLINE_STYLE)}" role="menu" hidden data-panel-language-menu>
        ${PANEL_LANGUAGE_OPTIONS.map((option) => {
          const isSelected = option.id === currentLanguage;
          return `
            <button class="wp-language-option${isSelected ? " is-selected" : ""}" style="${escapeAttribute(PANEL_OVERFLOW_LANGUAGE_OPTION_INLINE_STYLE)}" type="button" role="menuitemradio" aria-checked="${isSelected}" data-panel-language="${escapeAttribute(option.id)}">
              <span class="wp-language-check">${isSelected ? phosphorCheckIcon("wp-language-check-icon") : ""}</span>
              <span class="wp-language-label">${escapeHtml(option.label)}</span>
              <span class="wp-language-flag" aria-hidden="true">${escapeHtml(option.flag)}</span>
            </button>
          `;
        }).join("")}
      </div>
    </div>
  `;
}
