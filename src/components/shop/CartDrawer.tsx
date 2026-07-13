import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQty, subtotal, itemCount } = useCart();

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        className="fixed inset-0 bg-blue/8 backdrop-blur-sm transition-opacity ease-soft duration-(--duration-slow)"
        style={{ opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? "auto" : "none", zIndex: "var(--z-drawer)" }}
        onClick={closeCart}
      />

      {/* Drawer */}
      <aside
        aria-label="Shopping cart"
        aria-hidden={!isOpen}
        className="fixed inset-y-0 right-0 flex w-full max-w-md flex-col"
        style={{
          zIndex: "var(--z-drawer)",
          background: "color-mix(in oklab, var(--blush) 94%, var(--white))",
          backdropFilter: "blur(24px)",
          boxShadow: isOpen ? "-8px 0 64px -16px rgba(11,95,165,0.14)" : "none",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform var(--duration-slow) var(--ease-soft)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-blue/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-4 w-4 text-blue" aria-hidden />
            <span className="text-caption uppercase tracking-caps text-blue">
              Cart · {itemCount} {itemCount === 1 ? "item" : "items"}
            </span>
          </div>
          <button
            onClick={closeCart}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-blue/40 transition hover:text-blue"
            aria-label="Close cart"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <ShoppingBag className="h-10 w-10 text-blue/15" aria-hidden />
              <p className="text-caption text-blue/40">Your cart is empty</p>
              <button
                onClick={closeCart}
                className="text-caption uppercase tracking-caps text-blue/50 underline-offset-4 hover:underline"
              >
                Continue shopping
              </button>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => {
                const variant = item.product.variants.find((v) => v.id === item.variantId);
                const linePrice = (variant?.price ?? item.product.price) * item.quantity;
                return (
                  <li
                    key={`${item.product.handle}-${item.variantId}`}
                    className="flex gap-4 rounded-2xl bg-white/60 p-4 ring-1 ring-blue/8"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.title}
                      className="h-16 w-12 rounded-lg object-cover"
                      draggable={false}
                    />
                    <div className="flex flex-1 flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-caption font-medium text-blue">{item.product.title}</p>
                          <p className="text-[11px] text-blue/40">{variant?.title ?? item.product.colorLabel}</p>
                        </div>
                        <button
                          onClick={() => removeItem(item.product.handle, item.variantId)}
                          className="mt-0.5 text-blue/25 transition hover:text-blue"
                          aria-label={`Remove ${item.product.title}`}
                        >
                          <X className="h-3 w-3" aria-hidden />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="inline-flex items-center gap-1 rounded-full bg-white/80 px-1 py-0.5 ring-1 ring-blue/10">
                          <button
                            onClick={() => updateQty(item.product.handle, item.variantId, item.quantity - 1)}
                            className="flex h-6 w-6 items-center justify-center rounded-full text-blue/50 transition hover:text-blue"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" aria-hidden />
                          </button>
                          <span className="min-w-[1.5rem] text-center text-caption text-blue">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQty(item.product.handle, item.variantId, item.quantity + 1)}
                            className="flex h-6 w-6 items-center justify-center rounded-full text-blue/50 transition hover:text-blue"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" aria-hidden />
                          </button>
                        </div>
                        <span className="text-caption text-blue">AED {linePrice}</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="space-y-4 border-t border-blue/10 px-6 py-5">
            <div className="flex items-center justify-between">
              <span className="text-caption uppercase tracking-caps text-blue/50">Subtotal</span>
              <span className="font-display text-h3 text-blue">AED {subtotal}</span>
            </div>
            <Link
              to="/checkout"
              onClick={closeCart}
              className="block w-full rounded-full bg-blue py-4 text-center text-caption uppercase tracking-caps text-white transition-opacity hover:opacity-90"
            >
              Checkout
            </Link>
            <p className="text-center text-[11px] text-blue/35">
              Taxes and shipping calculated at checkout
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
