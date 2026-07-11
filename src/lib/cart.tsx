import { createContext, useContext, useReducer, type ReactNode } from "react";
import type { Product } from "./products";

export type CartItem = {
  product: Product;
  variantId: string;
  quantity: number;
};

type State = { items: CartItem[]; isOpen: boolean };

type Action =
  | { type: "ADD"; product: Product; variantId: string; qty: number }
  | { type: "REMOVE"; handle: string; variantId: string }
  | { type: "UPDATE"; handle: string; variantId: string; qty: number }
  | { type: "OPEN" }
  | { type: "CLOSE" }
  | { type: "CLEAR" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD": {
      const idx = state.items.findIndex(
        (i) => i.product.handle === action.product.handle && i.variantId === action.variantId,
      );
      const items = [...state.items];
      if (idx >= 0) {
        items[idx] = { ...items[idx], quantity: items[idx].quantity + action.qty };
      } else {
        items.push({ product: action.product, variantId: action.variantId, quantity: action.qty });
      }
      return { items, isOpen: true };
    }
    case "REMOVE":
      return {
        ...state,
        items: state.items.filter(
          (i) => !(i.product.handle === action.handle && i.variantId === action.variantId),
        ),
      };
    case "UPDATE": {
      if (action.qty <= 0) {
        return {
          ...state,
          items: state.items.filter(
            (i) => !(i.product.handle === action.handle && i.variantId === action.variantId),
          ),
        };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.product.handle === action.handle && i.variantId === action.variantId
            ? { ...i, quantity: action.qty }
            : i,
        ),
      };
    }
    case "OPEN":  return { ...state, isOpen: true };
    case "CLOSE": return { ...state, isOpen: false };
    case "CLEAR": return { ...state, items: [] };
    default:      return state;
  }
}

type CartCtx = {
  items: CartItem[];
  isOpen: boolean;
  itemCount: number;
  subtotal: number;
  addItem: (product: Product, variantId: string, qty?: number) => void;
  removeItem: (handle: string, variantId: string) => void;
  updateQty: (handle: string, variantId: string, qty: number) => void;
  openCart: () => void;
  closeCart: () => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [], isOpen: false });

  const itemCount = state.items.reduce((n, i) => n + i.quantity, 0);
  const subtotal = state.items.reduce((n, i) => {
    const v = i.product.variants.find((v) => v.id === i.variantId);
    return n + (v?.price ?? i.product.price) * i.quantity;
  }, 0);

  return (
    <Ctx.Provider
      value={{
        ...state,
        itemCount,
        subtotal,
        addItem: (p, vid, qty = 1) => dispatch({ type: "ADD", product: p, variantId: vid, qty }),
        removeItem: (h, vid) => dispatch({ type: "REMOVE", handle: h, variantId: vid }),
        updateQty: (h, vid, qty) => dispatch({ type: "UPDATE", handle: h, variantId: vid, qty }),
        openCart: () => dispatch({ type: "OPEN" }),
        closeCart: () => dispatch({ type: "CLOSE" }),
        clear: () => dispatch({ type: "CLEAR" }),
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useCart(): CartCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
}
