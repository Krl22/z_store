import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Instagram,
  Leaf,
  MessageCircle,
  PackageCheck,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  defaultStoreContent,
  formatCurrency,
  StoreCategory,
  StoreProduct,
  StorefrontContent,
} from "@/lib/storefront-v2";
import { fetchStorefrontV2 } from "@/services/storefrontV2Service";

export const Landing = () => {
  const navigate = useNavigate();
  const [content, setContent] =
    useState<StorefrontContent>(defaultStoreContent);
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [categories, setCategories] = useState<StoreCategory[]>([]);

  useEffect(() => {
    const load = async () => {
      const data = await fetchStorefrontV2();
      setContent(data.content);
      setProducts(data.products.filter((product) => product.status === "active"));
      setCategories(data.categories);
    };
    load();
  }, []);

  const featuredProducts = products.filter((item) => item.featured).slice(0, 4);

  return (
    <main className="min-h-screen bg-[#f7f3ea] text-[#153328]">
      <section className="relative min-h-[88vh] overflow-hidden bg-[#10241d] text-white">
        <img
          src={content.heroImage}
          alt="Zeta Dorada medicinal mushroom apothecary"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,21,15,0.96),rgba(7,21,15,0.82)_42%,rgba(7,21,15,0.22))]" />

        <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/pwa-512x512.png"
              alt="Zeta Dorada"
              className="h-12 w-12 rounded-full"
            />
            <div>
              <p className="text-lg font-semibold leading-none text-[#f5d58b]">
                Zeta Dorada
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.24em] text-white/65">
                Apothecary
              </p>
            </div>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-white/78 md:flex">
            <a href="#categorias" className="hover:text-[#f5d58b]">
              Categorias
            </a>
            <a href="#destacados" className="hover:text-[#f5d58b]">
              Destacados
            </a>
            <Link to="/admin" className="hover:text-[#f5d58b]">
              Admin
            </Link>
          </nav>
          <Button
            className="rounded-lg bg-[#d8b56d] text-[#10241d] hover:bg-[#f0cc7d]"
            onClick={() => navigate("/tienda")}
          >
            Tienda
            <ArrowRight className="h-4 w-4" />
          </Button>
        </header>

        <div className="relative z-10 mx-auto grid max-w-7xl items-end gap-8 px-4 pb-16 pt-16 sm:px-6 md:pt-24 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div className="max-w-3xl">
            <Badge className="border-[#d8b56d]/35 bg-[#d8b56d]/15 text-[#f5d58b]">
              {content.announcement}
            </Badge>
            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.28em] text-[#f5d58b]">
              {content.heroEyebrow}
            </p>
            <h1 className="mt-4 max-w-4xl text-5xl font-semibold leading-[0.98] text-white md:text-7xl">
              {content.heroTitle}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-[#e9e0c9] md:text-lg">
              {content.heroSubtitle}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                className="h-12 rounded-lg bg-[#d8b56d] px-6 text-[#10241d] hover:bg-[#f0cc7d]"
                onClick={() => navigate("/tienda")}
              >
                {content.primaryCta}
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-12 rounded-lg border-white/30 bg-white/10 px-6 text-white hover:bg-white/20"
                onClick={() => navigate("/tienda")}
              >
                {content.secondaryCta}
              </Button>
            </div>
            <p className="mt-5 text-sm text-white/68">{content.trustLine}</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Leaf, value: "Natural", label: "Linea botanica" },
              { icon: ShieldCheck, value: "Premium", label: "Marca confiable" },
              { icon: PackageCheck, value: "Editable", label: "Admin V2" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur"
              >
                <item.icon className="h-5 w-5 text-[#f5d58b]" />
                <p className="mt-5 text-xl font-semibold text-white">
                  {item.value}
                </p>
                <p className="mt-1 text-xs text-white/62">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="categorias" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#a67c28]">
              Compra guiada
            </p>
            <h2 className="mt-1 text-3xl font-semibold text-[#153328]">
              Categorias pensadas para decidir rapido
            </h2>
          </div>
          <Button
            variant="outline"
            className="hidden rounded-lg border-[#cdbf9e] md:inline-flex"
            onClick={() => navigate("/tienda")}
          >
            Ver catalogo
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {categories.slice(0, 4).map((category) => (
            <button
              key={category.id}
              className="group overflow-hidden rounded-lg bg-white text-left shadow-sm ring-1 ring-[#e3dccb] transition hover:-translate-y-1 hover:shadow-xl"
              onClick={() => navigate(`/tienda?categoria=${category.id}`)}
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={category.image}
                  alt={category.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-[#153328]">
                  {category.name}
                </h3>
                <p className="mt-2 text-sm leading-5 text-[#5d6f65]">
                  {category.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section id="destacados" className="bg-[#10241d] py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[#f5d58b]">
                Productos estrella
              </p>
              <h2 className="mt-1 text-3xl font-semibold">
                Una vitrina lista para vender
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-white/65">
              Mockups de producto, precios, bundles y beneficios editables desde
              el panel admin para que el cliente pueda operar la tienda.
            </p>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <article
                key={product.id}
                className="overflow-hidden rounded-lg bg-white text-[#153328]"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="aspect-[4/3] w-full object-cover"
                />
                <div className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold leading-5">{product.name}</h3>
                    <Sparkles className="h-4 w-4 text-[#a67c28]" />
                  </div>
                  <p className="mt-2 line-clamp-2 min-h-10 text-sm text-[#5d6f65]">
                    {product.shortDescription}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-lg font-semibold">
                      {formatCurrency(product.price)}
                    </span>
                    <Button
                      size="sm"
                      className="rounded-lg bg-[#153328] text-white hover:bg-[#24503f]"
                      onClick={() => navigate("/tienda")}
                    >
                      Ver
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-12 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:px-8">
        <div className="rounded-lg bg-[#153328] p-6 text-white">
          <MessageCircle className="h-7 w-7 text-[#f5d58b]" />
          <h2 className="mt-5 text-2xl font-semibold">Compra por WhatsApp</h2>
          <p className="mt-3 text-sm leading-6 text-white/70">
            El checkout transaccional queda para despues. Ahora la experiencia
            empuja a armar carrito y enviar un pedido claro al negocio.
          </p>
          <Button
            className="mt-6 rounded-lg bg-[#d8b56d] text-[#10241d] hover:bg-[#f0cc7d]"
            onClick={() => navigate("/tienda")}
          >
            Armar pedido
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Promos",
              text: "Codigos, descuentos visibles y bundles manejables desde admin.",
            },
            {
              title: "Contenido",
              text: "Hero, anuncio, WhatsApp y copy principal sin tocar codigo.",
            },
            {
              title: "Catalogo",
              text: "Productos, imagenes, beneficios, stock y estado de publicacion.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-lg bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#5d6f65]">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-[#e3dccb] px-4 py-8 text-center text-sm text-[#5d6f65]">
        <div className="flex items-center justify-center gap-2 text-[#153328]">
          <Instagram className="h-4 w-4" />
          <span>Zeta Dorada</span>
        </div>
        <p className="mt-2">{content.footerNote}</p>
      </footer>
    </main>
  );
};
