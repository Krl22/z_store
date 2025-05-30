import { useCart } from "../contexts/cart-context";
import { Badge } from "./ui/badge";

export const CartBadge = () => {
  const { state } = useCart();
  const itemCount = state.items.reduce(
    (total, item) => total + item.cantidad,
    0
  );

  if (itemCount === 0) return null;

  return (
    <Badge
      variant="destructive"
      className="absolute -top-2 -right-2 min-w-[1.25rem] h-5 flex items-center justify-center p-0 text-xs"
    >
      {itemCount}
    </Badge>
  );
};
