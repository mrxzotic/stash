function bindPanelExcelExportEvents(root) {
  root.querySelector("[data-export-xlsx]")?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    closePanelOverflowMenu(root);
    if (panelHasExportableItems()) {
      safelyRunPanelAction(exportTuckioExcel);
    }
  });
}

function exportTuckioExcel() {
  const exportedAt = new Date().toISOString();
  const bytes = buildTuckioExcelWorkbook(panelState.items, {
    exportedAt,
    summaryCurrency: panelState.summaryCurrency
  });
  if (!bytes) {
    return;
  }

  const blob = new Blob([bytes], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `tuckio-wishlist-${exportedAt.slice(0, 10)}.xlsx`;
  link.rel = "noreferrer";
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function buildTuckioExcelWorkbook(items, options = {}) {
  const summaryCurrency = excelSummaryCurrency(options.summaryCurrency);
  const normalized = (Array.isArray(items) ? items : []).map(normalizePanelItem);
  const sheets = [
    { name: "Wishlist", items: normalized.filter((item) => !isPanelItemArchived(item)) },
    { name: "Archive", items: normalized.filter(isPanelItemArchived) }
  ].filter((sheet) => sheet.items.length);
  if (!sheets.length) {
    return null;
  }

  const worksheetFiles = sheets.flatMap((sheet, index) => {
    const sheetId = index + 1;
    const model = buildTuckioExcelSheet(sheet.items, summaryCurrency);
    return [
      { path: `xl/worksheets/sheet${sheetId}.xml`, data: renderTuckioExcelWorksheet(model) },
      { path: `xl/worksheets/_rels/sheet${sheetId}.xml.rels`, data: renderTuckioExcelSheetRels(model.links) }
    ];
  });

  return zipStore([
    { path: "[Content_Types].xml", data: renderTuckioExcelContentTypes(sheets.length) },
    { path: "_rels/.rels", data: renderTuckioExcelRootRels() },
    { path: "xl/workbook.xml", data: renderTuckioExcelWorkbookXml(sheets) },
    { path: "xl/_rels/workbook.xml.rels", data: renderTuckioExcelWorkbookRels(sheets.length) },
    { path: "xl/styles.xml", data: renderTuckioExcelStyles() },
    ...worksheetFiles
  ]);
}

function buildTuckioExcelSheet(items, summaryCurrency) {
  const rows = [
    ["#", "Brand", "Product Link", "Link", `Price (${summaryCurrency})`, "Price (Original)"]
  ];
  const links = [];

  items.forEach((item, index) => {
    const rowNumber = index + 2;
    const price = item.price || {};
    const converted = excelConvertedPrice(price, summaryCurrency);
    rows.push([
      index + 1,
      item.brand,
      item.url ? { text: item.title, href: item.url } : item.title,
      item.url ? { text: item.url, href: item.url } : "",
      Number.isFinite(converted) ? roundExcelPrice(converted) : "",
      excelOriginalPrice(price)
    ]);
    if (item.url) {
      links.push(
        { ref: `C${rowNumber}`, href: item.url },
        { ref: `D${rowNumber}`, href: item.url }
      );
    }
  });

  return { rows, links };
}

function excelConvertedPrice(price, summaryCurrency) {
  const nativeCurrency = cleanText(price.currency).toUpperCase();
  const amount = numericPrice(price.amount);
  if (nativeCurrency === summaryCurrency && Number.isFinite(amount)) {
    return amount;
  }

  return convertRubToDisplayAmount(numericPrice(price.rubAmount), summaryCurrency);
}

function excelOriginalPrice(price) {
  return formatOriginalPrice(price.amount, price.currency) || cleanText(price.originalText);
}

function excelSummaryCurrency(value) {
  const currency = cleanText(value).toUpperCase();
  return isSummaryCurrency(currency) ? currency : DEFAULT_SETTINGS.summaryCurrency;
}

function roundExcelPrice(value) {
  return Math.round(value);
}

function renderTuckioExcelWorksheet(model) {
  const lastRow = model.rows.length;
  const sheetData = model.rows.map((row, rowIndex) => {
    const rowNumber = rowIndex + 1;
    const cells = row.map((value, columnIndex) =>
      renderTuckioExcelCell(value, columnIndex, rowNumber, rowIndex === 0)
    ).join("");
    return `<row r="${rowNumber}">${cells}</row>`;
  }).join("");
  const hyperlinks = model.links.length
    ? `<hyperlinks>${model.links.map((link, index) => `<hyperlink ref="${link.ref}" r:id="rId${index + 1}"/>`).join("")}</hyperlinks>`
    : "";

  return xmlHeader(`\
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <dimension ref="A1:F${lastRow}"/>
  <sheetViews><sheetView workbookViewId="0"/></sheetViews>
  <sheetFormatPr defaultRowHeight="18"/>
  <cols><col min="1" max="1" width="6" customWidth="1"/><col min="2" max="2" width="22" customWidth="1"/><col min="3" max="3" width="44" customWidth="1"/><col min="4" max="4" width="16" customWidth="1"/><col min="5" max="5" width="18" customWidth="1"/><col min="6" max="6" width="22" customWidth="1"/></cols>
  <sheetData>${sheetData}</sheetData>
  ${hyperlinks}
  <pageMargins left="0.7" right="0.7" top="0.75" bottom="0.75" header="0.3" footer="0.3"/>
</worksheet>`);
}

function renderTuckioExcelCell(value, columnIndex, rowNumber, isHeader) {
  const ref = `${excelColumnName(columnIndex + 1)}${rowNumber}`;
  if (isHeader) {
    return excelInlineStringCell(ref, value, 1);
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return `<c r="${ref}" s="2"><v>${value}</v></c>`;
  }
  if (value && typeof value === "object" && value.href) {
    return excelInlineStringCell(ref, value.text, 3);
  }
  return excelInlineStringCell(ref, value, columnIndex === 5 ? 4 : 0);
}

function excelInlineStringCell(ref, value, style) {
  return `<c r="${ref}" t="inlineStr"${style ? ` s="${style}"` : ""}><is><t>${escapeExcelXml(value)}</t></is></c>`;
}

function renderTuckioExcelSheetRels(links) {
  return xmlHeader(`<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${links.map((link, index) =>
    `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="${escapeExcelXmlAttribute(link.href)}" TargetMode="External"/>`
  ).join("")}</Relationships>`);
}

function renderTuckioExcelContentTypes(sheetCount) {
  const sheets = Array.from({ length: sheetCount }, (_, index) =>
    `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`
  ).join("");
  return xmlHeader(`<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${sheets}</Types>`);
}

function renderTuckioExcelRootRels() {
  return xmlHeader('<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>');
}

function renderTuckioExcelWorkbookXml(sheets) {
  return xmlHeader(`<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sheets.map((sheet, index) =>
    `<sheet name="${escapeExcelXmlAttribute(sheet.name)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`
  ).join("")}</sheets></workbook>`);
}

function renderTuckioExcelWorkbookRels(sheetCount) {
  const sheets = Array.from({ length: sheetCount }, (_, index) =>
    `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`
  ).join("");
  return xmlHeader(`<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets}<Relationship Id="rId${sheetCount + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`);
}

function renderTuckioExcelStyles() {
  return xmlHeader('<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="1"><numFmt numFmtId="164" formatCode="#,##0"/></numFmts><fonts count="3"><font><sz val="11"/><name val="Inter"/></font><font><b/><sz val="11"/><name val="Inter"/></font><font><u/><color rgb="FF0A84FF"/><sz val="11"/><name val="Inter"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFF2F4F7"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="5"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/><xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1" applyAlignment="1"><alignment horizontal="right"/></xf><xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"/><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment horizontal="right"/></xf></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>');
}

function xmlHeader(body) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>${body}`;
}

function excelColumnName(number) {
  let name = "";
  let value = number;
  while (value > 0) {
    value -= 1;
    name = String.fromCharCode(65 + (value % 26)) + name;
    value = Math.floor(value / 26);
  }
  return name;
}

function escapeExcelXml(value) {
  return String(value ?? "").replace(/[&<>]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;"
  })[character]);
}

function escapeExcelXmlAttribute(value) {
  return escapeExcelXml(value).replace(/"/g, "&quot;");
}

function zipStore(files) {
  const encoder = new TextEncoder();
  const prepared = files.map((file) => ({
    path: file.path,
    name: encoder.encode(file.path),
    data: typeof file.data === "string" ? encoder.encode(file.data) : file.data
  }));
  const records = [];
  const central = [];
  let offset = 0;

  prepared.forEach((file) => {
    const crc = crc32(file.data);
    const local = zipLocalHeader(file, crc);
    records.push(local, file.data);
    central.push(zipCentralHeader(file, crc, offset));
    offset += local.length + file.data.length;
  });

  const centralSize = central.reduce((sum, part) => sum + part.length, 0);
  return concatUint8Arrays([...records, ...central, zipEndCentralDirectory(prepared.length, centralSize, offset)]);
}

function zipLocalHeader(file, crc) {
  const header = new Uint8Array(30 + file.name.length);
  const view = new DataView(header.buffer);
  view.setUint32(0, 0x04034b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(10, 0, true);
  view.setUint32(14, crc, true);
  view.setUint32(18, file.data.length, true);
  view.setUint32(22, file.data.length, true);
  view.setUint16(26, file.name.length, true);
  header.set(file.name, 30);
  return header;
}

function zipCentralHeader(file, crc, offset) {
  const header = new Uint8Array(46 + file.name.length);
  const view = new DataView(header.buffer);
  view.setUint32(0, 0x02014b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 20, true);
  view.setUint32(16, crc, true);
  view.setUint32(20, file.data.length, true);
  view.setUint32(24, file.data.length, true);
  view.setUint16(28, file.name.length, true);
  view.setUint32(42, offset, true);
  header.set(file.name, 46);
  return header;
}

function zipEndCentralDirectory(count, size, offset) {
  const header = new Uint8Array(22);
  const view = new DataView(header.buffer);
  view.setUint32(0, 0x06054b50, true);
  view.setUint16(8, count, true);
  view.setUint16(10, count, true);
  view.setUint32(12, size, true);
  view.setUint32(16, offset, true);
  return header;
}

function concatUint8Arrays(parts) {
  const output = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let offset = 0;
  parts.forEach((part) => {
    output.set(part, offset);
    offset += part.length;
  });
  return output;
}

function crc32(bytes) {
  let crc = 0xffffffff;
  for (let index = 0; index < bytes.length; index += 1) {
    crc = CRC32_TABLE[(crc ^ bytes[index]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

var CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[index] = value >>> 0;
  }
  return table;
})();
