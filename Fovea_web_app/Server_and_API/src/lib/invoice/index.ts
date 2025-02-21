import fs from 'fs';
import pdfkit from 'pdfkit';
import dayjs from 'dayjs';
import numeral from 'numeral';
import { Invoice, PrismaClient, ProductInvoice } from '@prisma/client';
import { dir } from 'console';

// type Shipping = {
//   name: string;
//   address: string;
//   city: string;
//   country: string;
//   postal_code: number;
// };

// type Item = {
//   item: string;
//   quantity: number;
//   price: number;
// };

// type InvoiceObject = {
//   shipping: Shipping;
//   products: Item[];
//   invoice_nr: number;
//   paid: number;
// };

const prisma = new PrismaClient();

async function createInvoice(invoice: Invoice, path: fs.PathLike) {
  let doc = new pdfkit({ size: 'A4', margin: 50 });

  await generateHeader(doc);
  await generateCustomerInformation(doc, invoice);
  await generateInvoiceTable(doc, invoice);
  await generateFooter(doc);

  doc.end();
  doc.pipe(fs.createWriteStream(path));
}

async function generateHeader(doc: PDFKit.PDFDocument) {
  doc
    .image('logo.png', 50, 45, { height: 30 })
    .fillColor('#444444')
    .fontSize(10)
    .text('Pandora Bordeaux Lac', 200, 50, { align: 'right' })
    .text('Centre commercial Bordeaux Lac, Avenue des 40 Journaux', 200, 65, {
      align: 'right',
    })
    .text('Bordeaux, Vaucluse 33000', 200, 80, { align: 'right' })
    .moveDown();
}

async function generateCustomerInformation(
  doc: PDFKit.PDFDocument,
  invoice: Invoice
) {
  doc.fillColor('#444444').fontSize(20).text('Facture', 50, 160);

  const invoiceProducts = await prisma.productInvoice.findMany({
    where: {
      invoiceId: invoice.id,
    },
    include: {
      product: true,
    },
  });

  const granTotal = invoiceProducts.reduce(
    (acc: number, item: (typeof invoiceProducts)[0]) =>
      acc + item.product.price * item.quantity,
    0
  );

  const invoiceShipping = await prisma.shipping.findUnique({
    where: {
      id: invoice.shippingId,
    },
  });

  generateHr(doc, 185);

  const customerInformationTop = 200;

  doc
    .fontSize(10)
    .text('Facture n°', 50, customerInformationTop)
    .font('Helvetica-Bold')
    .text(invoice.invoiceNumber.toString(), 150, customerInformationTop)
    .font('Helvetica')
    .text('Date de facturation :', 50, customerInformationTop + 15)
    .text(formatDate(new Date()), 150, customerInformationTop + 15)
    .text('Montant réglé :', 50, customerInformationTop + 30)
    .text(
      formatCurrency(invoice.paid, granTotal),
      150,
      customerInformationTop + 30
    )
    .font('Helvetica-Bold')
    .text(invoiceShipping!.name, 300, customerInformationTop)
    .font('Helvetica')
    .text(invoiceShipping!.address, 300, customerInformationTop + 15)
    .text(
      invoiceShipping?.postalCode.toString() +
        ', ' +
        invoiceShipping?.city +
        ', ' +
        invoiceShipping?.country,
      300,
      customerInformationTop + 30
    )
    .moveDown();

  generateHr(doc, 252);
}

async function generateInvoiceTable(doc: PDFKit.PDFDocument, invoice: Invoice) {
  let i: number = 0;
  const invoiceTableTop = 330;

  doc.font('Helvetica-Bold');
  generateTableRow(
    doc,
    invoiceTableTop,
    'Produit',
    'Coût unitaire',
    'Quantité',
    'Total'
  );
  generateHr(doc, invoiceTableTop + 20);
  doc.font('Helvetica');

  const invoiceProducts = await prisma.productInvoice.findMany({
    where: {
      invoiceId: invoice.id,
    },
    include: {
      product: true,
    },
  });

  const granTotal = invoiceProducts.reduce(
    (acc: number, item: (typeof invoiceProducts)[0]) =>
      acc + item.product.price * item.quantity,
    0
  );

  for (i = 0; i < invoiceProducts.length; i++) {
    const item = invoiceProducts[i];
    const position = invoiceTableTop + (i + 1) * 30;
    generateTableRow(
      doc,
      position,
      item.product.name + ' (' + item.product.reference + ')',
      formatCurrency(item.product.price),
      item.quantity.toString(),
      formatCurrency(item.product.price * item.quantity)
    );

    generateHr(doc, position + 20);
  }

  const subtotalPosition = invoiceTableTop + (i + 1) * 30;
  // const invoiceSubtotal = invoice.items.reduce(
  //   (acc, item) => acc + item.price * item.quantity,
  //   0
  // );
  const invoiceSubtotal = invoiceProducts.reduce(
    (acc: number, item: (typeof invoiceProducts)[0]) =>
      acc + item.product.price * item.quantity,
    0
  );
  generateTableRow(
    doc,
    subtotalPosition,
    '',
    'Prix total',
    '',
    formatCurrency(invoiceSubtotal)
  );

  const paidToDatePosition = subtotalPosition + 20;

  const duePosition = paidToDatePosition + 25;
  doc.font('Helvetica-Bold');
  generateTableRow(
    doc,
    duePosition,
    '',
    'Total payé',
    '',
    formatCurrency(invoice.paid, granTotal)
  );
  doc.font('Helvetica');
}

async function generateFooter(doc: PDFKit.PDFDocument) {
  doc.fontSize(10).text('Merci pour votre confiance.', 50, 780, {
    align: 'center',
    width: 500,
  });
}

function generateTableRow(
  doc: PDFKit.PDFDocument,
  y: number,
  item: string,
  unitCost: string,
  quantity: string,
  lineTotal: string
) {
  doc
    .fontSize(10)
    .text(item, 50, y)
    .text(unitCost.toString(), 280, y, { width: 90, align: 'right' })
    .text(quantity.toString(), 370, y, { width: 90, align: 'right' })
    .text(lineTotal.toString(), 0, y, { align: 'right' });
}

function generateHr(doc: PDFKit.PDFDocument, y: number) {
  doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
}

function formatCurrency(euros: number, granTotal?: number) {
  if (euros === -1) {
    return numeral(granTotal).format('0,0.00') + ' €';
  }
  return numeral(euros).format('0,0.00') + ' €';
}

function formatDate(date: Date) {
  return dayjs(date).format('DD/MM/YYYY');
}

export default createInvoice;
