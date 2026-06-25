var TUCKIO_I18N_LANGUAGE_IDS = [
  PANEL_LANGUAGE_ES,
  PANEL_LANGUAGE_DE,
  PANEL_LANGUAGE_FR,
  PANEL_LANGUAGE_RU
];
var TUCKIO_I18N_MESSAGE_ROWS = [
  ["About", "Acerca de", "Über", "À propos", "О Tuckio"],
  ["About Tuckio", "Acerca de Tuckio", "Über Tuckio", "À propos de Tuckio", "О Tuckio"],
  ["Add", "Añadir", "Hinzufügen", "Ajouter", "Добавить"],
  ["Add category", "Añadir categoría", "Kategorie hinzufügen", "Ajouter une catégorie", "Добавить категорию"],
  ["All", "Todo", "Alle", "Tout", "Все"],
  ["Archive", "Archivar", "Archivieren", "Archiver", "Архивировать"],
  ["Archive: bought and archived items", "Archivo: comprados y archivados", "Archiv: gekaufte und archivierte Artikel", "Archive : articles achetés et archivés", "Архив: купленные и архивные товары"],
  ["Archived items will appear here.", "Los artículos archivados aparecerán aquí.", "Archivierte Artikel erscheinen hier.", "Les articles archivés apparaîtront ici.", "Архивные товары появятся здесь."],
  ["Archived items: {count}", "Artículos archivados: {count}", "Archivierte Artikel: {count}", "Articles archivés : {count}", "В архиве: {count}"],
  ["Author", "Autor", "Autor", "Auteur", "Автор"],
  ["Author contact links", "Enlaces de contacto del autor", "Kontaktlinks des Autors", "Liens de contact de l’auteur", "Контакты автора"],
  ["Author contacts", "Contactos del autor", "Kontakte des Autors", "Contacts de l’auteur", "Контакты автора"],
  ["Add to shortlist", "Añadir a favoritos", "Zur Auswahlliste hinzufügen", "Ajouter à la sélection", "Добавить в шортлист"],
  ["Auto-close in {seconds}s", "Cierre automático en {seconds} s", "Schließt automatisch in {seconds} s", "Fermeture automatique dans {seconds} s", "Закроется через {seconds} с"],
  ["Auto-close paused", "Cierre automático en pausa", "Automatisches Schließen pausiert", "Fermeture automatique en pause", "Автозакрытие на паузе"],
  ["Backup", "Copia de seguridad", "Sicherung", "Sauvegarde", "Бэкап"],
  ["Backup JSON did not include any valid saved items.", "La copia JSON no incluye artículos guardados válidos.", "Die JSON-Sicherung enthält keine gültigen gespeicherten Artikel.", "La sauvegarde JSON ne contient aucun article enregistré valide.", "В JSON-бэкапе нет валидных сохранённых товаров."],
  ["Backup JSON must include an items array.", "La copia JSON debe incluir un array items.", "Die JSON-Sicherung muss ein items-Array enthalten.", "La sauvegarde JSON doit inclure un tableau items.", "JSON-бэкап должен содержать массив items."],
  ["Bags", "Bolsos", "Taschen", "Sacs", "Сумки"],
  ["Bottoms", "Pantalones", "Hosen", "Bas", "Низ"],
  ["Brand", "Marca", "Marke", "Marque", "Бренд"],
  ["Brand cloud: saved brands", "Nube de marcas: marcas guardadas", "Brand Cloud: gespeicherte Marken", "Nuage de marques : marques enregistrées", "Облако брендов: сохранённые бренды"],
  ["Brand filter: {brand}", "Filtro de marca: {brand}", "Markenfilter: {brand}", "Filtre marque : {brand}", "Фильтр бренда: {brand}"],
  ["Brands by saved item count", "Marcas por número de artículos guardados", "Marken nach Anzahl gespeicherter Artikel", "Marques par nombre d’articles enregistrés", "Бренды по количеству сохранённых товаров"],
  ["Bought", "Comprado", "Gekauft", "Acheté", "Куплено"],
  ["Cancel", "Cancelar", "Abbrechen", "Annuler", "Отмена"],
  ["Cancel category", "Cancelar categoría", "Kategorie abbrechen", "Annuler la catégorie", "Отменить категорию"],
  ["Cancel edit", "Cancelar edición", "Bearbeitung abbrechen", "Annuler la modification", "Отменить редактирование"],
  ["Card view", "Vista de tarjetas", "Kartenansicht", "Vue cartes", "Карточки"],
  ["Category", "Categoría", "Kategorie", "Catégorie", "Категория"],
  ["Category filter", "Filtro de categoría", "Kategoriefilter", "Filtre catégorie", "Фильтр категории"],
  ["Category filter: {category}", "Filtro de categoría: {category}", "Kategoriefilter: {category}", "Filtre catégorie : {category}", "Фильтр категории: {category}"],
  ["Choose a Tuckio JSON backup under 6 MB.", "Elige una copia JSON de Tuckio de menos de 6 MB.", "Wähle eine Tuckio JSON-Sicherung unter 6 MB.", "Choisis une sauvegarde JSON Tuckio de moins de 6 Mo.", "Выберите JSON-бэкап Tuckio меньше 6 МБ."],
  ["Choose a valid Tuckio JSON backup.", "Elige una copia JSON válida de Tuckio.", "Wähle eine gültige Tuckio JSON-Sicherung.", "Choisis une sauvegarde JSON Tuckio valide.", "Выберите валидный JSON-бэкап Tuckio."],
  ["Choose summary currency", "Elegir moneda del resumen", "Währung der Summe wählen", "Choisir la devise du résumé", "Выбрать валюту итога"],
  ["Check prices", "Comprobar precios", "Preise prüfen", "Vérifier les prix", "Проверить цены"],
  ["checked", "comprobado", "geprüft", "vérifié", "проверено"],
  ["checked today", "comprobado hoy", "heute geprüft", "vérifié aujourd’hui", "проверено сегодня"],
  ["checked {date}", "comprobado {date}", "geprüft am {date}", "vérifié le {date}", "проверено {date}"],
  ["check missed", "sin precio", "nicht geprüft", "non vérifié", "не проверено"],
  ["Clear search", "Borrar búsqueda", "Suche löschen", "Effacer la recherche", "Очистить поиск"],
  ["Clear all local Tuckio data in this browser.", "Borra todos los datos locales de Tuckio en este navegador.", "Löscht alle lokalen Tuckio-Daten in diesem Browser.", "Efface toutes les données locales Tuckio dans ce navigateur.", "Удаляет все локальные данные Tuckio в этом браузере."],
  ["Clear the brand filter to see the rest of your saved products.", "Borra el filtro de marca para ver el resto de tus productos guardados.", "Lösche den Markenfilter, um die übrigen gespeicherten Produkte zu sehen.", "Efface le filtre de marque pour voir le reste de tes produits enregistrés.", "Сбросьте фильтр бренда, чтобы увидеть остальные сохранённые товары."],
  ["Close", "Cerrar", "Schließen", "Fermer", "Закрыть"],
  ["Close search", "Cerrar búsqueda", "Suche schließen", "Fermer la recherche", "Закрыть поиск"],
  ["Could not import JSON", "No se pudo importar el JSON", "JSON konnte nicht importiert werden", "Impossible d’importer le JSON", "Не удалось импортировать JSON"],
  ["Could not delete this item", "No se pudo eliminar este artículo", "Dieser Artikel konnte nicht gelöscht werden", "Impossible de supprimer cet article", "Не удалось удалить товар"],
  ["Could not reset Tuckio", "No se pudo restablecer Tuckio", "Tuckio konnte nicht zurückgesetzt werden", "Impossible de réinitialiser Tuckio", "Не удалось сбросить Tuckio"],
  ["Could not save this item", "No se pudo guardar este artículo", "Dieser Artikel konnte nicht gespeichert werden", "Impossible d’enregistrer cet article", "Не удалось сохранить товар"],
  ["Couldn’t check price · {checked}", "No se pudo comprobar el precio · {checked}", "Preis konnte nicht geprüft werden · {checked}", "Prix non vérifié · {checked}", "Не удалось проверить цену · {checked}"],
  ["Currency", "Moneda", "Währung", "Devise", "Валюта"],
  ["Dark mode", "Modo oscuro", "Dunkler Modus", "Mode sombre", "Тёмная тема"],
  ["Dark mode off", "Modo oscuro desactivado", "Dunkler Modus aus", "Mode sombre désactivé", "Тёмная тема выключена"],
  ["Dark mode on", "Modo oscuro activado", "Dunkler Modus an", "Mode sombre activé", "Тёмная тема включена"],
  ["Danger zone", "Zona de peligro", "Gefahrenbereich", "Zone de danger", "Опасная зона"],
  ["Date", "Fecha", "Datum", "Date", "Дата"],
  ["Date newest", "Más recientes", "Neueste zuerst", "Plus récents", "Сначала новые"],
  ["Date oldest", "Más antiguos", "Älteste zuerst", "Plus anciens", "Сначала старые"],
  ["Delete", "Eliminar", "Löschen", "Supprimer", "Удалить"],
  ["Delete {category}?", "¿Eliminar {category}?", "{category} löschen?", "Supprimer {category} ?", "Удалить {category}?"],
  ["Delete {item}?", "¿Eliminar {item}?", "{item} löschen?", "Supprimer {item} ?", "Удалить {item}?"],
  ["Delete all", "Eliminar todo", "Alles löschen", "Tout supprimer", "Удалить всё"],
  ["Decide", "Decidir", "Entscheiden", "Décider", "Решить"],
  ["Decision actions", "Acciones de decisión", "Entscheidungsaktionen", "Actions de décision", "Действия решения"],
  ["Drop to decide", "Suelta para decidir", "Zum Entscheiden ablegen", "Déposer pour décider", "Перетащите для решения"],
  ["Edit", "Editar", "Bearbeiten", "Modifier", "Изменить"],
  ["Edit item", "Editar artículo", "Artikel bearbeiten", "Modifier l’article", "Изменить товар"],
  ["Export", "Exportar", "Exportieren", "Exporter", "Экспорт"],
  ["Export JSON", "Exportar JSON", "JSON exportieren", "Exporter JSON", "Экспорт JSON"],
  ["Export backup", "Exportar copia", "Sicherung exportieren", "Exporter la sauvegarde", "Экспорт бэкапа"],
  ["Export to Excel", "Exportar a Excel", "Nach Excel exportieren", "Exporter vers Excel", "Экспорт в Excel"],
  ["Export Tuckio JSON", "Exportar JSON de Tuckio", "Tuckio JSON exportieren", "Exporter le JSON Tuckio", "Экспортировать JSON Tuckio"],
  ["Filter", "Filtro", "Filter", "Filtre", "Фильтр"],
  ["Filter ({count})", "Filtro ({count})", "Filter ({count})", "Filtre ({count})", "Фильтр ({count})"],
  ["Founder", "Fundador", "Gründer", "Fondateur", "Основатель"],
  ["Founder contact links", "Enlaces de contacto del fundador", "Kontaktlinks des Gründers", "Liens de contact du fondateur", "Контакты основателя"],
  ["Founder contacts", "Contactos del fundador", "Kontakte des Gründers", "Contacts du fondateur", "Контакты основателя"],
  ["Hover hints", "Pistas al pasar", "Hover-Hinweise", "Indices au survol", "Подсказки при наведении"],
  ["Hover hints off", "Pistas al pasar desactivadas", "Hover-Hinweise aus", "Indices au survol désactivés", "Подсказки при наведении выключены"],
  ["Hover hints on", "Pistas al pasar activadas", "Hover-Hinweise an", "Indices au survol activés", "Подсказки при наведении включены"],
  ["Image URL", "URL de imagen", "Bild-URL", "URL de l’image", "URL изображения"],
  ["Import", "Importar", "Importieren", "Importer", "Импорт"],
  ["Import JSON", "Importar JSON", "JSON importieren", "Importer JSON", "Импорт JSON"],
  ["Import backup", "Importar copia", "Sicherung importieren", "Importer la sauvegarde", "Импорт бэкапа"],
  ["Import Tuckio JSON", "Importar JSON de Tuckio", "Tuckio JSON importieren", "Importer le JSON Tuckio", "Импортировать JSON Tuckio"],
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
  ["No active products", "No hay productos activos", "Keine aktiven Produkte", "Aucun produit actif", "Нет активных товаров"],
  ["No archived items", "No hay artículos archivados", "Keine archivierten Artikel", "Aucun article archivé", "В архиве пусто"],
  ["No items here", "No hay artículos aquí", "Keine Artikel hier", "Aucun article ici", "Здесь пусто"],
  ["No matches", "Sin resultados", "Keine Treffer", "Aucun résultat", "Ничего не найдено"],
  ["Not found", "No encontrado", "Nicht gefunden", "Introuvable", "Не найдено"],
  ["Oops, image missing", "Falta la imagen", "Bild fehlt", "Image manquante", "Изображение не найдено"],
  ["Open Tuckio", "Abrir Tuckio", "Tuckio öffnen", "Ouvrir Tuckio", "Открыть Tuckio"],
  ["Open Tuckio panel", "Abrir panel de Tuckio", "Tuckio-Panel öffnen", "Ouvrir le panneau Tuckio", "Открыть панель Tuckio"],
  ["Open {item}", "Abrir {item}", "{item} öffnen", "Ouvrir {item}", "Открыть {item}"],
  ["Outerwear", "Abrigos", "Outerwear", "Manteaux", "Верхняя одежда"],
  ["Pause auto-close", "Pausar cierre automático", "Automatisches Schließen pausieren", "Suspendre la fermeture automatique", "Приостановить автозакрытие"],
  ["Previous image{label}", "Imagen anterior{label}", "Vorheriges Bild{label}", "Image précédente{label}", "Предыдущее изображение{label}"],
  ["Price", "Precio", "Preis", "Prix", "Цена"],
  ["Price drops", "Bajadas de precio", "Preisrückgänge", "Baisses de prix", "Снижение цены"],
  ["Price high-low", "Precio de mayor a menor", "Preis absteigend", "Prix décroissant", "Цена по убыванию"],
  ["Price low-high", "Precio de menor a mayor", "Preis aufsteigend", "Prix croissant", "Цена по возрастанию"],
  ["Price updated · {checked}", "Precio actualizado · {checked}", "Preis aktualisiert · {checked}", "Prix mis à jour · {checked}", "Цена обновлена · {checked}"],
  ["Products saved to {category} will appear here.", "Los productos guardados en {category} aparecerán aquí.", "In {category} gespeicherte Produkte erscheinen hier.", "Les produits enregistrés dans {category} apparaîtront ici.", "Товары из категории {category} появятся здесь."],
  ["Remove current image{label}", "Eliminar imagen actual{label}", "Aktuelles Bild entfernen{label}", "Supprimer l’image actuelle{label}", "Удалить текущее изображение{label}"],
  ["Remove from shortlist", "Quitar de favoritos", "Aus Auswahlliste entfernen", "Retirer de la sélection", "Убрать из шортлиста"],
  ["Remove image", "Eliminar imagen", "Bild entfernen", "Supprimer l’image", "Удалить изображение"],
  ["Remove {category}", "Eliminar {category}", "{category} entfernen", "Supprimer {category}", "Удалить {category}"],
  ["Reset", "Restablecer", "Zurücksetzen", "Réinitialiser", "Сбросить"],
  ["Reset Tuckio", "Restablecer Tuckio", "Tuckio zurücksetzen", "Réinitialiser Tuckio", "Сбросить Tuckio"],
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
  ["Showing archive", "Mostrando archivo", "Archiv wird angezeigt", "Archive affichée", "Показан архив"],
  ["Showing shortlist", "Mostrando favoritos", "Auswahlliste wird angezeigt", "Sélection affichée", "Показан шортлист"],
  ["Shortlist: priority picks", "Favoritos: selección prioritaria", "Auswahlliste: Prioritäten", "Sélection : priorités", "Шортлист: приоритетные товары"],
  ["Shortlisted items: {count}", "Favoritos: {count}", "Auswahlliste: {count}", "Sélection : {count}", "В шортлисте: {count}"],
  ["Skipped", "Descartado", "Übersprungen", "Écarté", "Пропущено"],
  ["Sort", "Ordenar", "Sortieren", "Trier", "Сортировка"],
  ["Sort: {label}", "Ordenar: {label}", "Sortierung: {label}", "Tri : {label}", "Сортировка: {label}"],
  ["Sort saved items: {label}", "Ordenar artículos guardados: {label}", "Gespeicherte Artikel sortieren: {label}", "Trier les articles enregistrés : {label}", "Сортировать сохранённые товары: {label}"],
  ["Switch to card view", "Cambiar a vista de tarjetas", "Zur Kartenansicht wechseln", "Passer en vue cartes", "Переключить на карточки"],
  ["Switch to list view", "Cambiar a vista de lista", "Zur Listenansicht wechseln", "Passer en vue liste", "Переключить на список"],
  ["Tuckio categories", "Categorías de Tuckio", "Tuckio-Kategorien", "Catégories Tuckio", "Категории Tuckio"],
  ["Tuckio was reloaded. Refresh this page and try again.", "Tuckio se recargó. Actualiza esta página e inténtalo de nuevo.", "Tuckio wurde neu geladen. Aktualisiere diese Seite und versuche es erneut.", "Tuckio a été rechargé. Actualise cette page et réessaie.", "Tuckio был перезагружен. Обновите страницу и попробуйте снова."],
  ["This removes it from Tuckio.", "Esto lo elimina de Tuckio.", "Dadurch wird es aus Tuckio entfernt.", "Cela le supprime de Tuckio.", "Товар будет удалён из Tuckio."],
  ["Tops", "Partes superiores", "Oberteile", "Hauts", "Верх"],
  ["Type delete to confirm.", "Escribe delete para confirmar.", "Gib delete ein, um zu bestätigen.", "Saisis delete pour confirmer.", "Введите delete для подтверждения."],
  ["Try a product page or product card.", "Prueba una página o tarjeta de producto.", "Probiere eine Produktseite oder Produktkarte.", "Essaie une page produit ou une carte produit.", "Попробуйте страницу товара или карточку товара."],
  ["Try another name, category, or source.", "Prueba otro nombre, categoría o fuente.", "Versuche einen anderen Namen, eine andere Kategorie oder Quelle.", "Essaie un autre nom, une autre catégorie ou une autre source.", "Попробуйте другое название, категорию или источник."],
  ["Undo", "Deshacer", "Rückgängig", "Annuler", "Отменить"],
  ["Undo save", "Deshacer guardado", "Speichern rückgängig machen", "Annuler l’enregistrement", "Отменить сохранение"],
  ["Unexpected Tuckio storage key.", "Clave de almacenamiento de Tuckio inesperada.", "Unerwarteter Tuckio-Speicherschlüssel.", "Clé de stockage Tuckio inattendue.", "Неожиданный ключ хранилища Tuckio."],
  ["updated", "actualizado", "aktualisiert", "mis à jour", "обновлено"],
  ["Use + or right-click a product page.", "Usa + o haz clic derecho en una página de producto.", "Nutze + oder klicke mit der rechten Maustaste auf eine Produktseite.", "Utilise + ou fais un clic droit sur une page produit.", "Используйте + или кликните правой кнопкой по странице товара."],
  ["Use the plus button or right-click a product card, image, link, or product page and choose Save to Tuckio.", "Usa el botón más o haz clic derecho en una tarjeta, imagen, enlace o página de producto y elige Save to Tuckio.", "Nutze die Plus-Schaltfläche oder klicke mit der rechten Maustaste auf Produktkarte, Bild, Link oder Produktseite und wähle Save to Tuckio.", "Utilise le bouton plus ou fais un clic droit sur une carte, image, lien ou page produit, puis choisis Save to Tuckio.", "Используйте кнопку плюса или кликните правой кнопкой по карточке, изображению, ссылке или странице товара и выберите Save to Tuckio."],
  ["View archive", "Ver archivo", "Archiv ansehen", "Voir l’archive", "Открыть архив"],
  [" for {item}", " de {item}", " für {item}", " pour {item}", " для {item}"],
  [" from {item}", " de {item}", " von {item}", " de {item}", " у {item}"],
  ["{action} {item}", "{action} {item}", "{action} {item}", "{action} {item}", "{action} {item}"],
  ["{count} {brandNoun}. Close brands", "{count} {brandNoun}. Cerrar marcas", "{count} {brandNoun}. Marken schließen", "{count} {brandNoun}. Fermer les marques", "{count} {brandNoun}. Закрыть бренды"],
  ["{count} {brandNoun}. Show brands", "{count} {brandNoun}. Mostrar marcas", "{count} {brandNoun}. Marken anzeigen", "{count} {brandNoun}. Afficher les marques", "{count} {brandNoun}. Показать бренды"],
  ["{count} {itemNoun} in archive.", "{count} {itemNoun} en archivo.", "{count} {itemNoun} im Archiv.", "{count} {itemNoun} dans l’archive.", "{count} {itemNoun} в архиве."],
  ["{item} product image", "Imagen de producto de {item}", "Produktbild von {item}", "Image produit de {item}", "Изображение товара {item}"],
  ["{label}. Close category filter menu", "{label}. Cerrar menú de categorías", "{label}. Kategoriemenü schließen", "{label}. Fermer le menu des catégories", "{label}. Закрыть меню категорий"],
  ["{label}. Open category filter menu", "{label}. Abrir menú de categorías", "{label}. Kategoriemenü öffnen", "{label}. Ouvrir le menu des catégories", "{label}. Открыть меню категорий"],
  ["{label} saved", "{label} guardados", "{label} gespeichert", "{label} enregistrés", "{label} сохранено"],
  ["{arrow} {delta} since last check · {checked}", "{arrow} {delta} desde la última comprobación · {checked}", "{arrow} {delta} seit letzter Prüfung · {checked}", "{arrow} {delta} depuis la dernière vérification · {checked}", "{arrow} {delta} с последней проверки · {checked}"],
  ["0 items from {brand}", "0 artículos de {brand}", "0 Artikel von {brand}", "0 article de {brand}", "0 товаров от {brand}"],
  ["0 items in {category}", "0 artículos en {category}", "0 Artikel in {category}", "0 article dans {category}", "0 товаров в {category}"],
  ["Accessories", "Accesorios", "Accessoires", "Accessoires", "Аксессуары"],
  ["Showing {label} items", "Mostrando {label}", "{label} angezeigt", "{label} affichés", "Показано: {label}"],
  ["this brand", "esta marca", "dieser Marke", "cette marque", "этого бренда"],
  ["this category", "esta categoría", "diese Kategorie", "cette catégorie", "эта категория"],
  ["of", "de", "von", "sur", "из"]
];
var TUCKIO_I18N_MESSAGES = {};
TUCKIO_I18N_LANGUAGE_IDS.forEach((language, index) => {
  TUCKIO_I18N_MESSAGES[language] = Object.fromEntries(
    TUCKIO_I18N_MESSAGE_ROWS.map(([key, ...values]) => [key, values[index]])
  );
});

function t(key, replacements = {}) {
  const messages = TUCKIO_I18N_MESSAGES[panelCurrentLanguage()] || {};
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
        <span id="wp-language-current" class="wp-language-current">${escapeHtml(currentOption?.label || currentLanguage)}</span>
        <span class="wp-language-flag" aria-hidden="true">${escapeHtml(currentOption?.flag || "")}</span>
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
