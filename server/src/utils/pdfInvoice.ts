import PDFDocument from 'pdfkit';
import { Response } from 'express';

interface InvoiceOrderData {
  orderNumber: string;
  createdAt: Date;
  paymentMethod: string;
  paymentStatus: string;
  razorpayPaymentId?: string | null;
  subtotal: number;
  taxAmount: number;
  deliveryFee: number;
  platformFee: number;
  discountAmount: number;
  totalAmount: number;
  customer: {
    name: string;
    email: string;
    phone?: string | null;
  };
  restaurant: {
    name: string;
    address: string;
    phone: string;
    fssaiLicense?: string | null;
  };
  address: {
    label: string;
    street: string;
    city: string;
    pincode: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    totalPrice: number;
    isVeg?: boolean;
    variantName?: string | null;
    addons?: string | null;
  }>;
}

/**
 * Generates and streams a professional PDF Tax Invoice directly to an Express HTTP Response
 */
export function generatePdfInvoice(order: InvoiceOrderData, res: Response): void {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="Foodle_Invoice_${order.orderNumber}.pdf"`
  );

  doc.pipe(res);

  // 1. Header Banner
  doc.rect(0, 0, 595.28, 90).fill('#E23744'); // Tomato Red

  doc.fillColor('#FFFFFF');
  doc.fontSize(24).font('Helvetica-Bold').text('FOODLE', 40, 25);
  doc.fontSize(10).font('Helvetica').text('Fresh & Fast Food Delivery Platform', 40, 55);

  doc.fontSize(16).font('Helvetica-Bold').text('TAX INVOICE', 400, 25, { align: 'right', width: 155 });
  doc.fontSize(9).font('Helvetica').text(`Invoice #${order.orderNumber}`, 400, 48, { align: 'right', width: 155 });
  doc.fontSize(9).text(
    `Date: ${new Date(order.createdAt).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })}`,
    400,
    62,
    { align: 'right', width: 155 }
  );

  doc.moveDown(3);

  // 2. Billing & Restaurant Details (Two-column layout)
  const detailsTop = 110;

  // Restaurant (Left)
  doc.fillColor('#1F2937');
  doc.fontSize(11).font('Helvetica-Bold').text('Billed From (Restaurant Partner):', 40, detailsTop);
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#E23744').text(order.restaurant.name, 40, detailsTop + 16);
  doc.fontSize(9).font('Helvetica').fillColor('#4B5563');
  doc.text(order.restaurant.address, 40, detailsTop + 30, { width: 240 });
  doc.text(`Phone: ${order.restaurant.phone}`, 40, detailsTop + 55);
  if (order.restaurant.fssaiLicense) {
    doc.text(`FSSAI Lic: ${order.restaurant.fssaiLicense}`, 40, detailsTop + 68);
  }

  // Customer & Shipping (Right)
  doc.fillColor('#1F2937');
  doc.fontSize(11).font('Helvetica-Bold').text('Billed & Delivered To:', 320, detailsTop);
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#111827').text(order.customer.name, 320, detailsTop + 16);
  doc.fontSize(9).font('Helvetica').fillColor('#4B5563');
  doc.text(`${order.address.street}, ${order.address.city} - ${order.address.pincode}`, 320, detailsTop + 30, {
    width: 235,
  });
  doc.text(`Phone: ${order.customer.phone || 'N/A'} | Email: ${order.customer.email}`, 320, detailsTop + 55, {
    width: 235,
  });

  // 3. Items Table Header
  const tableTop = 205;
  doc.rect(40, tableTop, 515, 22).fill('#F3F4F6');

  doc.fillColor('#374151').fontSize(9).font('Helvetica-Bold');
  doc.text('ITEM DESCRIPTION', 48, tableTop + 6);
  doc.text('QTY', 330, tableTop + 6, { width: 40, align: 'center' });
  doc.text('UNIT PRICE', 380, tableTop + 6, { width: 70, align: 'right' });
  doc.text('TOTAL', 460, tableTop + 6, { width: 85, align: 'right' });

  // Items List
  let y = tableTop + 28;
  doc.font('Helvetica').fontSize(9).fillColor('#1F2937');

  order.items.forEach((item, index) => {
    // Alternating row background
    if (index % 2 === 1) {
      doc.rect(40, y - 4, 515, 20).fill('#FAFAFA');
    }

    const itemTitle = `${item.isVeg ? '[VEG]' : '[NON-VEG]'} ${item.name}${
      item.variantName ? ` (${item.variantName})` : ''
    }`;

    doc.fillColor('#111827').text(itemTitle, 48, y, { width: 270 });
    doc.fillColor('#4B5563').text(String(item.quantity), 330, y, { width: 40, align: 'center' });
    doc.text(`INR ${item.price.toFixed(2)}`, 380, y, { width: 70, align: 'right' });
    doc.fillColor('#111827').font('Helvetica-Bold').text(`INR ${item.totalPrice.toFixed(2)}`, 460, y, {
      width: 85,
      align: 'right',
    });
    doc.font('Helvetica');

    y += 22;
  });

  // Divider
  doc.moveTo(40, y + 5).lineTo(555, y + 5).strokeColor('#E5E7EB').lineWidth(1).stroke();
  y += 15;

  // 4. Summary & Payment Breakdown (Right-aligned)
  const summaryLeft = 320;
  const labelWidth = 140;
  const valueWidth = 85;
  const valueLeft = 460;

  const addSummaryRow = (label: string, value: string, isBold = false, isHighlight = false) => {
    if (isHighlight) {
      doc.rect(summaryLeft - 10, y - 4, 245, 22).fill('#FEF2F2');
    }

    doc.font(isBold ? 'Helvetica-Bold' : 'Helvetica')
      .fontSize(9)
      .fillColor(isHighlight ? '#E23744' : '#4B5563');
    doc.text(label, summaryLeft, y, { width: labelWidth, align: 'left' });

    doc.fillColor(isHighlight ? '#E23744' : '#111827');
    doc.text(value, valueLeft, y, { width: valueWidth, align: 'right' });

    y += 18;
  };

  addSummaryRow('Item Subtotal:', `INR ${order.subtotal.toFixed(2)}`);
  addSummaryRow('Taxes & GST (5%):', `INR ${order.taxAmount.toFixed(2)}`);
  addSummaryRow('Delivery Fee:', `INR ${order.deliveryFee.toFixed(2)}`);
  addSummaryRow('Platform Fee:', `INR ${order.platformFee.toFixed(2)}`);

  if (order.discountAmount > 0) {
    addSummaryRow('Coupon Discount:', `- INR ${order.discountAmount.toFixed(2)}`, false, false);
  }

  y += 4;
  addSummaryRow('Final Amount Paid:', `INR ${order.totalAmount.toFixed(2)}`, true, true);

  // 5. Payment Details Box (Bottom Left)
  const paymentBoxTop = y - 80;
  doc.rect(40, paymentBoxTop, 250, 70).fillAndStroke('#F9FAFB', '#E5E7EB');

  doc.fillColor('#111827').fontSize(9).font('Helvetica-Bold').text('Payment Information', 50, paymentBoxTop + 10);
  doc.font('Helvetica').fontSize(8.5).fillColor('#4B5563');
  doc.text(`Payment Mode: ${order.paymentMethod}`, 50, paymentBoxTop + 26);
  doc.text(`Payment Status: ${order.paymentStatus}`, 50, paymentBoxTop + 39);
  if (order.razorpayPaymentId) {
    doc.text(`Transaction Ref: ${order.razorpayPaymentId}`, 50, paymentBoxTop + 52);
  }

  // 6. Footer & Digital Signature
  const footerTop = 750;
  doc.moveTo(40, footerTop).lineTo(555, footerTop).strokeColor('#E5E7EB').lineWidth(1).stroke();

  doc.fontSize(8).font('Helvetica').fillColor('#9CA3AF');
  doc.text(
    'This is a computer-generated tax invoice and requires no physical signature. Registered Office: Foodle Technologies Pvt Ltd, Bangalore, India.',
    40,
    footerTop + 10,
    { align: 'center', width: 515 }
  );

  doc.end();
}
