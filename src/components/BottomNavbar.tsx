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
    <div className="fixed bottom-0 left-0 right-0 bg-amber-50 dark:bg-gray-900 border-t border-amber-100 dark:border-gray-700 lg:hidden shadow-[0_-2px_8px_0_rgba(0,0,0,0.04)]">
      <div className="flex justify-around items-center p-2">
        {/* Botón Home */}
        <Button
          variant="ghost"
          className="flex flex-col items-center gap-1 text-emerald-800 dark:text-gray-300 hover:bg-amber-100 hover:text-emerald-900 dark:hover:bg-gray-700/80 dark:hover:text-amber-100 transition-colors"
        >
          <Home className="h-5 w-5" />
        </Button>

        {/* Botón Heart */}
        <Button
          variant="ghost"
          className="flex flex-col items-center gap-1 text-emerald-800 dark:text-gray-300 hover:bg-amber-100 hover:text-emerald-900 dark:hover:bg-gray-700/80 dark:hover:text-amber-100 transition-colors"
        >
          <Heart className="h-5 w-5" />
        </Button>

        {/* Drawer para el carrito */}
        <Drawer>
          <DrawerTrigger>
            <Button
              variant="ghost"
              className="flex flex-col items-center gap-1 text-emerald-800 dark:text-gray-300 hover:bg-amber-100 hover:text-emerald-900 dark:hover:bg-gray-700/80 dark:hover:text-amber-100 transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle className="text-2xl text-emerald-800 dark:text-amber-300">
                Carrito
              </DrawerTitle>
              <DrawerDescription className="text-gray-600 dark:text-gray-400">
                Aquí puedes ver los productos en tu carrito.
              </DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <Button className="bg-amber-400 hover:bg-amber-500 text-emerald-800 dark:bg-amber-600 dark:hover:bg-amber-700 dark:text-white">
                Ir al carrito
              </Button>
              <DrawerClose asChild>
                <Button variant="outline">Cerrar</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        {/* Drawer para el formulario de inicio de sesión */}
        <Drawer>
          <DrawerTrigger asChild>
            <Button
              variant="ghost"
              className="flex flex-col items-center gap-1 text-emerald-800 dark:text-gray-300 hover:bg-amber-100 hover:text-emerald-900 dark:hover:bg-gray-700/80 dark:hover:text-amber-100 transition-colors h-10 w-10 p-0 sm:h-auto sm:w-auto sm:px-4 sm:py-2"
            >
              <User className="h-5 w-5" />
              <span className="hidden sm:inline-block text-xs">Perfil</span>
            </Button>
          </DrawerTrigger>
          <DrawerContent className="max-w-md mx-auto">
            <DrawerHeader>
              <DrawerTitle className="text-emerald-800 dark:text-amber-300 text-center">
                Iniciar sesión
              </DrawerTitle>
              <DrawerDescription className="text-gray-600 dark:text-gray-400 text-center">
                Elige tu método de acceso
              </DrawerDescription>
            </DrawerHeader>

            <div className="p-4 space-y-4">
              {/* Botón de Google */}
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => {
                  /* Tu función de login con Google aquí */
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Continuar con Google</span>
              </Button>

              <div className="flex items-center my-4">
                <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                <span className="mx-4 text-gray-500 dark:text-gray-400 text-sm">
                  o
                </span>
                <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
              </div>

              {/* Formulario tradicional */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Ingresa tu email"
                    {...register("email")}
                    className="bg-white dark:bg-gray-800 border border-amber-100 dark:border-gray-600 text-emerald-800 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Contraseña
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Ingresa tu contraseña"
                    {...register("password")}
                    className="bg-white dark:bg-gray-800 border border-amber-100 dark:border-gray-600 text-emerald-800 dark:text-white"
                  />
                </div>

                <DrawerFooter className="px-0">
                  <Button
                    type="submit"
                    className="bg-amber-400 hover:bg-amber-500 text-emerald-800 dark:bg-amber-600 dark:hover:bg-amber-700 dark:text-white"
                  >
                    Iniciar sesión
                  </Button>
                  <DrawerClose asChild>
                    <Button variant="outline">Cancelar</Button>
                  </DrawerClose>
                </DrawerFooter>
              </form>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
};
