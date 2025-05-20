import { Button } from "@/components/ui/button";
import { Home, User, ShoppingCart, Heart } from "lucide-react"; // Importa íconos de Lucide
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";

export const BottomNavbar = () => {
  const { register, handleSubmit } = useForm();

  const onSubmit = (data: { email: string; password: string }) => {
    console.log(data);
    // Aquí puedes manejar el envío del formulario, como hacer una petición a tu API
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-yellow-400 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 lg:hidden">
      <div className="flex justify-around items-center p-2">
        {/* Botón Home */}
        <Button
          variant="ghost"
          className="flex flex-col items-center gap-1 text-gray-700 dark:text-gray-300"
        >
          <Home className="h-5 w-5" />
        </Button>

        {/* Botón Heart */}
        <Button
          variant="ghost"
          className="flex flex-col items-center gap-1 text-gray-700 dark:text-gray-300"
        >
          <Heart className="h-5 w-5" />
        </Button>

        {/* Drawer para el carrito */}
        <Drawer>
          <DrawerTrigger>
            <Button
              variant="ghost"
              className="flex flex-col items-center gap-1 text-gray-700 dark:text-gray-300"
            >
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle className="text-3xl">
                Are you absolutely sure?
              </DrawerTitle>
              <DrawerDescription>
                This action cannot be undone.
              </DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <Button>Submit</Button>
              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        {/* Drawer para el formulario de inicio de sesión */}
        <Drawer>
          <DrawerTrigger>
            <Button
              variant="ghost"
              className="flex flex-col items-center gap-1 text-gray-700 dark:text-gray-300"
            >
              <User className="h-5 w-5" />
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Sign In</DrawerTitle>
              <DrawerDescription>
                Enter your credentials to access your account.
              </DrawerDescription>
            </DrawerHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  {...register("email")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  {...register("password")}
                />
              </div>
              <DrawerFooter>
                <Button type="submit">Sign in</Button>
                <DrawerClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DrawerClose>
              </DrawerFooter>
            </form>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
};
