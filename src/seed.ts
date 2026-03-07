import "dotenv/config";
import { prisma } from "./config/database";

const categories = [
  { name: "Смартфоны", slug: "smartphones" },
  { name: "Ноутбуки", slug: "laptops" },
  { name: "Телевизоры", slug: "tvs" },
  { name: "Холодильники", slug: "fridges" },
  { name: "Стиральные машины", slug: "washers" },
  { name: "Планшеты", slug: "tablets" },
];

const products = [
  {
    name: "iPhone 15 Pro",
    description:
      "Флагманский смартфон Apple с чипом A17 Pro, корпусом из титана и профессиональной камерой.",
    price: 89990,
    oldPrice: 99990,
    category: "Смартфоны",
    inStock: true,
    rating: 4.9,
    reviewCount: 234,
  },
  {
    name: "Samsung Galaxy S24 Ultra",
    description:
      "Мощный Android-флагман с встроенным стилусом S Pen и камерой 200 МП.",
    price: 94990,
    category: "Смартфоны",
    inStock: true,
    rating: 4.8,
    reviewCount: 187,
  },
  {
    name: "MacBook Pro 14 M3",
    description:
      "Профессиональный ноутбук с чипом Apple M3, дисплеем Liquid Retina XDR и до 22 часов автономной работы.",
    price: 149990,
    oldPrice: 169990,
    category: "Ноутбуки",
    inStock: true,
    rating: 4.9,
    reviewCount: 156,
  },
  {
    name: "LG OLED55C3",
    description:
      'OLED-телевизор 55" с разрешением 4K, технологией Dolby Vision и Dolby Atmos.',
    price: 74990,
    category: "Телевизоры",
    inStock: true,
    rating: 4.7,
    reviewCount: 98,
  },
  {
    name: "Samsung Refrigerator RB38",
    description:
      "Двухкамерный холодильник с инвертерным компрессором, No Frost и объёмом 385 л.",
    price: 44990,
    oldPrice: 49990,
    category: "Холодильники",
    inStock: false,
    rating: 4.5,
    reviewCount: 67,
  },
  {
    name: "Bosch WAN28201",
    description:
      "Стиральная машина с фронтальной загрузкой, 8 кг, 1400 об/мин, класс A+++.",
    price: 34990,
    category: "Стиральные машины",
    inStock: true,
    rating: 4.6,
    reviewCount: 112,
  },
  {
    name: "iPad Pro 12.9 M2",
    description:
      "Профессиональный планшет с чипом M2, дисплеем Liquid Retina XDR и поддержкой Apple Pencil 2.",
    price: 109990,
    category: "Планшеты",
    inStock: true,
    rating: 4.8,
    reviewCount: 89,
  },
  {
    name: "Xiaomi 13 Pro",
    description:
      "Смартфон с камерой Leica, процессором Snapdragon 8 Gen 2 и зарядкой 120 Вт.",
    price: 59990,
    oldPrice: 69990,
    category: "Смартфоны",
    inStock: true,
    rating: 4.6,
    reviewCount: 145,
  },
  {
    name: "Asus ROG Zephyrus G14",
    description:
      "Игровой ноутбук с AMD Ryzen 9, GeForce RTX 4060 и дисплеем 144 Гц.",
    price: 99990,
    category: "Ноутбуки",
    inStock: true,
    rating: 4.7,
    reviewCount: 73,
  },
  {
    name: "Sony Bravia XR-55A80L",
    description:
      'OLED-телевизор 55" с процессором XR, Google TV и Acoustic Surface Audio+.',
    price: 84990,
    oldPrice: 94990,
    category: "Телевизоры",
    inStock: true,
    rating: 4.8,
    reviewCount: 56,
  },
  {
    name: "Gorenje NRK6202AXL4",
    description:
      "Холодильник French Door, 360 л, с функцией AdaptTech для точного контроля температуры.",
    price: 59990,
    category: "Холодильники",
    inStock: true,
    rating: 4.4,
    reviewCount: 34,
  },
  {
    name: "Samsung Galaxy Tab S9",
    description:
      'Android-планшет с AMOLED-экраном 11", процессором Snapdragon 8 Gen 2 и S Pen в комплекте.',
    price: 64990,
    oldPrice: 74990,
    category: "Планшеты",
    inStock: false,
    rating: 4.6,
    reviewCount: 78,
  },
];

const filterGroups = [
  {
    name: "Бренд",
    key: "brand",
    type: "checkbox",
    options: [
      { label: "Apple", value: "apple" },
      { label: "Samsung", value: "samsung" },
      { label: "LG", value: "lg" },
      { label: "Xiaomi", value: "xiaomi" },
      { label: "Bosch", value: "bosch" },
      { label: "Sony", value: "sony" },
      { label: "Asus", value: "asus" },
      { label: "Gorenje", value: "gorenje" },
    ],
  },
  {
    name: "Сортировка",
    key: "sortBy",
    type: "select",
    options: [
      { label: "По цене", value: "price" },
      { label: "По рейтингу", value: "rating" },
      { label: "По названию", value: "name" },
      { label: "По дате добавления", value: "createdAt" },
    ],
  },
];

async function seed() {
  console.log("Seeding database...");

  await prisma.filterOption.deleteMany();
  await prisma.filterGroup.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  for (const cat of categories) {
    await prisma.category.create({ data: cat });
  }
  console.log(`✓ ${categories.length} categories`);

  for (const product of products) {
    await prisma.product.create({ data: product });
  }
  console.log(`✓ ${products.length} products`);

  for (const group of filterGroups) {
    await prisma.filterGroup.create({
      data: {
        name: group.name,
        key: group.key,
        type: group.type,
        options: { create: group.options },
      },
    });
  }
  console.log(`✓ ${filterGroups.length} filter groups`);

  console.log("Seeding complete.");
}

seed()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
