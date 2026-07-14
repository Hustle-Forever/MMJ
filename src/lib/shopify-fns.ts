// createServerFn wrappers — callable from client code; internals run server-side.
import { createServerFn } from "@tanstack/react-start";
import type { ShopifyCart } from "@/server/shopify";

export type CartSyncResult = {
  cartId: string;
  checkoutUrl: string;
  lines: Array<{ lineId: string; variantId: string; quantity: number }>;
};

function toCartSyncResult(cart: ShopifyCart): CartSyncResult {
  return {
    cartId: cart.id,
    checkoutUrl: cart.checkoutUrl,
    lines: cart.lines.edges.map((e) => ({
      lineId: e.node.id,
      variantId: e.node.merchandise.id,
      quantity: e.node.quantity,
    })),
  };
}

// ── Products ──────────────────────────────────────────────────────────────────

export const fetchProducts = createServerFn().handler(async () => {
  const { gqlProducts } = await import("@/server/shopify");
  return gqlProducts();
});

export const fetchProduct = createServerFn()
  .validator((handle: unknown) => handle as string)
  .handler(async ({ data: handle }) => {
    const { gqlProduct } = await import("@/server/shopify");
    return gqlProduct(handle);
  });

// ── Cart ──────────────────────────────────────────────────────────────────────

export const cartCreate = createServerFn()
  .validator(
    (d: unknown) => d as { variantId: string; quantity: number },
  )
  .handler(async ({ data }) => {
    const { gqlCartCreate } = await import("@/server/shopify");
    const cart = await gqlCartCreate(data.variantId, data.quantity);
    return toCartSyncResult(cart);
  });

export const cartLinesAdd = createServerFn()
  .validator(
    (d: unknown) => d as { cartId: string; variantId: string; quantity: number },
  )
  .handler(async ({ data }) => {
    const { gqlCartLinesAdd } = await import("@/server/shopify");
    const cart = await gqlCartLinesAdd(data.cartId, data.variantId, data.quantity);
    return toCartSyncResult(cart);
  });

export const cartLinesRemove = createServerFn()
  .validator(
    (d: unknown) => d as { cartId: string; lineId: string },
  )
  .handler(async ({ data }) => {
    const { gqlCartLinesRemove } = await import("@/server/shopify");
    const cart = await gqlCartLinesRemove(data.cartId, [data.lineId]);
    return toCartSyncResult(cart);
  });

export const cartLinesUpdate = createServerFn()
  .validator(
    (d: unknown) => d as { cartId: string; lineId: string; quantity: number },
  )
  .handler(async ({ data }) => {
    const { gqlCartLinesUpdate } = await import("@/server/shopify");
    const cart = await gqlCartLinesUpdate(data.cartId, data.lineId, data.quantity);
    return toCartSyncResult(cart);
  });
