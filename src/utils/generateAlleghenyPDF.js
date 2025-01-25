import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import logo from '../assets/images/logo.png'; // Import the logo

const generateAlleghenyPDF = (invoice) => {
  const doc = new jsPDF();

  // Create an Image object
  const img = new Image();
  img.src = logo;

  img.onload = () => {
    // Create a canvas to draw the image and get the base64 data
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    const logoBase64 = canvas.toDataURL('image/png');

    // Add the logo to the PDF
    const logoWidth = 40; // Width of the logo in mm (reduced)
    const logoHeight = 20; // Height of the logo in mm
    const logoX = 10; // X position of the logo
    const logoY = 10; // Y position of the logo
    doc.addImage(logoBase64, 'PNG', logoX, logoY, logoWidth, logoHeight);

    // Add the business address and phone number in the top right corner
    doc.setFontSize(10);
    doc.text('365 Sunset Place', 200, 10, null, null, 'right');
    doc.text('Keyser, WV 26726', 200, 15, null, null, 'right');
    doc.text('(304) 788 5310', 200, 20, null, null, 'right');

    // Add a title below the logo
    doc.setFontSize(18);
    doc.text('Allegheny County Invoice', 105, 25, null, null, 'center'); // Adjusted position to align with the logo

    // Add customer details
    doc.setFontSize(12);
    doc.text(`Customer Name: ${invoice.customerName}`, 10, 40);
    doc.text(`Date: ${invoice.date}`, 10, 50);
    doc.text(`Customer Location: ${invoice.customerLocation}`, 10, 60);

    // Define table columns for products
    const columns = ["Product", "Quantity", "Sticker Number", "Serial Number", "Gross Profit", "Product Price", "Taxable Profit"];
    const rows = invoice.products.map(product => [
      product.name,
      product.quantity,
      product.stickerNumber,
      product.serialNumber,
      product.grossProfit !== undefined ? `$${product.grossProfit.toFixed(2)}` : 'N/A',
      product.productPrice !== undefined ? `$${product.productPrice.toFixed(2)}` : 'N/A',
      product.taxableProfit !== undefined ? `$${product.taxableProfit.toFixed(2)}` : 'N/A'
    ]);

    // Add sales tax, sub total, and total as additional rows
    rows.push([
      { content: 'Sales Tax', colSpan: 6, styles: { halign: 'right' } },
      `${invoice.salesTax}%`
    ]);
    rows.push([
      { content: 'Sub Total', colSpan: 6, styles: { halign: 'right' } },
      invoice.subTotal !== undefined ? `$${invoice.subTotal.toFixed(2)}` : 'N/A'
    ]);
    rows.push([
      { content: 'Total + Sales Tax', colSpan: 6, styles: { halign: 'right' } },
      invoice.total !== undefined ? `$${invoice.total.toFixed(2)}` : 'N/A'
    ]);

    // Use jsPDF-AutoTable to add the table
    doc.autoTable({
      startY: 70,
      head: [columns],
      body: rows,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [22, 160, 133] }
    });

    // Add footer notes
    const finalY = doc.autoTable.previous.finalY + 10; // Get the Y position after the table
    doc.setFontSize(10);
    doc.text('All claims and returned goods must be accompanied by this bill.', 105, finalY, null, null, 'center');
    doc.text('Thank you', 105, finalY + 10, null, null, 'center');

    // Save the PDF
    doc.save(`allegheny_invoice_${invoice.customerName}_${invoice.date}.pdf`);
  };

  // Handle image loading error
  img.onerror = () => {
    console.error('Error loading logo image');
    // Proceed without the logo
    generatePDFWithoutLogo(doc, invoice);
  };
};

const generatePDFWithoutLogo = (doc, invoice) => {
  // Add the business address and phone number in the top right corner
  doc.setFontSize(10);
  doc.text('365 Sunset Place', 200, 10, null, null, 'right');
  doc.text('Keyser, WV 26726', 200, 15, null, null, 'right');
  doc.text('(304) 788 5310', 200, 20, null, null, 'right');

  // Add a title below the logo
  doc.setFontSize(18);
  doc.text('Allegheny County Invoice', 105, 25, null, null, 'center'); // Adjusted position to align with the logo

  // Add customer details
  doc.setFontSize(12);
  doc.text(`Customer Name: ${invoice.customerName}`, 10, 40);
  doc.text(`Date: ${invoice.date}`, 10, 50);
  doc.text(`Customer Location: ${invoice.customerLocation}`, 10, 60);

  // Define table columns for products
  const columns = ["Product", "Quantity", "Sticker Number", "Serial Number", "Gross Profit", "Product Price", "Taxable Profit"];
  const rows = invoice.products.map(product => [
    product.name,
    product.quantity,
    product.stickerNumber,
    product.serialNumber,
    product.grossProfit !== undefined ? `$${product.grossProfit.toFixed(2)}` : 'N/A',
    product.productPrice !== undefined ? `$${product.productPrice.toFixed(2)}` : 'N/A',
    product.taxableProfit !== undefined ? `$${product.taxableProfit.toFixed(2)}` : 'N/A'
  ]);

  // Add sales tax, sub total, and total as additional rows
  rows.push([
    { content: 'Sales Tax', colSpan: 6, styles: { halign: 'right' } },
    `${invoice.salesTax}%`
  ]);
  rows.push([
    { content: 'Sub Total', colSpan: 6, styles: { halign: 'right' } },
    invoice.subTotal !== undefined ? `$${invoice.subTotal.toFixed(2)}` : 'N/A'
  ]);
  rows.push([
    { content: 'Total + Sales Tax', colSpan: 6, styles: { halign: 'right' } },
    invoice.total !== undefined ? `$${invoice.total.toFixed(2)}` : 'N/A'
  ]);

  // Use jsPDF-AutoTable to add the table
  doc.autoTable({
    startY: 70,
    head: [columns],
    body: rows,
    theme: 'grid',
    styles: { fontSize: 10 },
    headStyles: { fillColor: [22, 160, 133] }
  });

  // Add footer notes
  const finalY = doc.autoTable.previous.finalY + 10; // Get the Y position after the table
  doc.setFontSize(10);
  doc.text('All claims and returned goods must be accompanied by this bill.', 105, finalY, null, null, 'center');
  doc.text('Thank you', 105, finalY + 10, null, null, 'center');

  // Save the PDF
  doc.save(`allegheny_invoice_${invoice.customerName}_${invoice.date}.pdf`);
};

export default generateAlleghenyPDF;