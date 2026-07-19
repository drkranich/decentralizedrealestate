/**
 * Zero-dependency "export to PDF" helper.
 *
 * Deliberately avoids libraries like jsPDF: this app runs on Cloudflare
 * Workers with server-side rendering (TanStack Start), and PDF-generation
 * packages tend to ship Node-oriented builds (fs/canvas-based fallbacks)
 * that can break the Workers SSR bundle even when only ever called from a
 * client-side onClick handler. Using the browser's native print pipeline
 * needs no bundling at all: it opens a formatted print view and calls
 * window.print(), letting the user pick "Save as PDF" in the print dialog.
 */
export function downloadTablePdf(opts: {
  title: string;
  subtitle?: string;
  header: string[];
  rows: (string | number)[][];
  filename?: string;
}) {
  const { title, subtitle, header, rows } = opts;

  const win = window.open("", "_blank", "width=900,height=1200");
  if (!win) {
    return false;
  }

  const escapeHtml = (v: unknown) =>
    String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));

  const rowsHtml = rows.length
    ? rows.map((r) => `<tr>${r.map((c) => `<td>${escapeHtml(c)}</td>`).join("")}</tr>`).join("")
    : `<tr><td colspan="${header.length}" class="empty">Nenhum dado real disponível ainda.</td></tr>`;

  win.document.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
    <style>
      * { box-sizing: border-box; }
      body { font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; padding: 32px; color: #111; }
      h1 { font-size: 20px; margin: 0 0 4px; }
      .subtitle { font-size: 12px; color: #666; margin: 0 0 20px; }
      table { width: 100%; border-collapse: collapse; font-size: 12px; }
      th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid #e5e5e5; }
      th { text-transform: uppercase; letter-spacing: 0.03em; font-size: 10px; color: #666; border-bottom: 2px solid #ccc; }
      .empty { text-align: center; color: #999; padding: 24px; }
      @media print {
        body { padding: 0; }
      }
    </style>
  </head>
  <body>
    <h1>${escapeHtml(title)}</h1>
    ${subtitle ? `<p class="subtitle">${escapeHtml(subtitle)}</p>` : ""}
    <table>
      <thead><tr>${header.map((h) => `<th>${escapeHtml(h)}</th>`).join("")}</tr></thead>
      <tbody>${rowsHtml}</tbody>
    </table>
    <script>
      window.onload = function () {
        window.print();
      };
    </script>
  </body>
</html>`);
  win.document.close();
  return true;
}
