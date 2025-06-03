import { useFavorites } from "../contexts/favorites-context";
import { Badge } from "./ui/badge";

export const FavoritesBadge = () => {
  const { state } = useFavorites();
  const itemCount = state.items.length;

  if (itemCount === 0) return null;

  return (
    <Badge
      variant="destructive"
      className="absolute -top-2 -right-2 min-w-[1.25rem] h-5 flex items-center justify-center p-0 text-xs bg-red-500 hover:bg-red-600"
    >
      {itemCount}
    </Badge>
  );
};