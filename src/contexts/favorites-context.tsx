import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
} from "react";
import { db } from "../lib/firebase";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { useAuth } from "./auth-context";

type FavoriteItem = {
  ID: string;
  Nombre: string;
  precio: string;
  image: string;
  Tipo: string;
  Categoria: string;
  descripcion: string;
  addedAt: number; // timestamp para ordenar
};

type FavoritesState = {
  items: FavoriteItem[];
  isLoading: boolean;
  isSyncing: boolean;
};

type FavoritesAction =
  | { type: "ADD_FAVORITE"; payload: FavoriteItem }
  | { type: "REMOVE_FAVORITE"; payload: string }
  | { type: "CLEAR_FAVORITES" }
  | { type: "SET_FAVORITES"; payload: FavoriteItem[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_SYNCING"; payload: boolean };

const FavoritesContext = createContext<{
  state: FavoritesState;
  dispatch: React.Dispatch<FavoritesAction>;
  syncFavoritesToFirebase: () => Promise<void>;
  isFavorite: (productId: string) => boolean;
} | null>(null);

const favoritesReducer = (
  state: FavoritesState,
  action: FavoritesAction
): FavoritesState => {
  switch (action.type) {
    case "ADD_FAVORITE": {
      const existingItem = state.items.find(
        (item) => item.ID === action.payload.ID
      );
      if (existingItem) {
        return state; // Ya está en guardados
      }
      return {
        ...state,
        items: [...state.items, action.payload],
      };
    }
    case "REMOVE_FAVORITE":
      return {
        ...state,
        items: state.items.filter((item) => item.ID !== action.payload),
      };
    case "CLEAR_FAVORITES":
      return {
        ...state,
        items: [],
      };
    case "SET_FAVORITES":
      return {
        ...state,
        items: action.payload,
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

const initialState: FavoritesState = {
  items: [],
  isLoading: false,
  isSyncing: false,
};

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(favoritesReducer, initialState);
  const { user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  // Función para sincronizar guardados con Firebase
  const syncFavoritesToFirebase = async () => {
    if (!user) return;

    try {
      dispatch({ type: "SET_SYNCING", payload: true });
      const favoritesRef = doc(db, "favorites", user.uid);
      await setDoc(favoritesRef, {
        items: state.items,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error syncing favorites to Firebase:", error);
    } finally {
      dispatch({ type: "SET_SYNCING", payload: false });
    }
  };

  // Función para verificar si un producto está en guardados
  const isFavorite = (productId: string): boolean => {
    return state.items.some((item) => item.ID === productId);
  };

  // Load favorites from Firebase with real-time updates
  useEffect(() => {
    if (!user) {
      dispatch({ type: "CLEAR_FAVORITES" });
      setIsInitialized(false);
      return;
    }

    dispatch({ type: "SET_LOADING", payload: true });
    const favoritesRef = doc(db, "favorites", user.uid);

    const unsubscribe = onSnapshot(
      favoritesRef,
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          // Only update if we're not currently syncing to avoid conflicts
          if (!state.isSyncing) {
            dispatch({ type: "SET_FAVORITES", payload: data.items || [] });
          }
        } else {
          if (!state.isSyncing) {
            dispatch({ type: "SET_FAVORITES", payload: [] });
          }
        }
        dispatch({ type: "SET_LOADING", payload: false });
        setIsInitialized(true);
      },
      (error) => {
        console.error("Error loading favorites from Firebase:", error);
        dispatch({ type: "SET_LOADING", payload: false });
        setIsInitialized(true);
      }
    );

    return () => unsubscribe();
  }, [user]); // Only depends on user

  // Sync local changes to Firebase with debounce
  useEffect(() => {
    if (
      user &&
      isInitialized &&
      !state.isLoading &&
      !state.isSyncing &&
      state.items.length >= 0
    ) {
      const timeoutId = setTimeout(() => {
        syncFavoritesToFirebase();
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [state.items, user, isInitialized, state.isLoading, state.isSyncing]);

  return (
    <FavoritesContext.Provider
      value={{
        state,
        dispatch,
        syncFavoritesToFirebase,
        isFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
};
