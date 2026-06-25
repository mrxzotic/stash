const REGRESSION_BANK_CASES = [
  {
    id: "nike-pdp-jsonld-price",
    shop: "Nike",
    owner: "scripts/smoke-nike-product.js",
    url: "https://www.nike.com/fi/t/kd19-purple-stuff-basketball-shoes-7MwO2HBu/IH1117-500",
    expected: {
      brand: "Nike",
      title: "Kd19 'Purple Stuff' Basketball Shoes",
      priceAmount: 159.99,
      currency: "EUR",
      imageNeedle: "static.nike.com"
    }
  },
  {
    id: "farfetch-listing-card-context",
    shop: "Farfetch",
    owner: "scripts/smoke-farfetch-card-image.js",
    url: "https://www.farfetch.com/fi/shopping/men/casablanca-logo-buckle-leather-belt-item-30000001.aspx",
    expected: {
      brand: "Casablanca",
      title: "Logo-Buckle Leather Belt",
      priceAmount: 305,
      currency: "EUR",
      imageNeedle: "farfetch"
    }
  },
  {
    id: "lime-ru-sale-brand-alias",
    shop: "LIME",
    owner: "scripts/smoke-lime-brand.js",
    url: "https://limestore.com/ru_ru/product/32596_6103_336-sostarennyi_sinii",
    expected: {
      brand: "LIME",
      title: "Прямые Джинсы Со Средней Посадкой",
      priceAmount: 3999,
      currency: "RUB",
      imageNeedle: "limestore.com"
    }
  },
  {
    id: "p448-pdp-visible-price",
    shop: "P448",
    owner: "scripts/smoke-p448-product.js",
    url: "https://p448.com/products/f25john11-w-960",
    expected: {
      brand: "P448",
      title: "John Nightfall",
      priceAmount: 249,
      currency: "EUR",
      imageNeedle: "p448.com"
    }
  },
  {
    id: "allsaints-sale-and-variant-image",
    shop: "AllSaints",
    owner: "scripts/smoke-allsaints-sale-price.js",
    url: "https://www.allsaints.com/eu/men/sale/petals-oversized-short-sleeve-graphic-t-shirt/M062PE-4068.html",
    expected: {
      brand: "AllSaints",
      title: "Petals Oversized Short Sleeve Graphic T-Shirt",
      priceAmount: 50,
      currency: "EUR",
      imageNeedle: "allsaints.com"
    }
  },
  {
    id: "krakatau-selected-shopify-variant",
    shop: "KRAKATAU",
    owner: "scripts/smoke-krakatau-product.js",
    url: "https://ru.krakatauwear.com/products/waterproof-jacket-qm567?color=%D0%BF%D0%B5%D0%BF%D0%B5%D0%BB%D1%8C%D0%BD%D0%BE-%D0%B1%D0%B5%D0%BB%D1%8B%D0%B9",
    expected: {
      brand: "KRAKATAU",
      title: "Водостойкая Куртка Sagittarius A Qm567",
      priceAmount: 23990,
      currency: "RUB",
      imageNeedle: "cdn.shopify.com"
    }
  },
  {
    id: "loewe-carousel-noise",
    shop: "Loewe",
    owner: "scripts/smoke-loewe-carousel.js",
    url: "https://www.loewe.com/eur/en/women/bags/bucket-bags/medium-bilbao-bucket-in-smooth-calfskin/AWRAWPRX01-5984.html",
    expected: {
      brand: "Loewe",
      title: "Medium Bilbao Bucket In Smooth Calfskin",
      priceAmount: 2700,
      currency: "EUR",
      imageNeedle: "loewe.com"
    }
  },
  {
    id: "mrporter-sale-card",
    shop: "MR PORTER",
    owner: "scripts/smoke-mrporter-sale-price.js",
    url: "https://www.mrporter.com/en-fi/mens/product/mr-p/clothing/short-sleeve-polo-shirts/organic-cotton-pique-polo-shirt/1647597359927196",
    expected: {
      brand: "MR P",
      title: "Organic Cotton-Piqué Polo Shirt",
      priceAmount: 64,
      currency: "EUR",
      imageNeedle: "mrporter.com"
    }
  },
  {
    id: "rimowa-localized-price",
    shop: "RIMOWA",
    owner: "scripts/smoke-rimowa-price.js",
    url: "https://www.rimowa.com/fi/en/luggage/colour/silver/check-in-m/92563004.html",
    expected: {
      brand: "RIMOWA",
      title: "Check-In M",
      priceAmount: 1360,
      currency: "EUR",
      imageNeedle: "rimowa.com"
    }
  },
  {
    id: "brandshop-installment-noise",
    shop: "Brandshop",
    owner: "scripts/smoke-brandshop-product.js",
    url: "https://brandshop.ru/goods/514405/chrm0001/",
    expected: {
      brand: "Chrome Hearts",
      title: "Мужская Толстовка Scroll Logo Thermal Zip-Up Hoodie",
      priceAmount: 189690,
      currency: "RUB",
      imageNeedle: "img.brandshop.ru"
    }
  }
];

module.exports = { REGRESSION_BANK_CASES };
