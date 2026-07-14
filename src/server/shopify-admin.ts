type LineItem = { variantGid: string; quantity: number; price: number };

export type AdminCustomer = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  emirate: string;
};

function gidToNumericId(gid: string): number {
  return parseInt(gid.split("/").pop() ?? "0", 10);
}

export async function adminCreateOrder(params: {
  lineItems: LineItem[];
  customer: AdminCustomer;
  totalAmount: number;
  paymentIntentId: string;
}): Promise<{ id: number; orderNumber: number }> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_ADMIN_TOKEN;
  if (!domain || !token) throw new Error("Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_ADMIN_TOKEN");

  const { lineItems, customer, totalAmount, paymentIntentId } = params;

  const body = {
    order: {
      line_items: lineItems.map((item) => ({
        variant_id: gidToNumericId(item.variantGid),
        quantity: item.quantity,
        price: item.price.toFixed(2),
      })),
      customer: {
        first_name: customer.firstName,
        last_name: customer.lastName,
        email: customer.email,
        phone: customer.phone,
      },
      shipping_address: {
        first_name: customer.firstName,
        last_name: customer.lastName,
        address1: customer.address,
        city: customer.city,
        province: customer.emirate,
        country: "AE",
        phone: customer.phone,
      },
      billing_address: {
        first_name: customer.firstName,
        last_name: customer.lastName,
        address1: customer.address,
        city: customer.city,
        province: customer.emirate,
        country: "AE",
      },
      email: customer.email,
      financial_status: "paid",
      send_receipt: true,
      transactions: [
        {
          kind: "sale",
          status: "success",
          amount: totalAmount.toFixed(2),
          gateway: "stripe",
          authorization: paymentIntentId,
        },
      ],
      note: `Stripe PaymentIntent: ${paymentIntentId}`,
      tags: "stripe-payment",
    },
  };

  const res = await fetch(
    `https://${domain}/admin/api/2024-10/orders.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": token,
      },
      body: JSON.stringify(body),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shopify Admin API ${res.status}: ${text}`);
  }

  const json = (await res.json()) as {
    order: { id: number; order_number: number };
  };
  return { id: json.order.id, orderNumber: json.order.order_number };
}
