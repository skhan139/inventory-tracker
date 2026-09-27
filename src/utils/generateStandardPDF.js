import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import logo from '../assets/images/logo.png';

/**
 * Generates a random five-digit invoice number.
 *
 * This is generated once per PDF export. Downloading the same invoice
 * again will produce a new number.
 */
const generateInvoiceNumber = () => {
  const minimum = 10000;
  const range = 90000;

  if (window.crypto?.getRandomValues) {
    const randomValues = new Uint32Array(1);
    window.crypto.getRandomValues(randomValues);

    return minimum + (randomValues[0] % range);
  }

  return Math.floor(minimum + Math.random() * range);
};

const formatCurrency = (value) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 'N/A';
  }

  return `$${numericValue.toFixed(2)}`;
};

const sanitizeFileName = (value) => {
  return String(value || 'customer')
    .trim()
    .replace(/[^a-z0-9-_]+/gi, '_')
    .replace(/^_+|_+$/g, '');
};

const createInvoicePDF = (
  doc,
  invoice,
  invoiceNumber,
  logoBase64 = null
) => {
  if (logoBase64) {
    doc.addImage(
      logoBase64,
      'PNG',
      10,
      10,
      40,
      20
    );
  }

  // Business information
  doc.setFontSize(10);
  doc.setTextColor(45, 45, 45);
  doc.text('365 Sunset Place', 200, 10, {
    align: 'right',
  });
  doc.text('Keyser, WV 26726', 200, 15, {
    align: 'right',
  });
  doc.text('(304) 788-5310', 200, 20, {
    align: 'right',
  });

  // Invoice heading
  doc.setFontSize(18);
  doc.setTextColor(20, 20, 20);
  doc.text('Invoice', 105, 25, {
    align: 'center',
  });

  doc.setFontSize(10);
  doc.setTextColor(90, 90, 90);
  doc.text(`Invoice #${invoiceNumber}`, 105, 31, {
    align: 'center',
  });

  // Customer details
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);
  doc.text(
    `Customer Name: ${invoice.customerName || 'N/A'}`,
    10,
    43
  );
  doc.text(
    `Date: ${invoice.date || 'N/A'}`,
    10,
    52
  );
  doc.text(
    `Customer Location: ${
      invoice.customerLocation || 'N/A'
    }`,
    10,
    61
  );

  const columns = [
    'Product',
    'Quantity',
    'Serial Numbers',
    'Unit Price',
  ];

  const products = Array.isArray(invoice.products)
    ? invoice.products
    : [];

  const rows = products.map((product) => [
    product.name || 'N/A',
    product.quantity ?? 0,
    Array.isArray(product.serialNumbers) &&
    product.serialNumbers.length > 0
      ? product.serialNumbers.join('\n')
      : 'N/A',
    formatCurrency(product.unitPrice),
  ]);

  rows.push([
    {
      content: 'Tax',
      colSpan: 3,
      styles: {
        halign: 'right',
        fontStyle: 'bold',
      },
    },
    `${Number(invoice.tax) || 0}%`,
  ]);

  rows.push([
    {
      content: 'Discount',
      colSpan: 3,
      styles: {
        halign: 'right',
        fontStyle: 'bold',
      },
    },
    invoice.discountType === 'percent'
      ? `${Number(invoice.discountValue) || 0}%`
      : formatCurrency(invoice.discountValue || 0),
  ]);

  rows.push([
    {
      content: 'Total Price',
      colSpan: 3,
      styles: {
        halign: 'right',
        fontStyle: 'bold',
      },
    },
    {
      content: formatCurrency(invoice.totalPrice),
      styles: {
        fontStyle: 'bold',
      },
    },
  ]);

  doc.autoTable({
    startY: 70,
    head: [columns],
    body: rows,
    theme: 'grid',

    styles: {
      fontSize: 9,
      cellPadding: 3,
      textColor: [42, 48, 59],
      lineColor: [223, 227, 232],
      lineWidth: 0.2,
      valign: 'middle',
    },

    headStyles: {
      fillColor: [22, 28, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },

    alternateRowStyles: {
      fillColor: [247, 248, 250],
    },

    columnStyles: {
      0: {
        cellWidth: 48,
      },
      1: {
        cellWidth: 24,
        halign: 'center',
      },
      2: {
        cellWidth: 78,
      },
      3: {
        cellWidth: 35,
        halign: 'right',
      },
    },

    didParseCell: (data) => {
      const isTotalRow =
        data.section === 'body' &&
        data.row.index === rows.length - 1;

      if (isTotalRow) {
        data.cell.styles.fillColor = [250, 245, 229];
        data.cell.styles.textColor = [75, 57, 10];
      }
    },
  });

  const finalTableY =
    doc.lastAutoTable?.finalY ||
    doc.autoTable?.previous?.finalY ||
    70;

  const footerY = Math.min(finalTableY + 12, 275);

  doc.setFontSize(9);
  doc.setTextColor(90, 90, 90);
  doc.text(
    'All claims and returned goods must be accompanied by this bill.',
    105,
    footerY,
    {
      align: 'center',
    }
  );

  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  doc.text('Thank you', 105, footerY + 8, {
    align: 'center',
  });

  const safeCustomerName = sanitizeFileName(
    invoice.customerName
  );

  const safeDate = sanitizeFileName(
    invoice.date || 'undated'
  );

  doc.save(
    `invoice_${invoiceNumber}_${safeCustomerName}_${safeDate}.pdf`
  );

  return invoiceNumber;
};

const generateStandardPDF = (invoice) => {
  if (!invoice) {
    console.error(
      'A valid invoice is required to generate a PDF.'
    );
    return;
  }

  const doc = new jsPDF();
  const invoiceNumber = generateInvoiceNumber();
  const image = new Image();

  image.src = logo;

  image.onload = () => {
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) {
        createInvoicePDF(doc, invoice, invoiceNumber);
        return;
      }

      canvas.width = image.naturalWidth || image.width;
      canvas.height = image.naturalHeight || image.height;

      context.drawImage(image, 0, 0);

      const logoBase64 = canvas.toDataURL('image/png');

      createInvoicePDF(
        doc,
        invoice,
        invoiceNumber,
        logoBase64
      );
    } catch (error) {
      console.error(
        'Unable to add the logo to the invoice:',
        error
      );

      createInvoicePDF(doc, invoice, invoiceNumber);
    }
  };

  image.onerror = () => {
    console.error(
      'The invoice logo could not be loaded. Generating the PDF without it.'
    );

    createInvoicePDF(doc, invoice, invoiceNumber);
  };
};

export default generateStandardPDF;