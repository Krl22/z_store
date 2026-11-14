import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DEFAULT_FILTERS, FilterSidebar, type ProductFilters } from "@/components/FilterSidebar";
import { PromoCarousel } from "@/components/PromoCarousel";
import { DealTile, ProductRow } from "@/components/ProductCards";
import { ProductDetail } from "@/components/ProductDetail";
import { StoreHeader, type HeaderOption } from "@/components/StoreHeader";
import { EmptyStateCard, ProductListSkeleton, SectionTitle, StatusPill } from "@/components/ui";
import { currentPrice, hasValidOffer, normalize } from "@/lib/format";
import { useStore } from "@/state/StoreContext";

// HomeScreen(): encabezado fijo, carrusel, ofertas destacadas y resultados.
// En escritorio (lg) los filtros pasan a una columna a la izquierda.

export function HomePage() {
  const store = useStore();
  const navigate = useNavigate();
  const { productId } = useParams();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<ProductFilters>(DEFAULT_FILTERS);
  const { category, sortKey } = filters;

  const categories = useMemo(() => ["Todos", ...new Set(store.products.map((p) => p.category).filter(Boolean))], [store.products]);
  const categoryCounts = categories.map((name) => ({ name, count: name === "Todos" ? store.products.length : store.products.filter((p) => p.category === name).length }));
  const options: HeaderOption[] = [
    { key: "sort", text: "Ordenar", leading: "menu" },
    ...categories.map((c) => ({ key: c, text: c })),
    { key: "account", text: store.session ? "Cuenta" : "Ingresar", leading: "user" },
    ...(store.isAdmin ? [{ key: "admin", text: "Admin" }] : []),
  ];

  const visible = useMemo(() => {
    const search = normalize(query.trim());
    const min = filters.minPrice ? Number(filters.minPrice) : null;
    const max = filters.maxPrice ? Number(filters.maxPrice) : null;
    const filtered = store.products.filter((p) => {
      const haystack = normalize(`${p.name} ${p.latin_name ?? ""} ${p.format ?? ""} ${p.category} ${p.tag ?? ""}`);
      const price = currentPrice(p);
      return (
        (category === "Todos" || p.category === category) &&
        (!search || haystack.includes(search)) &&
        (min == null || price >= min) &&
        (max == null || price <= max) &&
        (!filters.onlyStock || p.stock > 0) &&
        (!filters.onlyOffers || hasValidOffer(p))
      );
    });
    const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name);
    switch (sortKey) {
      case "price_low":
        return [...filtered].sort((a, b) => currentPrice(a) - currentPrice(b) || byName(a, b));
      case "price_high":
        return [...filtered].sort((a, b) => currentPrice(b) - currentPrice(a) || byName(a, b));
      case "stock":
        return [...filtered].sort((a, b) => b.stock - a.stock || byName(a, b));
      default:
        return filtered;
    }
  }, [store.products, query, filters, category, sortKey]);

  const showOffers = JSON.stringify(filters) === JSON.stringify(DEFAULT_FILTERS) && !query.trim();
  const offers = showOffers ? store.products.filter((p) => p.is_featured_offer).slice(0, 10) : [];
  const selected = productId ? store.products.find((p) => p.id === productId) ?? null : null;
  const related = selected
    ? store.products.filter((p) => p.id !== selected.id && (p.category === selected.category || p.benefits.some((b) => selected.benefits.includes(b)))).slice(0, 8)
    : [];

  return (
    <div className="flex flex-col gap-3.5 pb-28 md:pb-12">
      <div className="sticky top-0 z-20 md:top-16">
        <StoreHeader
          query={query}
          onQueryChange={setQuery}
          options={options}
          selectedKey={category}
          onOptionSelected={(key) => {
            if (key === "account") navigate("/perfil");
            else if (key === "admin") navigate("/admin");
            else setFilters({ ...filters, category: key });
          }}
          sortKey={sortKey}
          onSortSelected={(key) => setFilters({ ...filters, sortKey: key })}
          collapseOnScroll
          chipsHiddenOnLarge
        />
      </div>

      <main className="mx-auto flex w-full max-w-[1320px] flex-col gap-3.5 md:gap-5 md:px-6 md:pt-2">
        <div className="px-3.5 md:px-0">
          <PromoCarousel promos={store.promos} rotationSeconds={store.settings?.ad_rotation_seconds} />
        </div>

        {store.message ? (
          <div className="px-3.5 md:px-0">
            <StatusPill message={store.message} onDismiss={() => store.setMessage(null)} />
          </div>
        ) : null}

        <div className="flex flex-col gap-3.5 lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start lg:gap-6">
          <div className="no-scrollbar hidden lg:sticky lg:top-[168px] lg:block lg:max-h-[calc(100dvh-184px)] lg:overflow-y-auto">
            <FilterSidebar filters={filters} onChange={setFilters} categories={categoryCounts} resultCount={visible.length} />
          </div>

          <div className="flex min-w-0 flex-col gap-3.5 md:gap-5">
            {offers.length ? (
              <>
                <SectionTitle title="Ofertas destacadas" detail={`${offers.length} promos y combos`} className="px-3.5 md:px-0" />
                <div className="no-scrollbar flex gap-2.5 overflow-x-auto px-3.5 md:px-0">
                  {offers.map((product) => (
                    <DealTile key={product.id} product={product} onClick={() => navigate(`/producto/${product.id}`)} />
                  ))}
                </div>
              </>
            ) : null}

            <SectionTitle title="Resultados" detail="Delivery en Lima" className="px-3.5 md:px-0" />
            <div className="grid grid-cols-1 gap-3.5 px-3.5 md:grid-cols-2 md:px-0 2xl:grid-cols-3">
              {store.productsLoading && store.products.length === 0 ? (
                <div className="md:col-span-2 2xl:col-span-3">
                  <ProductListSkeleton />
                </div>
              ) : visible.length === 0 ? (
                <EmptyStateCard
                  className="md:col-span-2 2xl:col-span-3"
                  title={query.trim() ? `Sin resultados para "${query.trim()}"` : "No hay productos en esta vista"}
                  detail="Prueba con otra categoría o busca kit, melena u ostra."
                  action={query.trim() ? "Limpiar búsqueda" : "Limpiar filtros"}
                  onAction={() => {
                    setQuery("");
                    setFilters(DEFAULT_FILTERS);
                  }}
                />
              ) : (
                visible.map((product) => (
                  <ProductRow
                    key={product.id}
                    product={product}
                    quantity={store.cart[product.id] ?? 0}
                    onOpen={() => navigate(`/producto/${product.id}`)}
                    onAdd={() => {
                      store.addToCart(product);
                      store.showToast("Agregado al carrito");
                    }}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {selected ? (
        <ProductDetail
          product={selected}
          related={related}
          quantity={store.cart[selected.id] ?? 0}
          onClose={() => navigate("/", { replace: true })}
          onAdd={() => {
            store.addToCart(selected);
            store.showToast("Agregado al carrito");
          }}
          onRelated={(product) => navigate(`/producto/${product.id}`, { replace: true })}
        />
      ) : null}
    </div>
  );
}
