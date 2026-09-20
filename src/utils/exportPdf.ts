import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

interface PdfRow {
  label: string;
  value: string;
}

interface BrandedPdfOptions {
  title: string;
  subtitle: string;
  badge: string;
  rows: PdfRow[];
  qrText: string;
  filename: string;
  accentValue?: string;
}

const loadImage = async (src: string): Promise<string> => {
  const response = await fetch(src);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const downloadBrandedPdf = async ({
  title,
  subtitle,
  badge,
  rows,
  qrText,
  filename,
  accentValue,
}: BrandedPdfOptions) => {
  const [logo, qrCode] = await Promise.all([
    loadImage('/assets/images/logo-elite.png'),
    QRCode.toDataURL(qrText, {
      width: 240,
      margin: 1,
      color: { dark: '#064e3b', light: '#ffffff' },
    }),
  ]);

  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const now = new Date();

  pdf.setFillColor(6, 78, 59);
  pdf.rect(0, 0, pageWidth, 38, 'F');
  pdf.addImage(logo, 'PNG', 15, 8, 57, 19);
  pdf.setTextColor(212, 175, 55);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.text(badge.toUpperCase(), pageWidth - 15, 19, { align: 'right' });

  pdf.setTextColor(6, 78, 59);
  pdf.setFontSize(22);
  pdf.text(title, 15, 56);
  pdf.setTextColor(100, 116, 139);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.text(subtitle, 15, 64);

  let cursorY = 77;
  rows.forEach((row, index) => {
    if (cursorY > pageHeight - 55) {
      pdf.addPage();
      cursorY = 20;
    }
    pdf.setFillColor(index % 2 === 0 ? 243 : 255, index % 2 === 0 ? 248 : 255, index % 2 === 0 ? 245 : 255);
    pdf.roundedRect(15, cursorY - 6, pageWidth - 30, 14, 2, 2, 'F');
    pdf.setTextColor(6, 78, 59);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.text(row.label, 20, cursorY + 2);
    pdf.setTextColor(30, 41, 59);
    pdf.setFont('helvetica', 'normal');
    const lines = pdf.splitTextToSize(row.value || '-', pageWidth - 105);
    pdf.text(lines, pageWidth - 20, cursorY + 2, { align: 'right' });
    cursorY += Math.max(17, lines.length * 5 + 10);
  });

  if (accentValue) {
    pdf.setDrawColor(212, 175, 55);
    pdf.setLineWidth(1.2);
    pdf.line(15, cursorY + 3, pageWidth - 15, cursorY + 3);
    pdf.setTextColor(6, 78, 59);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    pdf.text(accentValue, 15, cursorY + 15);
    cursorY += 26;
  }

  const footerY = pageHeight - 38;
  pdf.setDrawColor(226, 232, 240);
  pdf.setLineWidth(0.3);
  pdf.line(15, footerY - 5, pageWidth - 15, footerY - 5);
  pdf.setTextColor(100, 116, 139);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.text(`Généré le ${now.toLocaleDateString('fr-FR')} à ${now.toLocaleTimeString('fr-FR')}`, 15, footerY + 4);
  pdf.text('EDOTEAM - Professional Services Platform', 15, footerY + 10);
  pdf.addImage(qrCode, 'PNG', pageWidth - 48, footerY - 1, 30, 30);
  pdf.setFontSize(7);
  pdf.text('Scanner pour vérifier', pageWidth - 33, footerY + 32, { align: 'center' });

  pdf.save(filename);
};
