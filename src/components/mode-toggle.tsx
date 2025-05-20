import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Switch } from "@/components/ui/switch";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  const handleToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="flex items-center space-x-2">
      <Sun
        className={`h-5 w-5 ${
          theme === "dark" ? "text-gray-400" : "text-yellow-600"
        }`}
      />
      <Switch
        checked={theme === "dark"}
        onCheckedChange={handleToggle}
        className="bg-gray-300 dark:bg-gray-600"
      />
      <Moon
        className={`h-5 w-5 ${
          theme === "dark" ? "text-blue-500" : "text-gray-400"
        }`}
      />
    </div>
  );
}
