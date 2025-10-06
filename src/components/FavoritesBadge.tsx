import { useFavorites } from "../contexts/favorites-context";
import { Badge } from "./ui/badge";

interface FavoritesBadgeProps {
  variant?: "absolute" | "inline";
}

export const FavoritesBadge = ({ variant = "absolute" }: FavoritesBadgeProps) => {
  const { state } = useFavorites();
  const itemCount = state.items.length;

  if (itemCount === 0) return null;

  if (variant === "inline") {
    return (
      <span className="ml-auto text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full min-w-[1.5rem] text-center">
        {itemCount}
      </span>
    );
  }

  return (
    <Badge
      variant="destructive"
      className="absolute -top-2 -right-2 min-w-[1.25rem] h-5 flex items-center justify-center p-0 text-xs bg-blue-500 hover:bg-blue-600"
    >
      {itemCount}
    </Badge>
  );
};