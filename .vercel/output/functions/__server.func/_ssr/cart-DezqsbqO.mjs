import { o as __toESM } from "../_runtime.mjs";
import { r as require_react } from "../_libs/@hookform/resolvers+[...].mjs";
import { d as require_jsx_runtime } from "../_libs/@react-three/drei+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/cart-DezqsbqO.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function reducer(state, action) {
	switch (action.type) {
		case "ADD": {
			const idx = state.items.findIndex((i) => i.product.handle === action.product.handle && i.variantId === action.variantId);
			const items = [...state.items];
			if (idx >= 0) items[idx] = {
				...items[idx],
				quantity: items[idx].quantity + action.qty
			};
			else items.push({
				product: action.product,
				variantId: action.variantId,
				quantity: action.qty
			});
			return {
				items,
				isOpen: true
			};
		}
		case "REMOVE": return {
			...state,
			items: state.items.filter((i) => !(i.product.handle === action.handle && i.variantId === action.variantId))
		};
		case "UPDATE":
			if (action.qty <= 0) return {
				...state,
				items: state.items.filter((i) => !(i.product.handle === action.handle && i.variantId === action.variantId))
			};
			return {
				...state,
				items: state.items.map((i) => i.product.handle === action.handle && i.variantId === action.variantId ? {
					...i,
					quantity: action.qty
				} : i)
			};
		case "OPEN": return {
			...state,
			isOpen: true
		};
		case "CLOSE": return {
			...state,
			isOpen: false
		};
		case "CLEAR": return {
			...state,
			items: []
		};
		default: return state;
	}
}
var Ctx = (0, import_react.createContext)(null);
function CartProvider({ children }) {
	const [state, dispatch] = (0, import_react.useReducer)(reducer, {
		items: [],
		isOpen: false
	});
	const itemCount = state.items.reduce((n, i) => n + i.quantity, 0);
	const subtotal = state.items.reduce((n, i) => {
		return n + (i.product.variants.find((v) => v.id === i.variantId)?.price ?? i.product.price) * i.quantity;
	}, 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ctx.Provider, {
		value: {
			...state,
			itemCount,
			subtotal,
			addItem: (p, vid, qty = 1) => dispatch({
				type: "ADD",
				product: p,
				variantId: vid,
				qty
			}),
			removeItem: (h, vid) => dispatch({
				type: "REMOVE",
				handle: h,
				variantId: vid
			}),
			updateQty: (h, vid, qty) => dispatch({
				type: "UPDATE",
				handle: h,
				variantId: vid,
				qty
			}),
			openCart: () => dispatch({ type: "OPEN" }),
			closeCart: () => dispatch({ type: "CLOSE" }),
			clear: () => dispatch({ type: "CLEAR" })
		},
		children
	});
}
function useCart() {
	const ctx = (0, import_react.useContext)(Ctx);
	if (!ctx) throw new Error("useCart must be inside CartProvider");
	return ctx;
}
//#endregion
export { useCart as n, CartProvider as t };
