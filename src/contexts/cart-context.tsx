import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  ReactNode,
} from "react";
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
  const [isInitialized, setIsInitialized] = useState(false);

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

  // Load cart from Firebase with real-time updates
  useEffect(() => {
    if (!user) {
      dispatch({ type: "CLEAR_CART" });
      setIsInitialized(false);
      return;
    }
  
    dispatch({ type: "SET_LOADING", payload: true });
    const cartRef = doc(db, "carts", user.uid);
  
    const unsubscribe = onSnapshot(
      cartRef,
      (doc) => {
        if (doc.exists()) {
          const cartData = doc.data();
          // Only update if we're not currently syncing to avoid conflicts
          if (!state.isSyncing) {
            dispatch({
              type: "SET_CART",
              payload: {
                items: cartData.items || [],
                total: cartData.total || 0,
              },
            });
          }
        } else {
          if (!state.isSyncing) {
            dispatch({ type: "SET_CART", payload: { items: [], total: 0 } });
          }
        }
        dispatch({ type: "SET_LOADING", payload: false });
        setIsInitialized(true);
      },
      (error) => {
        console.error("Error loading cart from Firebase:", error);
        dispatch({ type: "SET_LOADING", payload: false });
        setIsInitialized(true);
      }
    );
  
    return () => unsubscribe();
  }, [user]); // Only depends on user
  
  // Sync local changes to Firebase with debounce
  useEffect(() => {
    if (user && isInitialized && !state.isLoading && !state.isSyncing) {
      const timeoutId = setTimeout(() => {
        syncCartToFirebase();
      }, 1000);
  
      return () => clearTimeout(timeoutId);
    }
  }, [state.items, user, isInitialized, state.isLoading, state.isSyncing]); // Removed state.total

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
