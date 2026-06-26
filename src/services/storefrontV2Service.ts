import { doc, getDoc, getDocs, setDoc, collection } from "firebase/firestore";
import { db, hasFirebaseEnv } from "@/lib/firebase";
import {
  catalogCollections,
  defaultStoreContent,
  demoCategories,
  demoProducts,
  demoPromotions,
  StoreCategory,
  StoreProduct,
  StorePromotion,
  StorefrontContent,
} from "@/lib/storefront-v2";

export type StorefrontData = {
  products: StoreProduct[];
  categories: StoreCategory[];
  promotions: StorePromotion[];
  content: StorefrontContent;
  usingDemo: boolean;
};

type UnknownDoc = Record<string, unknown>;

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function asBoolean(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function asStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function normalizeProduct(id: string, data: UnknownDoc): StoreProduct {
  return {
    id,
    slug: asString(data.slug, id),
    name: asString(data.name),
    categoryId: asString(data.categoryId, "focus"),
    species: asString(data.species),
    format: asString(data.format),
    price: asNumber(data.price),
    compareAtPrice:
      data.compareAtPrice === undefined
        ? undefined
        : asNumber(data.compareAtPrice),
    stock: asNumber(data.stock),
    unit: asString(data.unit, "unidad"),
    image: asString(data.image, "/brand/products/ritual-kit-v2.webp"),
    shortDescription: asString(data.shortDescription),
    description: asString(data.description),
    badges: asStringArray(data.badges),
    benefits: asStringArray(data.benefits),
    ingredients: asStringArray(data.ingredients),
    ritualTip: asString(data.ritualTip),
    promotionId:
      data.promotionId === undefined ? undefined : asString(data.promotionId),
    featured: asBoolean(data.featured),
    status:
      data.status === "draft" || data.status === "archived"
        ? data.status
        : "active",
    createdAt:
      data.createdAt === undefined ? undefined : asNumber(data.createdAt),
    updatedAt:
      data.updatedAt === undefined ? undefined : asNumber(data.updatedAt),
  };
}

function normalizeCategory(id: string, data: UnknownDoc): StoreCategory {
  return {
    id,
    name: asString(data.name, id),
    description: asString(data.description),
    image: asString(data.image, "/brand/hero-apothecary-v2.webp"),
    featured: asBoolean(data.featured),
    order: asNumber(data.order),
  };
}

function normalizePromotion(id: string, data: UnknownDoc): StorePromotion {
  return {
    id,
    title: asString(data.title, id),
    subtitle: asString(data.subtitle),
    code: asString(data.code),
    discountLabel: asString(data.discountLabel),
    productIds: asStringArray(data.productIds),
    status:
      data.status === "scheduled" || data.status === "paused"
        ? data.status
        : "active",
    startsAt: data.startsAt === undefined ? undefined : asString(data.startsAt),
    endsAt: data.endsAt === undefined ? undefined : asString(data.endsAt),
  };
}

function normalizeContent(data: UnknownDoc): StorefrontContent {
  return {
    ...defaultStoreContent,
    announcement: asString(data.announcement, defaultStoreContent.announcement),
    heroEyebrow: asString(data.heroEyebrow, defaultStoreContent.heroEyebrow),
    heroTitle: asString(data.heroTitle, defaultStoreContent.heroTitle),
    heroSubtitle: asString(data.heroSubtitle, defaultStoreContent.heroSubtitle),
    heroImage: asString(data.heroImage, defaultStoreContent.heroImage),
    primaryCta: asString(data.primaryCta, defaultStoreContent.primaryCta),
    secondaryCta: asString(data.secondaryCta, defaultStoreContent.secondaryCta),
    trustLine: asString(data.trustLine, defaultStoreContent.trustLine),
    whatsappNumber: asString(
      data.whatsappNumber,
      defaultStoreContent.whatsappNumber
    ),
    whatsappMessage: asString(
      data.whatsappMessage,
      defaultStoreContent.whatsappMessage
    ),
    footerNote: asString(data.footerNote, defaultStoreContent.footerNote),
  };
}

export async function fetchStorefrontV2(): Promise<StorefrontData> {
  if (!hasFirebaseEnv) {
    return {
      products: demoProducts,
      categories: demoCategories,
      promotions: demoPromotions,
      content: defaultStoreContent,
      usingDemo: true,
    };
  }

  try {
    const [productSnap, categorySnap, promotionSnap, contentSnap] =
      await Promise.all([
        getDocs(collection(db, catalogCollections.products)),
        getDocs(collection(db, catalogCollections.categories)),
        getDocs(collection(db, catalogCollections.promotions)),
        getDoc(doc(db, catalogCollections.content, "main")),
      ]);

    const products = productSnap.docs
      .map((item) => normalizeProduct(item.id, item.data()))
      .sort((a, b) => Number(b.featured) - Number(a.featured));
    const categories = categorySnap.docs
      .map((item) => normalizeCategory(item.id, item.data()))
      .sort((a, b) => a.order - b.order);
    const promotions = promotionSnap.docs.map((item) =>
      normalizePromotion(item.id, item.data())
    );
    const content = contentSnap.exists()
      ? normalizeContent(contentSnap.data())
      : defaultStoreContent;

    if (!products.length || !categories.length) {
      return {
        products: demoProducts,
        categories: demoCategories,
        promotions: demoPromotions,
        content,
        usingDemo: true,
      };
    }

    return {
      products,
      categories,
      promotions: promotions.length ? promotions : demoPromotions,
      content,
      usingDemo: false,
    };
  } catch (error) {
    console.error("Error loading V2 storefront:", error);
    return {
      products: demoProducts,
      categories: demoCategories,
      promotions: demoPromotions,
      content: defaultStoreContent,
      usingDemo: true,
    };
  }
}

export async function fetchStorefrontContent() {
  if (!hasFirebaseEnv) return defaultStoreContent;

  try {
    const snap = await getDoc(doc(db, catalogCollections.content, "main"));
    return snap.exists() ? normalizeContent(snap.data()) : defaultStoreContent;
  } catch (error) {
    console.error("Error loading storefront content:", error);
    return defaultStoreContent;
  }
}

export async function seedDemoStorefrontV2() {
  const now = Date.now();
  await Promise.all([
    ...demoProducts.map((product) =>
      setDoc(doc(db, catalogCollections.products, product.id), {
        ...product,
        updatedAt: now,
        createdAt: product.createdAt || now,
      })
    ),
    ...demoCategories.map((category) =>
      setDoc(doc(db, catalogCollections.categories, category.id), category)
    ),
    ...demoPromotions.map((promotion) =>
      setDoc(doc(db, catalogCollections.promotions, promotion.id), promotion)
    ),
    setDoc(doc(db, catalogCollections.content, "main"), defaultStoreContent),
  ]);
}
