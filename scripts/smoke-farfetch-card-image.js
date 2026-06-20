const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const sandbox = {
  URL,
  console,
  window: { innerWidth: 1440, innerHeight: 900 },
  document: {
    querySelectorAll: () => [],
    title: "New in: handpicked daily from the world's best brands and boutiques"
  },
  location: new URL("https://www.farfetch.com/fi/shopping/men/new-in-today-2/items.aspx")
};

vm.createContext(sandbox);

[
  "extension/content/constants.js",
  "extension/content/utils.js",
  "extension/content/media.js",
  "extension/content/text.js",
  "extension/content/storage-settings.js",
  "extension/content/pricing/dom.js",
  "extension/content/pricing/rates.js",
  "extension/content/pricing/noise.js",
  "extension/content/pricing/parse.js",
  "extension/content/extractors/embedded.js",
  "extension/content/extractors/main.js",
  "extension/content/extractors/context.js",
  "extension/content/extractors/jsonld.js",
  "extension/content/extractors/rendezvous.js",
  "extension/content/extractors/verify.js",
  "extension/content/extractors/quality.js",
  "extension/content/extractors/enrich.js"
].forEach((file) => {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), sandbox, {
    filename: file
  });
});

const beltUrl =
  "https://www.farfetch.com/fi/shopping/men/casablanca-logo-buckle-leather-belt-item-36693002.aspx";
const scarfUrl =
  "https://www.farfetch.com/fi/shopping/men/jacquemus-the-supporter-silk-scarf-item-36899995.aspx";
const amiSneakerUrl =
  "https://www.farfetch.com/fi/shopping/men/ami-paris-mesh-mirage-sneakers-item-36070665.aspx";
const cardImage =
  "https://cdn-images.farfetch-contents.com/36/69/30/02/36693002_69023268_1000.jpg";
const pageImage =
  "https://cdn-images.farfetch-contents.com/36/69/30/02/36693002_69027192_1000.jpg";
const scarfImage =
  "https://cdn-images.farfetch-contents.com/36/89/99/95/36899995_69000000_1000.jpg";
const farfetchFavicon = "https://www.farfetch.com/favicon.ico";
const scarfCardLines = ["Exclusive", "Jacquemus", "The Supporter silk scarf", "184 €"];
const amiSneakerCardLines = ["Runway", "AMI Paris", "mesh mirage sneakers", "350 €"];

assert.equal(
  sandbox.isProductLikeUrl(beltUrl),
  true,
  "Farfetch item links should be treated as product URLs"
);
assert.equal(
  sandbox.isProductLikeUrl("https://www.farfetch.com/fi/shopping/men/new-in-today-2/items.aspx"),
  false,
  "Farfetch listing pages should not be treated as product URLs"
);
assert.equal(
  sandbox.findLikelyBrand(scarfCardLines, "", ""),
  "Jacquemus",
  "Farfetch status labels should not be treated as card brands"
);
assert.equal(
  sandbox.findLikelyTitle(scarfCardLines, "", "", "Jacquemus"),
  "The Supporter silk scarf",
  "Farfetch scarf titles should not collapse to the brand line"
);
assert.equal(
  sandbox.findLikelyBrand(amiSneakerCardLines, "", ""),
  "AMI Paris",
  "Farfetch Runway labels should not be treated as card brands"
);
assert.equal(
  sandbox.findLikelyTitle(amiSneakerCardLines, "", "", "AMI Paris"),
  "mesh mirage sneakers",
  "Farfetch sneaker titles should not collapse to the brand line"
);

sandbox.findJsonLdProduct = () => ({
  title: "Jersey T-Shirt With Logo",
  brand: "Acne Studios",
  url: "https://www.farfetch.com/fi/shopping/men/acne-studios-jersey-t-shirt-with-logo-item-30100001.aspx",
  priceText: "365 €",
  priceAmount: 365,
  currency: "EUR",
  imageUrl: "https://cdn.example/acne-shirt.jpg"
});
sandbox.extractFromMicrodata = () => ({});
sandbox.extractFromCommonSelectors = () => ({});
sandbox.extractFromMeta = () => ({});
sandbox.extractFromPagePrice = () => ({});
sandbox.extractFromEmbeddedJson = () => ({
  title: "New in: handpicked daily from the world's best brands and boutiques",
  brand: "Farfetch",
  url: beltUrl,
  priceText: "305 €",
  priceAmount: 305,
  currency: "EUR",
  imageUrl: pageImage
});
sandbox.extractFromContext = () => ({
  fromContext: true,
  title: "logo-buckle leather belt",
  brand: "Casablanca",
  url: beltUrl,
  priceText: "305 €",
  priceAmount: 305,
  currency: "EUR",
  imageUrl: cardImage
});

const extracted = sandbox.extractProduct({ linkUrl: beltUrl });
assert.equal(extracted.url, beltUrl);
assert.equal(extracted.title, "Logo-Buckle Leather Belt");
assert.equal(extracted.brand, "Casablanca");
assert.equal(extracted.priceAmount, 305);
assert.equal(extracted.imageUrl, cardImage);
assert.equal(
  sandbox.faviconUrlForSource(beltUrl, farfetchFavicon),
  farfetchFavicon
);

sandbox.extractFromEmbeddedJson = () => ({
  title: "Jacquemus The Supporter Silk Scarf | Neutrals | FARFETCH FI",
  brand: "Farfetch",
  url: scarfUrl,
  priceText: "184 €",
  priceAmount: 184,
  currency: "EUR",
  imageUrl: scarfImage
});
sandbox.extractFromContext = () => ({
  fromContext: true,
  title: sandbox.findLikelyTitle(
    scarfCardLines,
    "Jacquemus The Supporter silk scarf | Neutrals",
    "",
    "Jacquemus"
  ),
  brand: sandbox.findLikelyBrand(scarfCardLines, "", ""),
  url: scarfUrl,
  priceText: "184 €",
  priceAmount: 184,
  currency: "EUR",
  imageUrl: scarfImage
});

const scarfExtracted = sandbox.extractProduct({ linkUrl: scarfUrl });
assert.equal(scarfExtracted.url, scarfUrl);
assert.equal(scarfExtracted.title, "The Supporter Silk Scarf");
assert.equal(scarfExtracted.brand, "Jacquemus");
assert.equal(scarfExtracted.priceAmount, 184);
assert.equal(scarfExtracted.imageUrl, scarfImage);

sandbox.location = new URL("https://www.farfetch.com/fi/shopping/men/sale/all/items.aspx");
sandbox.document.title = "Men's Sale | FARFETCH FI";
sandbox.extractFromEmbeddedJson = () => ({
  title: "AMI Paris Mesh Mirage Sneakers | FARFETCH FI",
  brand: "Farfetch",
  url: amiSneakerUrl,
  priceText: "350 €",
  priceAmount: 350,
  currency: "EUR",
  imageUrl: "https://cdn-images.farfetch-contents.com/36/07/06/65/36070665_69000000_1000.jpg"
});
sandbox.extractFromContext = () => ({
  fromContext: true,
  title: sandbox.findLikelyTitle(amiSneakerCardLines, "", "", "AMI Paris"),
  brand: sandbox.findLikelyBrand(amiSneakerCardLines, "", ""),
  url: amiSneakerUrl,
  priceText: "350 €",
  priceAmount: 350,
  currency: "EUR",
  imageUrl: "https://cdn-images.farfetch-contents.com/36/07/06/65/36070665_69000000_1000.jpg"
});

const amiSneakerExtracted = sandbox.extractProduct({ linkUrl: amiSneakerUrl });
assert.equal(amiSneakerExtracted.url, amiSneakerUrl);
assert.equal(amiSneakerExtracted.title, "Mesh Mirage Sneakers");
assert.equal(amiSneakerExtracted.brand, "AMI Paris");
assert.equal(amiSneakerExtracted.priceAmount, 350);

sandbox.location = new URL(scarfUrl);
sandbox.document.title = "Jacquemus The Supporter Silk Scarf | Neutrals | FARFETCH FI";
sandbox.findJsonLdProduct = () => ({
  title: "Jacquemus The Supporter Silk Scarf | Neutrals | FARFETCH FI",
  brand: "Farfetch",
  url: scarfUrl,
  priceText: "184 €",
  priceAmount: 184,
  currency: "EUR",
  imageUrl: scarfImage
});
sandbox.extractFromCommonSelectors = () => ({
  title: "The Supporter silk scarf",
  brand: "Jacquemus",
  url: scarfUrl,
  priceText: "184 €",
  priceAmount: 184,
  currency: "EUR",
  imageUrl: scarfImage
});
sandbox.extractFromEmbeddedJson = () => ({});
sandbox.extractFromContext = () => ({});

const scarfPageExtracted = sandbox.extractProduct({});
assert.equal(scarfPageExtracted.title, "The Supporter Silk Scarf");
assert.equal(scarfPageExtracted.brand, "Jacquemus");

runAsyncSmoke().then(() => {
  console.log("farfetch card image smoke passed");
}).catch((error) => {
  console.error(error);
  process.exit(1);
});

async function runAsyncSmoke() {
  const fetchedScarfImage =
    "https://cdn-images.farfetch-contents.com/36/89/99/95/36899995_69000111_1000.jpg";
  const fetchedScarfDoc = {
    title: "Jacquemus The Supporter Silk Scarf | Neutrals | FARFETCH FI",
    body: { textContent: "Jacquemus The Supporter Silk Scarf 184 €" },
    querySelectorAll: (selector) =>
      selector.includes("application/ld+json")
        ? [{
            textContent: JSON.stringify({
              "@type": "Product",
              name: "Jacquemus The Supporter Silk Scarf | Neutrals",
              brand: { name: "Jacquemus" },
              url: scarfUrl,
              image: fetchedScarfImage,
              offers: { url: scarfUrl, price: 184, priceCurrency: "EUR" }
            })
          }]
        : [],
    querySelector: () => null
  };

  sandbox.fetch = async () => ({
    ok: true,
    text: async () => "<html></html>",
    json: async () => ({})
  });
  sandbox.DOMParser = class {
    parseFromString() {
      return fetchedScarfDoc;
    }
  };

  const sourceBrandProduct = {
    fromContext: true,
    title: "The Supporter Silk Scarf",
    brand: "Farfetch",
    url: scarfUrl,
    priceText: "184 €",
    priceAmount: 184,
    currency: "EUR",
    imageUrl: scarfImage
  };
  assert.equal(
    sandbox.needsProductPageDoubleCheck(sourceBrandProduct),
    true,
    "Marketplace cards with source brand should be double-checked"
  );

  const enriched = await sandbox.enrichProduct(sourceBrandProduct);
  assert.equal(enriched.title, "The Supporter Silk Scarf");
  assert.equal(enriched.brand, "Jacquemus");
  assert.equal(enriched.priceAmount, 184);
  assert.equal(enriched.imageUrl, fetchedScarfImage);
  assert.equal(enriched.extraction.fields.brand.value, "Jacquemus");
  assert.equal(enriched.extraction.fields.brand.needsReview, false);
  assert.ok(
    enriched.extraction.fields.brand.alternatives.some((candidate) => candidate.value === "Farfetch"),
    "Rejected source brand should remain available as an alternative"
  );
}
