import { createContext, useContext, useReducer, ReactNode, useEffect } from "react";
import { db } from "../lib/firebase";
import { doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";
import { useAuth } from "./auth-context";

type CartItem = {
  ID: string;
  Hongo: string;
  precio: string;
  cantidad: number;
  image: string;
};

type CartState = {
  items: CartItem[];
  total: number;
  isLoading: boolean;
  isSyncing: boolean;
};

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { ID: string; cantidad: number } }
  | { type: "CLEAR_CART" }
  | { type: "SET_CART"; payload: { items: CartItem[]; total: number } }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_SYNCING"; payload: boolean };

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  syncCartToFirebase: () => Promise<void>;
} | null>(null);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItem = state.items.find(
        (item) => item.ID === action.payload.ID
      );
      if (existingItem) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.ID === action.payload.ID
              ? { ...item, cantidad: item.cantidad + 1 }
              : item
          ),
          total: state.total + parseFloat(action.payload.precio),
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, cantidad: 1 }],
        total: state.total + parseFloat(action.payload.precio),
      };
    }
    case "REMOVE_ITEM": {
      const item = state.items.find((item) => item.ID === action.payload);
      return {
        ...state,
        items: state.items.filter((item) => item.ID !== action.payload),
        total:
          state.total - (item ? parseFloat(item.precio) * item.cantidad : 0),
      };
    }
    case "UPDATE_QUANTITY": {
      const item = state.items.find((item) => item.ID === action.payload.ID);
      if (!item) return state;
      const quantityDiff = action.payload.cantidad - item.cantidad;
      return {
        ...state,
        items: state.items.map((item) =>
          item.ID === action.payload.ID
            ? { ...item, cantidad: action.payload.cantidad }
            : item
        ),
        total: state.total + parseFloat(item.precio) * quantityDiff,
      };
    }
    case "CLEAR_CART":
      return {
        ...state,
        items: [],
        total: 0,
      };
    case "SET_CART":
      return {
        ...state,
        items: action.payload.items,
        total: action.payload.total,
        isLoading: false,
      };
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };
    case "SET_SYNCING":
      return {
        ...state,
        isSyncing: action.payload,
      };
    default:
      return state;
  }
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    isLoading: false,
    isSyncing: false,
  });

  // Función para sincronizar el carrito a Firebase
  const syncCartToFirebase = async () => {
    if (!user) return;

    try {
      dispatch({ type: "SET_SYNCING", payload: true });
      const cartRef = doc(db, "carts", user.uid);
      await setDoc(cartRef, {
        items: state.items,
        total: state.total,
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error syncing cart to Firebase:", error);
    } finally {
      dispatch({ type: "SET_SYNCING", payload: false });
    }
  };

  // Función para cargar el carrito desde Firebase
  const loadCartFromFirebase = async () => {
    if (!user) return;

    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const cartRef = doc(db, "carts", user.uid);
      const cartSnap = await getDoc(cartRef);

      if (cartSnap.exists()) {
        const cartData = cartSnap.data();
        dispatch({
          type: "SET_CART",
          payload: {
            items: cartData.items || [],
            total: cartData.total || 0,
          },
        });
      } else {
        // Si no existe carrito en Firebase, crear uno vacío
        dispatch({ type: "SET_CART", payload: { items: [], total: 0 } });
      }
    } catch (error) {
      console.error("Error loading cart from Firebase:", error);
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  // Función para limpiar el carrito local cuando el usuario se desloguea
  const clearLocalCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  // Efecto para cargar el carrito cuando el usuario se loguea
  useEffect(() => {
    if (user) {
      loadCartFromFirebase();
    } else {
      clearLocalCart();
    }
  }, [user]);

  // Efecto para sincronizar automáticamente cuando cambia el carrito
  useEffect(() => {
    if (user && !state.isLoading && state.items.length >= 0) {
      // Debounce la sincronización para evitar demasiadas escrituras
      const timeoutId = setTimeout(() => {
        syncCartToFirebase();
      }, 1000); // Espera 1 segundo después del último cambio

      return () => clearTimeout(timeoutId);
    }
  }, [state.items, state.total, user]);

  // Listener en tiempo real para sincronización entre dispositivos
  useEffect(() => {
    if (!user) return;

    const cartRef = doc(db, "carts", user.uid);
    const unsubscribe = onSnapshot(cartRef, (doc) => {
      if (doc.exists() && !state.isSyncing) {
        const cartData = doc.data();
        const firebaseTotal = cartData.total || 0;
        const firebaseItems = cartData.items || [];

        // Solo actualizar si hay diferencias significativas
        if (
          JSON.stringify(firebaseItems) !== JSON.stringify(state.items) ||
          Math.abs(firebaseTotal - state.total) > 0.01
        ) {
          dispatch({
            type: "SET_CART",
            payload: {
              items: firebaseItems,
              total: firebaseTotal,
            },
          });
        }
      }
    });

    return () => unsubscribe();
  }, [user, state.isSyncing]);

  return (
    <CartContext.Provider value={{ state, dispatch, syncCartToFirebase }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
