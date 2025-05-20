import { useEffect, useState } from "react";
import ProductCard, { Producto } from "./ProductCard";

export default function ProductList() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const res = await fetch(
          "https://script.google.com/macros/s/AKfycby9bdbTDu04BO0kmLJ9aKwVt3hM_eOw-ZoQKvHInqxBGuqDyK2P9EjPqS_eQ767E2a50A/exec"
        );
        const data = await res.json();
        setProductos(data);
      } catch (err) {
        console.error("Error al cargar productos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, []);

  if (loading)
    return <p className="text-center py-10">Cargando productos...</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
      {productos.map((producto) => (
        <ProductCard key={producto.ID} producto={producto} />
      ))}
    </div>
  );
}
