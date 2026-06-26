export type ProductStatus = "active" | "draft" | "archived";
export type PromotionStatus = "active" | "scheduled" | "paused";

export type StoreProduct = {
  id: string;
  slug: string;
  name: string;
  categoryId: string;
  species: string;
  format: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  unit: string;
  image: string;
  shortDescription: string;
  description: string;
  badges: string[];
  benefits: string[];
  ingredients: string[];
  ritualTip: string;
  promotionId?: string;
  featured: boolean;
  status: ProductStatus;
  updatedAt?: number;
  createdAt?: number;
};

export type StoreCategory = {
  id: string;
  name: string;
  description: string;
  image: string;
  featured: boolean;
  order: number;
};

export type StorePromotion = {
  id: string;
  title: string;
  subtitle: string;
  code: string;
  discountLabel: string;
  productIds: string[];
  status: PromotionStatus;
  startsAt?: string;
  endsAt?: string;
};

export type StorefrontContent = {
  id: "main";
  announcement: string;
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  primaryCta: string;
  secondaryCta: string;
  trustLine: string;
  whatsappNumber: string;
  whatsappMessage: string;
  footerNote: string;
};

export type LegacyProduct = {
  ID: string;
  Tipo: string;
  Categoria: string;
  Subcategoria: string;
  Hongo: string;
  Nombre: string;
  stock: string;
  unidad: string;
  precio: string;
  image: string;
  descripcion: string;
  promocion?: string;
};

export const catalogCollections = {
  products: "store_products_v2",
  categories: "store_categories_v2",
  promotions: "store_promotions_v2",
  content: "storefront_content_v2",
} as const;

export const defaultStoreContent: StorefrontContent = {
  id: "main",
  announcement: "Nueva curaduria premium de hongos funcionales",
  heroEyebrow: "Zeta Dorada Apothecary",
  heroTitle: "Hongos medicinales premium para rituales diarios",
  heroSubtitle:
    "Catalogo naturalista de blends, extractos y kits pensados para vender con confianza, claridad y una experiencia de compra memorable.",
  heroImage: "/brand/hero-apothecary-v2.webp",
  primaryCta: "Explorar tienda",
  secondaryCta: "Ver promociones",
  trustLine: "Productos seleccionados, empaques premium y compra asistida por WhatsApp.",
  whatsappNumber: "51901997567",
  whatsappMessage:
    "Hola, quiero hacer un pedido en Zeta Dorada. Estos son los productos que me interesan:",
  footerNote:
    "Contenido informativo de bienestar. No reemplaza consejo medico profesional.",
};

export const demoCategories: StoreCategory[] = [
  {
    id: "focus",
    name: "Focus",
    description: "Blends para rutinas de concentracion y claridad diaria.",
    image: "/brand/products/lions-mane-v2.webp",
    featured: true,
    order: 1,
  },
  {
    id: "calma",
    name: "Calma",
    description: "Reishi, infusiones y rituales para cerrar el dia con pausa.",
    image: "/brand/products/reishi-v2.webp",
    featured: true,
    order: 2,
  },
  {
    id: "energia",
    name: "Energia",
    description: "Cordyceps y formulas para un ritmo activo y natural.",
    image: "/brand/products/cordyceps-v2.webp",
    featured: true,
    order: 3,
  },
  {
    id: "kits",
    name: "Kits",
    description: "Bundles listos para regalar, iniciar o elevar la rutina.",
    image: "/brand/products/ritual-kit-v2.webp",
    featured: true,
    order: 4,
  },
];

export const demoPromotions: StorePromotion[] = [
  {
    id: "ritual15",
    title: "Ritual de inicio",
    subtitle: "Arma tu primera rutina con productos seleccionados.",
    code: "RITUAL15",
    discountLabel: "15% off",
    productIds: ["ritual-kit-dorado", "melena-leon-focus"],
    status: "active",
  },
  {
    id: "bundle-night",
    title: "Noche botanica",
    subtitle: "Reishi + infusion premium para una compra mas completa.",
    code: "CALMA10",
    discountLabel: "10% off",
    productIds: ["reishi-calm-tincture", "reishi-cacao-infusion"],
    status: "active",
  },
];

export const demoProducts: StoreProduct[] = [
  {
    id: "melena-leon-focus",
    slug: "melena-leon-focus",
    name: "Melena de Leon Focus Blend",
    categoryId: "focus",
    species: "Hericium erinaceus",
    format: "Capsulas + polvo soluble",
    price: 89,
    compareAtPrice: 109,
    stock: 24,
    unit: "frasco",
    image: "/brand/products/lions-mane-v2.webp",
    shortDescription:
      "Blend premium para acompanar rutinas de estudio, trabajo creativo y dias de alta demanda.",
    description:
      "Mezcla naturalista de melena de leon con presentacion de apothecary premium. Pensada para una tienda que vende claridad, ritual y confianza sin promesas medicas.",
    badges: ["Best seller", "Premium"],
    benefits: ["Ritual de manana", "Formato practico", "Compra recurrente"],
    ingredients: ["Melena de leon", "Extracto dual", "Base vegetal"],
    ritualTip: "Usar en la rutina de la manana junto a cafe, cacao o infusion.",
    promotionId: "ritual15",
    featured: true,
    status: "active",
  },
  {
    id: "reishi-calm-tincture",
    slug: "reishi-calm-tincture",
    name: "Reishi Calm Tincture",
    categoryId: "calma",
    species: "Ganoderma lucidum",
    format: "Extracto liquido",
    price: 76,
    compareAtPrice: 94,
    stock: 18,
    unit: "gotero",
    image: "/brand/products/reishi-v2.webp",
    shortDescription:
      "Gotero premium para rituales nocturnos, pausas conscientes e infusiones botanicas.",
    description:
      "Reishi en presentacion elegante para shoppers que buscan productos naturales y faciles de integrar a una rutina de bienestar.",
    badges: ["Nuevo", "Ritual noche"],
    benefits: ["Uso flexible", "Packaging premium", "Ideal para bundles"],
    ingredients: ["Reishi", "Extracto botanico", "Base vegetal"],
    ritualTip: "Combinar con infusion caliente al final del dia.",
    promotionId: "bundle-night",
    featured: true,
    status: "active",
  },
  {
    id: "cordyceps-vitality",
    slug: "cordyceps-vitality",
    name: "Cordyceps Vitality Blend",
    categoryId: "energia",
    species: "Cordyceps militaris",
    format: "Polvo funcional",
    price: 82,
    stock: 21,
    unit: "pouch",
    image: "/brand/products/cordyceps-v2.webp",
    shortDescription:
      "Formula botanica para rutinas activas, entrenamiento suave y energia diaria.",
    description:
      "Cordyceps en pouch premium para consumidores que prefieren preparaciones rapidas en smoothies, cacao o bebidas calientes.",
    badges: ["Activo", "Pouch"],
    benefits: ["Alta recompra", "Facil de preparar", "Naturalista"],
    ingredients: ["Cordyceps", "Extracto seco", "Base vegetal"],
    ritualTip: "Mezclar con bebida vegetal antes de una jornada activa.",
    featured: true,
    status: "active",
  },
  {
    id: "ritual-kit-dorado",
    slug: "ritual-kit-dorado",
    name: "Ritual Kit Dorado",
    categoryId: "kits",
    species: "Blend curado",
    format: "Bundle",
    price: 219,
    compareAtPrice: 264,
    stock: 9,
    unit: "kit",
    image: "/brand/products/ritual-kit-v2.webp",
    shortDescription:
      "Kit de inicio con seleccion de focus, calma y energia para aumentar ticket promedio.",
    description:
      "Bundle premium creado para que el cliente entienda rapidamente que comprar. Ideal para campanas, regalos y primera compra guiada.",
    badges: ["Bundle", "Ahorro"],
    benefits: ["Ticket alto", "Regalable", "Rutina completa"],
    ingredients: ["Melena de leon", "Reishi", "Cordyceps"],
    ritualTip: "Usar cada formula segun momento del dia: manana, tarde y noche.",
    promotionId: "ritual15",
    featured: true,
    status: "active",
  },
  {
    id: "reishi-cacao-infusion",
    slug: "reishi-cacao-infusion",
    name: "Reishi Cacao Infusion",
    categoryId: "calma",
    species: "Ganoderma lucidum",
    format: "Infusion",
    price: 58,
    stock: 32,
    unit: "pouch",
    image: "/brand/products/reishi-v2.webp",
    shortDescription:
      "Infusion botanica con perfil calido para sumar al carrito junto a extractos.",
    description:
      "Producto de entrada con precio accesible para que los visitantes prueben la marca y vuelvan por bundles.",
    badges: ["Entrada", "Infusion"],
    benefits: ["Precio accesible", "Cross-sell", "Ritual nocturno"],
    ingredients: ["Reishi", "Cacao", "Canela"],
    ritualTip: "Preparar como bebida caliente despues de cenar.",
    promotionId: "bundle-night",
    featured: false,
    status: "active",
  },
  {
    id: "chaga-golden-pouch",
    slug: "chaga-golden-pouch",
    name: "Chaga Golden Pouch",
    categoryId: "focus",
    species: "Inonotus obliquus",
    format: "Polvo soluble",
    price: 69,
    stock: 16,
    unit: "pouch",
    image: "/brand/hero-apothecary-v2.webp",
    shortDescription:
      "Pouch naturalista para bebidas calientes, smoothies y rutinas de temporada.",
    description:
      "Producto mock pensado para demostrar como el admin puede manejar nuevas lineas, imagenes, bundles y posicionamiento.",
    badges: ["Temporada"],
    benefits: ["Buen margen", "Editable", "Campanas"],
    ingredients: ["Chaga", "Cacao", "Especias botanicas"],
    ritualTip: "Mezclar con agua caliente o leche vegetal.",
    featured: false,
    status: "active",
  },
];

export const higgsfieldCreativePrompts = [
  {
    name: "Hero cinematico",
    prompt:
      "Premium medicinal mushroom apothecary in a lush forest, blank amber jars and kraft pouches, moss, reishi, lion's mane and cordyceps, dark negative space left for headline, luxury natural wellness ecommerce, forest green and warm gold, no text, no logos, no medical claims.",
  },
  {
    name: "Video loop producto",
    prompt:
      "Slow macro camera move over medicinal mushroom supplements on moss and walnut wood, amber glass, blank labels, warm morning forest light, premium botanical ecommerce, calm and elegant, no text, no people.",
  },
  {
    name: "Reel conversion",
    prompt:
      "Hands-free premium product scene: mushroom ritual kit on an apothecary table, soft golden light, botanical details, clean packaging with blank labels, luxury natural wellness brand, subtle steam from tea, no readable text.",
  },
  {
    name: "Categoria focus",
    prompt:
      "Lion's mane mushroom supplement product photo, premium amber jar and kraft pouch with blank label, forest green studio, moss, ivory paper, gold accent, square ecommerce crop, no text.",
  },
];

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 0,
  }).format(value);
}

export function toLegacyProduct(product: StoreProduct, categoryName?: string): LegacyProduct {
  return {
    ID: product.id,
    Tipo: product.format,
    Categoria: categoryName || product.categoryId,
    Subcategoria: product.badges[0] || "",
    Hongo: product.species,
    Nombre: product.name,
    stock: String(product.stock),
    unidad: product.unit,
    precio: String(product.price),
    image: product.image,
    descripcion: product.description,
    promocion: product.compareAtPrice || product.promotionId ? "true" : undefined,
  };
}
