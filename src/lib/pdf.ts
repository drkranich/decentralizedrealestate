import { jsPDF } from "jspdf";

/**
 * Small shared helper so every "Export" action in the app can offer a PDF
 * version alongside CSV, without pulling in a heavy table plugin.
 * Renders a title + a simple column-aligned table, paginating automatically.
 */
export function downloadTablePdf(opts: {
  title: string;
  subtitle?: string;
  header: string[];
  rows: (string | number)[][];
  filename: string;
  colWidths?: number[];
}) {
  const { title, subtitle, header, rows, filename } = opts;
  const doc = new jsPDF();
  const marginX = 14;
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  const usableWidth = pageWidth - marginX * 2;
  const colWidths = opts.colWidths ?? header.map(() => usableWidth / header.length);

  let y = 20;
  doc.setFontSize(16);
  doc.text(title, marginX, y);
  y += 7;
  if (subtitle) {
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(subtitle, marginX, y);
    doc.setTextColor(0);
    y += 7;
  }
  y += 3;

  const drawRow = (cells: (string | number)[], bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(9);
    let x = marginX;
    cells.forEach((cell, i) => {
      const text = String(cell ?? "");
      doc.text(text.length > 40 ? text.slice(0, 37) + "…" : text, x, y);
      x += colWidths[i];
    });
  };

  drawRow(header, true);
  y += 2;
  doc.setDrawColor(200);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 6;

  if (rows.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(140);
    doc.text("Nenhum dado real disponível ainda.", marginX, y);
    doc.setTextColor(0);
  } else {
    for (const row of rows) {
      if (y > pageHeight - 20) {
        doc.addPage();
        y = 20;
      }
      drawRow(row);
      y += 7;
    }
  }

  doc.save(filename);
}
