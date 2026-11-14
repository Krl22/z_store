import { lazy, Suspense, useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { DesktopNav } from "@/components/DesktopNav";
import { CenterToast } from "@/components/ui";
import { CartPage } from "@/pages/CartPage";
import { HomePage } from "@/pages/HomePage";
import { ProfilePage } from "@/pages/ProfilePage";
import { StoreProvider, useStore } from "@/state/StoreContext";

const AdminPage = lazy(() => import("@/pages/admin/AdminPage"));

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Shell />
      </BrowserRouter>
    </StoreProvider>
  );
}

function Shell() {
  const store = useStore();
  const [minSplashDone, setMinSplashDone] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setMinSplashDone(true), 600);
    return () => window.clearTimeout(timer);
  }, []);
  const showSplash = !minSplashDone || !store.ready || (store.productsLoading && store.products.length === 0);

  return (
    <div className="relative min-h-dvh w-full bg-bosque-background">
      <DesktopNav />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/producto/:productId" element={<HomePage />} />
        <Route path="/carrito" element={<CartPage />} />
        <Route path="/perfil" element={<ProfilePage />} />
        <Route
          path="/admin"
          element={
            <Suspense fallback={<div className="p-6 text-bosque-muted">Cargando panel…</div>}>
              <AdminPage />
            </Suspense>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav />
      {store.toast ? <CenterToast message={store.toast} /> : null}
      {showSplash ? <Splash /> : null}
    </div>
  );
}

/** ZetaSplashScreen() */
function Splash() {
  return (
    <div className="fixed inset-0 z-[70] overflow-hidden bg-bosque-deep">
      <img src="/brand/splash.webp" alt="" className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#284B2E66] via-transparent to-[#284B2EAA]" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-[18px] px-7">
        <img src="/brand/logo.webp" alt="Zeta Dorada" className="w-full max-w-[420px] rounded-[24px] bg-[#FFFDF4EE] px-[18px] py-2.5" />
        <span className="h-[5px] w-28 rounded-full bg-store-yellow" />
      </div>
    </div>
  );
}
