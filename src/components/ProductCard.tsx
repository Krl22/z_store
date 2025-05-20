import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

export interface Producto {
  ID: string;
  Tipo: string;
  Categoria: string;
  Subcategoria: string;
  Hongo: string;
  stock: number;
  unidad: string;
  precio: number;
  image: string;
}

interface ProductCardProps {
  producto: Producto;
}

export default function ProductCard({ producto }: ProductCardProps) {
  const imageUrl = `/Productos_Images/${producto.image.split("/").pop()}`;

  return (
    <Card className="w-full max-w-sm rounded-2xl shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl flex items-center justify-between">
          {producto.Hongo}
          <Badge variant="outline">{producto.Categoria}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <img
          src={imageUrl}
          alt={producto.Hongo}
          className="w-full h-48 object-cover rounded-xl border"
        />
        <div className="text-center">
          <p className="text-muted-foreground text-sm">
            {producto.Tipo} - {producto.Subcategoria}
          </p>
          <p className="text-lg font-semibold">
            ${producto.precio} / {producto.unidad}
          </p>
          <p className="text-sm">Stock: {producto.stock}</p>
        </div>
        <Button className="w-full">
          <ShoppingCart className="w-4 h-4 mr-2" /> Agregar al carrito
        </Button>
      </CardContent>
    </Card>
  );
}
