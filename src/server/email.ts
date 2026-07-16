// Server-only — RESEND_API_KEY must never appear in client bundles.
import { Resend } from "resend";

export type OrderEmailData = {
  to: string;
  orderNumber: number;
  customer: { firstName: string; lastName: string };
  items: Array<{ title: string; quantity: number; priceAed: number }>;
  address: { line1: string; city: string; emirate: string };
  deliveryFeeAed: number;
  totalAed: number;
};

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY is not set");
    _resend = new Resend(key);
  }
  return _resend;
}

export async function sendOrderConfirmation(data: OrderEmailData): Promise<void> {
  const { error } = await getResend().emails.send({
    from: "Curated by MMJ <orders@curatedbymmj.ae>",
    to: [data.to],
    subject: `Order confirmed · #${data.orderNumber}`,
    html: buildEmailHtml(data),
  });

  if (error) {
    throw new Error(`Resend API error: ${JSON.stringify(error)}`);
  }
}

function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildEmailHtml(data: OrderEmailData): string {
  const { orderNumber, customer, items, address, deliveryFeeAed, totalAed } = data;

  const itemsHtml = items
    .map((item) => {
      const lineTotal = item.priceAed * item.quantity;
      const qtyLine = item.quantity > 1 ? `Qty ${item.quantity} &times; AED ${item.priceAed}` : `Qty 1`;
      return `
        <table width="100%" cellpadding="0" cellspacing="0" border="0"
               style="border:1px solid rgba(11,95,165,0.09);border-radius:10px;margin-bottom:8px;">
          <tr>
            <td style="padding:14px 16px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;
                             font-size:14px;color:#0B5FA5;line-height:1.4;padding-right:16px;">
                    ${esc(item.title)}
                  </td>
                  <td align="right" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',
                             Helvetica,Arial,sans-serif;font-size:14px;color:#0B5FA5;
                             white-space:nowrap;vertical-align:top;">
                    AED ${lineTotal}
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',
                             Helvetica,Arial,sans-serif;font-size:12px;color:#9ab8d0;padding-top:3px;">
                    ${qtyLine}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <title>Order Confirmed &middot; Curated by MMJ</title>
  <!--[if mso]><style>td{font-family:Arial,sans-serif!important;}</style><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#F8E6EC;" bgcolor="#F8E6EC">

  <!-- Email preview text (hidden) -->
  <span style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    Your order #${orderNumber} is confirmed &mdash; we&rsquo;ll have it with you next-day.&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </span>

  <table width="100%" cellpadding="0" cellspacing="0" border="0"
         style="background-color:#F8E6EC;min-width:320px;" bgcolor="#F8E6EC">
    <tr>
      <td align="center" style="padding:40px 16px 48px;">

        <!-- Card: max 560px -->
        <table width="560" cellpadding="0" cellspacing="0" border="0"
               style="width:100%;max-width:560px;">

          <!-- ══ HEADER ══ -->
          <tr>
            <td style="background-color:#0B5FA5;border-radius:20px 20px 0 0;
                       padding:32px 40px;text-align:center;" bgcolor="#0B5FA5">
              <p style="margin:0 0 4px 0;font-family:Georgia,'Times New Roman',Times,serif;
                        font-size:11px;color:rgba(255,255,255,0.6);
                        letter-spacing:0.3em;text-transform:uppercase;">
                Curated by
              </p>
              <p style="margin:0;font-family:Georgia,'Times New Roman',Times,serif;
                        font-size:26px;color:#FFFFFF;letter-spacing:0.1em;
                        text-transform:uppercase;font-weight:400;">
                MMJ
              </p>
            </td>
          </tr>

          <!-- ══ BODY ══ -->
          <tr>
            <td style="background-color:#FFFFFF;" bgcolor="#FFFFFF">

              <!-- Confirmation hero -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:44px 40px 32px;text-align:center;
                             border-bottom:1px solid rgba(11,95,165,0.07);">
                    <p style="margin:0 0 8px 0;font-family:Georgia,'Times New Roman',Times,serif;
                              font-size:30px;color:#0B5FA5;font-weight:400;line-height:1.2;">
                      Order confirmed &#10003;
                    </p>
                    <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',
                              Helvetica,Arial,sans-serif;font-size:13px;color:#9ab8d0;">
                      Order #${orderNumber}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Items -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:28px 40px 8px;">
                    <p style="margin:0 0 14px 0;font-family:-apple-system,BlinkMacSystemFont,
                              'Segoe UI',Helvetica,Arial,sans-serif;font-size:10px;
                              color:#9ab8d0;letter-spacing:0.22em;text-transform:uppercase;">
                      Your order
                    </p>
                    ${itemsHtml}
                  </td>
                </tr>
              </table>

              <!-- Delivery + totals -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:8px 40px 36px;
                             border-top:1px solid rgba(11,95,165,0.07);">

                    <p style="margin:20px 0 8px 0;font-family:-apple-system,BlinkMacSystemFont,
                              'Segoe UI',Helvetica,Arial,sans-serif;font-size:10px;
                              color:#9ab8d0;letter-spacing:0.22em;text-transform:uppercase;">
                      Delivery to
                    </p>
                    <p style="margin:0 0 20px 0;font-family:-apple-system,BlinkMacSystemFont,
                              'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;
                              color:#0B5FA5;line-height:1.65;">
                      ${esc(address.line1)}<br>
                      ${esc(address.city)}, ${esc(address.emirate)}
                    </p>

                    <!-- Delivery row -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',
                                  Helvetica,Arial,sans-serif;font-size:13px;color:#9ab8d0;
                                  padding:7px 0;">
                          Delivery &middot; Next-day delivery
                        </td>
                        <td align="right" style="font-family:-apple-system,BlinkMacSystemFont,
                                  'Segoe UI',Helvetica,Arial,sans-serif;font-size:13px;
                                  color:#9ab8d0;padding:7px 0;white-space:nowrap;">
                          AED ${deliveryFeeAed}
                        </td>
                      </tr>
                    </table>

                    <!-- Divider -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="border-top:1px solid rgba(11,95,165,0.1);
                                   height:1px;font-size:0;line-height:0;">&nbsp;</td>
                      </tr>
                    </table>

                    <!-- Total -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="font-family:Georgia,'Times New Roman',Times,serif;
                                  font-size:15px;color:#0B5FA5;padding:13px 0 0;
                                  font-weight:400;">
                          Total
                        </td>
                        <td align="right" style="font-family:Georgia,'Times New Roman',
                                  Times,serif;font-size:20px;color:#0B5FA5;
                                  padding:11px 0 0;font-weight:400;">
                          AED ${totalAed}
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>

              <!-- Closing -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:32px 40px 44px;text-align:center;
                             border-top:1px solid rgba(11,95,165,0.07);">
                    <p style="margin:0 0 12px 0;font-family:Georgia,'Times New Roman',
                              Times,serif;font-size:22px;color:#0B5FA5;
                              font-style:italic;font-weight:400;">
                      Make it happen.
                    </p>
                    <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',
                              Helvetica,Arial,sans-serif;font-size:13px;color:#9ab8d0;
                              line-height:1.65;">
                      Thank you for your order, ${esc(customer.firstName)}.<br>
                      Your notebook will be with you next-day.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- ══ FOOTER ══ -->
          <tr>
            <td style="background-color:#f3dde4;border-radius:0 0 20px 20px;
                       padding:18px 40px;text-align:center;" bgcolor="#f3dde4">
              <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',
                        Helvetica,Arial,sans-serif;font-size:12px;color:#9ab8d0;
                        line-height:1.6;">
                Questions?&nbsp;
                <a href="mailto:hello@curatedbymmj.ae"
                   style="color:#0B5FA5;text-decoration:none;">hello@curatedbymmj.ae</a>
                &nbsp;&middot;&nbsp;
                &copy; ${new Date().getFullYear()} Curated by MMJ
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
}
