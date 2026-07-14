import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from "react";
import type { Product } from "./products";
import {
  cartCreate,
  cartLinesAdd,
  cartLinesRemove,
  cartLinesUpdate,
} from "./shopify-fns";

export type CartItem = {
  product: Product;
  variantId: string;
  quantity: number;
  lineId?: string; // Shopify cart line ID, set after first sync
};

type State = {
  items: CartItem[];
  isOpen: boolean;
  cartId: string | null;
  checkoutUrl: string | null;
};

type Action =
  | { type: "ADD"; product: Product; variantId: string; qty: number }
  | { type: "REMOVE"; handle: string; variantId: string }
  | { type: "UPDATE"; handle: string; variantId: string; qty: number }
  | { type: "OPEN" }
  | { type: "CLOSE" }
  | { type: "CLEAR" }
  | {
      type: "SYNCED";
      cartId: string;
      checkoutUrl: string;
      lines: Array<{ lineId: string; variantId: string; quantity: number }>;
    };

function key(handle: string, variantId: string) {
  return `${handle}::${variantId}`;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD": {
      const idx = state.items.findIndex(
        (i) => key(i.product.handle, i.variantId) === key(action.product.handle, action.variantId),
      );
      const items = [...state.items];
      if (idx >= 0) {
        items[idx] = { ...items[idx], quantity: items[idx].quantity + action.qty };
      } else {
        items.push({ product: action.product, variantId: action.variantId, quantity: action.qty });
      }
      return { ...state, items, isOpen: true };
    }
    case "REMOVE":
      return {
        ...state,
        items: state.items.filter(
          (i) => key(i.product.handle, i.variantId) !== key(action.handle, action.variantId),
        ),
      };
    case "UPDATE": {
      if (action.qty <= 0) {
        return {
          ...state,
          items: state.items.filter(
            (i) => key(i.product.handle, i.variantId) !== key(action.handle, action.variantId),
          ),
        };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          key(i.product.handle, i.variantId) === key(action.handle, action.variantId)
            ? { ...i, quantity: action.qty }
            : i,
        ),
      };
    }
    case "OPEN":  return { ...state, isOpen: true };
    case "CLOSE": return { ...state, isOpen: false };
    case "CLEAR": return { ...state, items: [], cartId: null, checkoutUrl: null };
    case "SYNCED": {
      // Stamp each item with its Shopify lineId so future updates/removes work.
      const lineMap = new Map(action.lines.map((l) => [l.variantId, l.lineId]));
      return {
        ...state,
        cartId: action.cartId,
        checkoutUrl: action.checkoutUrl,
        items: state.items.map((i) => ({
          ...i,
          lineId: lineMap.get(i.variantId) ?? i.lineId,
        })),
      };
    }
    default: return state;
  }
}

const STORAGE_KEY = "mmj_cart";

function loadPersistedCart(): Pick<State, "cartId" | "checkoutUrl"> {
  try {
    if (typeof window === "undefined") return { cartId: null, checkoutUrl: null };
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { cartId: null, checkoutUrl: null };
    return JSON.parse(raw) as Pick<State, "cartId" | "checkoutUrl">;
  } catch {
    return { cartId: null, checkoutUrl: null };
  }
}

function persistCart(cartId: string | null, checkoutUrl: string | null) {
  try {
    if (typeof window === "undefined") return;
    if (cartId && checkoutUrl) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ cartId, checkoutUrl }));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch { /* ignore storage errors */ }
}

type CartCtx = {
  items: CartItem[];
  isOpen: boolean;
  itemCount: number;
  subtotal: number;
  cartId: string | null;
  checkoutUrl: string | null;
  addItem: (product: Product, variantId: string, qty?: number) => void;
  removeItem: (handle: string, variantId: string) => void;
  updateQty: (handle: string, variantId: string, qty: number) => void;
  openCart: () => void;
  closeCart: () => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const persisted = loadPersistedCart();
  const [state, dispatch] = useReducer(reducer, {
    items: [],
    isOpen: false,
    cartId: persisted.cartId,
    checkoutUrl: persisted.checkoutUrl,
  });

  // Persist cartId / checkoutUrl whenever they change.
  useEffect(() => {
    persistCart(state.cartId, state.checkoutUrl);
  }, [state.cartId, state.checkoutUrl]);

  // Sync a cart mutation result back into local state.
  const syncResult = useCallback(
    (res: Awaited<ReturnType<typeof cartCreate>>) => {
      dispatch({ type: "SYNCED", ...res });
    },
    [],
  );

  const addItem = useCallback(
    (product: Product, variantId: string, qty = 1) => {
      dispatch({ type: "ADD", product, variantId, qty });

      // Fire-and-forget Shopify sync (error → cart still works locally).
      void (async () => {
        try {
          const existing = state.items.find(
            (i) => key(i.product.handle, i.variantId) === key(product.handle, variantId),
          );
          if (state.cartId && existing?.lineId) {
            // Variant already in Shopify cart — update quantity.
            const res = await cartLinesUpdate({
              data: {
                cartId: state.cartId,
                lineId: existing.lineId,
                quantity: existing.quantity + qty,
              },
            });
            syncResult(res);
          } else if (state.cartId) {
            // Cart exists but this variant is new — add a line.
            const res = await cartLinesAdd({
              data: { cartId: state.cartId, variantId, quantity: qty },
            });
            syncResult(res);
          } else {
            // No cart yet — create one.
            const res = await cartCreate({ data: { variantId, quantity: qty } });
            syncResult(res);
          }
        } catch (err) {
          console.error("[cart] Shopify sync failed:", err);
        }
      })();
    },
    [state.cartId, state.items, syncResult],
  );

  const removeItem = useCallback(
    (handle: string, variantId: string) => {
      const item = state.items.find(
        (i) => key(i.product.handle, i.variantId) === key(handle, variantId),
      );
      dispatch({ type: "REMOVE", handle, variantId });

      if (state.cartId && item?.lineId) {
        void (async () => {
          try {
            const res = await cartLinesRemove({
              data: { cartId: state.cartId!, lineId: item.lineId! },
            });
            syncResult(res);
          } catch (err) {
            console.error("[cart] Shopify remove failed:", err);
          }
        })();
      }
    },
    [state.cartId, state.items, syncResult],
  );

  const updateQty = useCallback(
    (handle: string, variantId: string, qty: number) => {
      const item = state.items.find(
        (i) => key(i.product.handle, i.variantId) === key(handle, variantId),
      );
      dispatch({ type: "UPDATE", handle, variantId, qty });

      if (state.cartId && item?.lineId) {
        void (async () => {
          try {
            if (qty <= 0) {
              const res = await cartLinesRemove({
                data: { cartId: state.cartId!, lineId: item.lineId! },
              });
              syncResult(res);
            } else {
              const res = await cartLinesUpdate({
                data: { cartId: state.cartId!, lineId: item.lineId!, quantity: qty },
              });
              syncResult(res);
            }
          } catch (err) {
            console.error("[cart] Shopify update failed:", err);
          }
        })();
      }
    },
    [state.cartId, state.items, syncResult],
  );

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
        addItem,
        removeItem,
        updateQty,
        openCart:  () => dispatch({ type: "OPEN" }),
        closeCart: () => dispatch({ type: "CLOSE" }),
        clear:     () => { dispatch({ type: "CLEAR" }); },
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
