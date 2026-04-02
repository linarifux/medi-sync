import PDFDocument from 'pdfkit';

export const generateInventoryPDF = (res, medicines) => {
  const doc = new PDFDocument({ margin: 50 });

  // Pipe the PDF document directly to the Express response
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=MediSync_Report.pdf');
  doc.pipe(res);

  // Document Header
  doc
    .fontSize(24)
    .font('Helvetica-Bold')
    .text('MediSync Inventory Report', { align: 'center' })
    .moveDown();

  doc
    .fontSize(12)
    .font('Helvetica')
    .text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' })
    .moveDown(2);

  // Table Headers
  doc.font('Helvetica-Bold');
  doc.text('Medicine Name', 50, doc.y, { continued: true, width: 200 });
  doc.text('Dosage', 250, doc.y, { continued: true, width: 100 });
  doc.text('Stock Left', 350, doc.y, { continued: true, width: 100 });
  doc.text('Status', 450, doc.y);
  
  doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke();
  doc.moveDown(1);

  // Table Rows (Medicine Data)
  doc.font('Helvetica');
  medicines.forEach((med) => {
    // Check if y position is close to the bottom of the page, if so add a new page
    if (doc.y > 700) {
      doc.addPage();
    }

    const isLowStock = med.stockInfo && med.stockInfo.needsRestock;
    const statusText = isLowStock ? 'REORDER NOW' : 'OK';

    // If low stock, change text color to red for emphasis
    if (isLowStock) doc.fillColor('red');

    doc.text(med.name, 50, doc.y, { continued: true, width: 200 });
    doc.text(med.dosage, 250, doc.y, { continued: true, width: 100 });
    doc.text(med.stockLeft.toString(), 350, doc.y, { continued: true, width: 100 });
    doc.text(statusText, 450, doc.y);

    // Reset color to black for the next row
    doc.fillColor('black');
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke({ color: '#cccccc' });
    doc.moveDown(0.5);
  });

  // Finalize the PDF file
  doc.end();
};