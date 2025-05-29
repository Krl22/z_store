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
import { CartProvider } from "./components/cart-context";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <CartProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
            <ConditionalTopNavBar />
            <Routes>
              <Route path="/" element={<Home />} />
            </Routes>
            <ConditionalBottomNavBar />
          </div>
        </Router>
      </CartProvider>
    </ThemeProvider>
  );
}

const ConditionalTopNavBar = () => {
  const location = useLocation();
  const hiddenRoutes = ["/test"];
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
  const hiddenRoutes = ["/test"];
  return !hiddenRoutes.includes(location.pathname) ? <BottomNavbar /> : null;
};

export default App;
