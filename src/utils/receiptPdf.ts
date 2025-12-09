// src/utils/receiptPdf.ts
import { Alert, Platform } from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

export interface ReceiptItem {
  description: string;
  quantity: number;
  price: number;
}

export interface ReceiptData {
  receiptNumber: string;
  receiptDate: string;
  customerName: string;
  customerAddress?: string;
  customerPhone?: string;
  items: ReceiptItem[];
  tax: number;
  shipping: number;
  discount?: number; // Added discount field
  notes?: string;
}

// --- HELPER: Print on Web (Hidden Iframe Method) ---
const printOnWeb = (html: string) => {
  try {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const iframe = document.createElement('iframe');
    
    iframe.style.position = 'fixed';
    iframe.style.top = '0';
    iframe.style.left = '0';
    iframe.style.width = '58mm'; 
    iframe.style.height = '100vh';
    iframe.style.border = 'none';
    iframe.style.opacity = '0';
    iframe.style.zIndex = '-1000';
    iframe.style.pointerEvents = 'none';
    
    iframe.src = url;

    iframe.onload = () => {
      const win = iframe.contentWindow;
      if (win) {
        win.focus();
        win.print();
      }
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
        URL.revokeObjectURL(url);
      }, 5000);
    };

    document.body.appendChild(iframe);
  } catch (error) {
    console.error("Web print error:", error);
    alert("Could not open print dialog.");
  }
};

// --- TEMPLATE 1: MONIEPOINT-STYLE THERMAL RECEIPT (Restored Design) ---
const getThermalHTML = (data: ReceiptData) => {
  const { receiptNumber, receiptDate, customerName, items, tax, shipping, discount = 0 } = data;
  const subTotal = items.reduce((sum, i) => sum + i.quantity * i.price, 0);
  const grandTotal = subTotal - discount + tax + shipping;

  const rowsHtml = items.map((item) => `
      <div style="margin-bottom: 4px;">
          <div style="display:flex; justify-content:space-between; font-weight:bold;">
             <span>${item.description}</span>
             <span>${(item.quantity * item.price).toLocaleString()}</span>
          </div>
          <div style="font-size: 9px;">${item.quantity} x ${item.price.toLocaleString()}</div>
      </div>
  `).join("");

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Receipt</title>
        <style>
          @media print {
            @page { margin: 0; size: auto; }
            body { margin: 0; padding: 0; }
          }
          body {
            font-family: 'Courier New', monospace;
            background: #fff;
            color: #000;
            font-size: 10px; 
            line-height: 1.3;
            width: 100%;
            margin: 0;
            font-weight: bold;
            text-transform: uppercase;
          }
          .receipt {
            width: 100%;
            max-width: 58mm;
            margin: 0 auto;
            padding: 5px 0;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .text-center { text-align: center; }
          .row { display: flex; justify-content: space-between; width: 100%; }
          
          .divider-stars { margin: 5px 0; letter-spacing: 2px; }
          .divider-dots { margin: 5px 0; letter-spacing: 2px; }
          
          .big-amt { font-size: 16px; font-weight: 900; margin: 5px 0; }
          .approved { font-size: 14px; font-weight: 900; margin-top: 2px; }
          
          .items-container { width: 100%; margin: 5px 0; text-align: left; }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="text-center" style="font-size: 9px; margin-bottom: 5px;">**** CUSTOMER'S COPY ****</div>
          
          <div class="text-center" style="font-size: 14px; font-weight: 900; margin-bottom: 2px;">BRAHMOK AGRO</div>
          <div class="text-center" style="font-size: 12px; margin-bottom: 2px;">INVESTMENT COMPANY LTD</div>
          
          <div class="text-center" style="font-size: 9px; margin-bottom: 5px;">
            Shop 6, Adeniji Shopping Complex,<br/>
            Idi-omo, Lagere, Ile Ife, Osun <br/>
            08036946391, 07036065342
          </div>

          <div class="text-center" style="font-size: 12px; font-weight: 900; margin-top: 5px; margin-bottom: 5px;">SALES RECEIPT</div>

          <div class="row">
            <span>RECEIPT NO:</span>
            <span>${receiptNumber}</span>
          </div>
          <div class="row">
            <span>DATE:</span>
            <span>${receiptDate}</span>
          </div>
          <div class="row">
            <span>CUSTOMER:</span>
            <span>${customerName.substring(0, 15)}</span>
          </div>

          <div class="divider-dots">........................</div>

          <div class="items-container">
            ${rowsHtml}
          </div>

          <div class="divider-stars">************************</div>

          ${discount > 0 ? `
            <div class="row">
              <span>SUBTOTAL:</span>
              <span>${subTotal.toLocaleString()}</span>
            </div>
            <div class="row">
              <span>DISCOUNT (10%):</span>
              <span>-${discount.toLocaleString()}</span>
            </div>
            <div class="divider-dots">........................</div>
          ` : ''}

          <div class="big-amt">NGN ${grandTotal.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</div>

          <div class="divider-stars">************************</div>

          <div class="approved">APPROVED</div>
          <div class="text-center" style="font-size: 9px; margin-top: 5px;">THANKS, CALL AGAIN!</div>
          <div class="divider-dots">........................</div>
        </div>
      </body>
    </html>
  `;
};

// --- TEMPLATE 2: STANDARD A4/PDF RECEIPT (Restored Design) ---
const getStandardHTML = (data: ReceiptData) => {
  const { receiptNumber, receiptDate, customerName, customerAddress, customerPhone, items, tax, shipping, discount = 0, notes } = data;
  const subTotal = items.reduce((sum, i) => sum + i.quantity * i.price, 0);
  const grandTotal = subTotal - discount + tax + shipping;

  const rowsHtml = items.length > 0
    ? items.map((item, index) => {
        const lineTotal = item.quantity * item.price;
        return `
          <tr>
            <td style="padding:8px 6px; border-bottom:1px solid #E5E7EB; text-align:center;">${index + 1}</td>
            <td style="padding:8px 6px; border-bottom:1px solid #E5E7EB;">${item.description}</td>
            <td style="padding:8px 6px; border-bottom:1px solid #E5E7EB; text-align:center;">${item.quantity}</td>
            <td style="padding:8px 6px; border-bottom:1px solid #E5E7EB; text-align:right;">₦${item.price.toLocaleString()}</td>
            <td style="padding:8px 6px; border-bottom:1px solid #E5E7EB; text-align:right;">₦${lineTotal.toLocaleString()}</td>
          </tr>
        `;
      }).join("")
    : `<tr><td colspan="5" style="padding:10px; text-align:center; color:#6B7280;">No items</td></tr>`;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Receipt ${receiptNumber}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial; background:#F3F4F6; padding:24px;">
        <div style="max-width:700px; margin:0 auto; background:#ffffff; border-radius:12px; padding:24px; box-shadow:0 10px 30px rgba(15,23,42,0.12);">
          <div style="display:flex; justify-content:space-between; margin-bottom:20px;">
            <div>
              <h1 style="margin:0; font-size:20px; color:#111827;">BRAHMOK AGRO INVESTMENT CO. [NIG] LIMITED</h1>
              <p style="margin:6px 0 0 0; font-size:12px; color:#4B5563; line-height:1.5;">
                Shop 6, Adeniji Shopping Complex Idi-omo, Lagere,<br/>
                Ile Ife, Osun State, Nigeria
              </p>
            </div>
            <div style="text-align:right;">
              <div style="font-size:24px; font-weight:700; color:#111827;">RECEIPT</div>
              <div style="margin-top:8px; font-size:12px; color:#4B5563;">
                <div><strong>No:</strong> ${receiptNumber}</div>
                <div><strong>Date:</strong> ${receiptDate}</div>
              </div>
            </div>
          </div>
          <hr style="border:none; border-top:1px solid #E5E7EB; margin-bottom:16px;" />
          <div style="display:flex; justify-content:space-between; margin-bottom:20px; font-size:13px;">
            <div style="flex:1; margin-right:16px;">
              <div style="font-weight:600; color:#111827; margin-bottom:4px;">Billed To:</div>
              <div style="color:#374151;">
                <div>${customerName || "-"}</div>
                ${customerAddress ? `<div style="margin-top:4px;">${customerAddress}</div>` : ""}
                ${customerPhone ? `<div style="margin-top:4px;">Phone: ${customerPhone}</div>` : ""}
              </div>
            </div>
            <div style="flex:1; text-align:right; color:#6B7280;">
              <div style="font-size:12px;">Payment Status: <strong>PAID</strong></div>
            </div>
          </div>
          <table style="width:100%; border-collapse:collapse; font-size:13px; margin-bottom:18px;">
            <thead>
              <tr style="background:#F9FAFB; border-bottom:1px solid #E5E7EB;">
                <th style="padding:8px 6px; text-align:center; font-weight:600; color:#4B5563;">#</th>
                <th style="padding:8px 6px; text-align:left; font-weight:600; color:#4B5563;">Description</th>
                <th style="padding:8px 6px; text-align:center; font-weight:600; color:#4B5563;">Qty</th>
                <th style="padding:8px 6px; text-align:right; font-weight:600; color:#4B5563;">Unit Price</th>
                <th style="padding:8px 6px; text-align:right; font-weight:600; color:#4B5563;">Amount</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
          <div style="display:flex; justify-content:flex-end; margin-bottom:20px;">
            <table style="font-size:13px;">
              <tr><td style="padding:4px 12px; text-align:right; color:#6B7280;">Subtotal</td><td style="padding:4px 0; text-align:right; min-width:120px;">₦${subTotal.toLocaleString()}</td></tr>
              
              ${discount > 0 ? `
              <tr>
                <td style="padding:4px 12px; text-align:right; color:#DC2626;">Discount (10%)</td>
                <td style="padding:4px 0; text-align:right; color:#DC2626;">-₦${discount.toLocaleString()}</td>
              </tr>
              ` : ''}

              <tr><td style="padding:4px 12px; text-align:right; color:#6B7280;">Tax</td><td style="padding:4px 0; text-align:right;">₦${tax.toLocaleString()}</td></tr>
              <tr><td style="padding:4px 12px; text-align:right; color:#6B7280;">Shipping</td><td style="padding:4px 0; text-align:right;">₦${shipping.toLocaleString()}</td></tr>
              <tr><td style="padding:8px 12px; text-align:right; font-weight:700; border-top:1px solid #E5E7EB;">Total</td><td style="padding:8px 0; text-align:right; font-weight:700; border-top:1px solid #E5E7EB; font-size:15px;">₦${grandTotal.toLocaleString()}</td></tr>
            </table>
          </div>
          ${notes ? `<div style="margin-bottom:16px; font-size:12px; color:#4B5563;"><strong>Notes:</strong><div style="margin-top:4px;">${notes}</div></div>` : ""}
          <div style="margin-top:24px; font-size:11px; color:#9CA3AF; text-align:center;">This receipt was generated electronically and is valid without a signature.</div>
        </div>
      </body>
    </html>
  `;
};

// --- MAIN FUNCTION ---
export async function generateReceiptPdf(data: ReceiptData) {
  try {
    // 1. IF WEB: Use Thermal Template & Web Print
    if (Platform.OS === "web") {
      const thermalHtml = getThermalHTML(data);
      printOnWeb(thermalHtml);
      return;
    }

    // 2. IF MOBILE: Use Standard PDF Template & Native Print/Share
    const standardHtml = getStandardHTML(data);
    
    const { uri } = await Print.printToFileAsync({ html: standardHtml });
    if (!(await Sharing.isAvailableAsync())) {
      Alert.alert("Receipt saved", `PDF saved here:\n${uri}`);
      return;
    }

    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      dialogTitle: `Share Receipt #${data.receiptNumber}`,
    });
  } catch (error) {
    console.error("Receipt error", error);
    Alert.alert("Error", "Could not generate receipt. Please try again.");
  }
}