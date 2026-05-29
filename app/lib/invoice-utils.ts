import type { AdminPayment } from "./payments-api";

const formatETB = (amount: number) =>
  `ETB ${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function generateInvoiceHtml(payment: AdminPayment): string {
  const paidDate = payment.paidAt
    ? new Date(payment.paidAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date(payment.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  const subtotal = payment.amount - payment.tax - payment.fees;
  const statusLabel = payment.status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Invoice ${payment.invoiceNumber}</title>
<style>
  @page { margin: 20mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    font-size: 14px;
    line-height: 1.6;
    color: #1f2937;
    background: #fff;
    padding: 40px;
  }
  .invoice-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding-bottom: 24px;
    border-bottom: 2px solid #2563eb;
    margin-bottom: 24px;
  }
  .invoice-header h1 {
    font-size: 28px;
    font-weight: 700;
    color: #2563eb;
  }
  .invoice-header .badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 9999px;
    font-size: 12px;
    font-weight: 600;
    background: #dbeafe;
    color: #1e40af;
  }
  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    margin-bottom: 32px;
  }
  .info-grid h3 {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #6b7280;
    margin-bottom: 4px;
  }
  .info-grid p { font-weight: 500; }
  .info-grid .muted { font-weight: 400; color: #6b7280; font-size: 13px; }
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 32px;
  }
  th {
    background: #f9fafb;
    text-align: left;
    padding: 10px 12px;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #6b7280;
    border-bottom: 1px solid #e5e7eb;
  }
  td {
    padding: 10px 12px;
    border-bottom: 1px solid #e5e7eb;
  }
  td:last-child, th:last-child { text-align: right; }
  .amount { font-weight: 600; text-align: right; }
  .totals { margin-left: auto; width: 280px; }
  .totals table { margin-bottom: 0; }
  .totals td { border-bottom: none; padding: 6px 12px; }
  .totals .grand-total td {
    font-size: 16px;
    font-weight: 700;
    border-top: 2px solid #1f2937;
    padding-top: 10px;
  }
  .footer {
    margin-top: 40px;
    padding-top: 16px;
    border-top: 1px solid #e5e7eb;
    font-size: 12px;
    color: #9ca3af;
    text-align: center;
  }
  @media print {
    body { padding: 0; }
    .no-print { display: none; }
  }
  @media (max-width: 600px) {
    body { padding: 16px; }
    .info-grid { grid-template-columns: 1fr; }
  }
</style>
</head>
<body>
  <div class="invoice-header">
    <div>
      <h1>INVOICE</h1>
      <p style="color:#6b7280;font-size:13px;margin-top:4px;">${payment.invoiceNumber}</p>
    </div>
    <div style="text-align:right;">
      <div class="badge">${statusLabel}</div>
    </div>
  </div>

  <div class="info-grid">
    <div>
      <h3>From</h3>
      <p>Car Rental System</p>
      <p class="muted">support@carrental.com</p>
    </div>
    <div>
      <h3>Bill To</h3>
      <p>${payment.customerName}</p>
      <p class="muted">${payment.customerEmail}</p>
    </div>
    <div>
      <h3>Booking</h3>
      <p>${payment.bookingCode}</p>
    </div>
    <div>
      <h3>Date</h3>
      <p>${paidDate}</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:60%;">Description</th>
        <th style="width:20%;">Method</th>
        <th style="width:20%;">Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Booking Payment</td>
        <td>${payment.method.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</td>
        <td class="amount">${formatETB(payment.amount)}</td>
      </tr>
      ${payment.fees > 0 ? `<tr><td>Service Fees</td><td></td><td class="amount">${formatETB(payment.fees)}</td></tr>` : ""}
      <tr>
        <td>Subtotal</td>
        <td></td>
        <td class="amount">${formatETB(subtotal)}</td>
      </tr>
    </tbody>
  </table>

  <div class="totals">
    <table>
      <tr>
        <td>Subtotal</td>
        <td class="amount">${formatETB(subtotal)}</td>
      </tr>
      <tr>
        <td>Tax</td>
        <td class="amount">${formatETB(payment.tax)}</td>
      </tr>
      ${payment.fees > 0 ? `<tr><td>Fees</td><td class="amount">${formatETB(payment.fees)}</td></tr>` : ""}
      <tr class="grand-total">
        <td>Total</td>
        <td class="amount">${formatETB(payment.amount)}</td>
      </tr>
      <tr>
        <td>Transaction ID</td>
        <td class="amount" style="font-size:12px;font-weight:400;">${payment.transactionId ?? "—"}</td>
      </tr>
    </table>
  </div>

  <div class="footer">
    <p>Thank you for your business</p>
    <p style="margin-top:4px;">Invoice ${payment.invoiceNumber} generated on ${new Date().toLocaleDateString()}</p>
  </div>
</body>
</html>`;
}

export function downloadInvoiceAsHtml(payment: AdminPayment): void {
  const html = generateInvoiceHtml(payment);
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${payment.invoiceNumber}.html`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function downloadInvoiceAsPdf(payment: AdminPayment): void {
  const html = generateInvoiceHtml(payment);
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 500);
}
