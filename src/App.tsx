import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { TopNavbar } from "./components/TopNavbar";
import { BottomNavbar } from "./components/BottomNavbar";
import { ThemeProvider } from "./components/theme-provider";
import Home from "./pages/Home";
import { CartProvider } from "./contexts/cart-context";
import { AuthProvider } from "./contexts/auth-context";
import { useEffect } from "react";
import { analytics } from "./lib/firebase";
import { logEvent } from "firebase/analytics";
import { Landing } from "./pages/Landing";
import { FavoritesProvider } from "./contexts/favorites-context";
import { NotificationProvider } from "./contexts/notification-context";

function App() {
  useEffect(() => {
    // Track initial page view
    logEvent(analytics, "page_view");
  }, []);
  
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
        <CartProvider>
          <FavoritesProvider>
            <NotificationProvider>
              <Router>
                <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
                  <ConditionalTopNavBar />
                  <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/tienda" element={<Home />} />
                  </Routes>
                  <ConditionalBottomNavBar />
                </div>
              </Router>
            </NotificationProvider>
          </FavoritesProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

const ConditionalTopNavBar = () => {
  const location = useLocation();
  const hiddenRoutes = ["/"];
  return !hiddenRoutes.includes(location.pathname) ? (
    <div className="fixed top-0 left-0 right-0 z-50">
      {" "}
      {/* Fijo y por encima del contenido */}
      <TopNavbar />
    </div>
  ) : null;
};

const ConditionalBottomNavBar = () => {
  const location = useLocation();
  const hiddenRoutes = ["/"];
  return !hiddenRoutes.includes(location.pathname) ? <BottomNavbar /> : null;
};

export default App;
