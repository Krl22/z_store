import { createContext, useContext, useReducer, ReactNode } from 'react';

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
};

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { ID: string; cantidad: number } }
  | { type: 'CLEAR_CART' };

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
} | null>(null);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.ID === action.payload.ID);
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.ID === action.payload.ID
              ? { ...item, cantidad: item.cantidad + 1 }
              : item
          ),
          total: state.total + parseFloat(action.payload.precio)
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, cantidad: 1 }],
        total: state.total + parseFloat(action.payload.precio)
      };
    }
    case 'REMOVE_ITEM': {
      const item = state.items.find(item => item.ID === action.payload);
      return {
        ...state,
        items: state.items.filter(item => item.ID !== action.payload),
        total: state.total - (item ? parseFloat(item.precio) * item.cantidad : 0)
      };
    }
    case 'UPDATE_QUANTITY': {
      const item = state.items.find(item => item.ID === action.payload.ID);
      if (!item) return state;
      const quantityDiff = action.payload.cantidad - item.cantidad;
      return {
        ...state,
        items: state.items.map(item =>
          item.ID === action.payload.ID
            ? { ...item, cantidad: action.payload.cantidad }
            : item
        ),
        total: state.total + parseFloat(item.precio) * quantityDiff
      };
    }
    case 'CLEAR_CART':
      return {
        items: [],
        total: 0
      };
    default:
      return state;
  }
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0 });

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};