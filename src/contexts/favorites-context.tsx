import React, { createContext, useContext, useReducer, useEffect } from "react";
import { db } from "../lib/firebase";
import { doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";
import { useAuth } from "./auth-context";

type FavoriteItem = {
  ID: string;
  Hongo: string;
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

const favoritesReducer = (state: FavoritesState, action: FavoritesAction): FavoritesState => {
  switch (action.type) {
    case "ADD_FAVORITE": {
      const existingItem = state.items.find(
        (item) => item.ID === action.payload.ID
      );
      if (existingItem) {
        return state; // Ya está en favoritos
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

  // Función para sincronizar favoritos con Firebase
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

  // Función para verificar si un producto está en favoritos
  const isFavorite = (productId: string): boolean => {
    return state.items.some((item) => item.ID === productId);
  };

  // Cargar favoritos desde Firebase cuando el usuario se autentica
  useEffect(() => {
    if (!user) {
      dispatch({ type: "CLEAR_FAVORITES" });
      return;
    }

    dispatch({ type: "SET_LOADING", payload: true });
    const favoritesRef = doc(db, "favorites", user.uid);
    
    const unsubscribe = onSnapshot(
      favoritesRef,
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          dispatch({ type: "SET_FAVORITES", payload: data.items || [] });
        } else {
          dispatch({ type: "SET_FAVORITES", payload: [] });
        }
        dispatch({ type: "SET_LOADING", payload: false });
      },
      (error) => {
        console.error("Error loading favorites from Firebase:", error);
        dispatch({ type: "SET_LOADING", payload: false });
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Sincronizar automáticamente cuando cambian los favoritos
  useEffect(() => {
    // Solo sincronizar si hay cambios reales en los items y no estamos cargando desde Firebase
    if (user && !state.isLoading && !state.isSyncing) {
    // Usar un timeout para evitar múltiples llamadas rápidas
    const timeoutId = setTimeout(() => {
      syncFavoritesToFirebase();
    }, 500);

    return () => clearTimeout(timeoutId);
  }
}, [state.items, user, state.isLoading, state.isSyncing]);

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