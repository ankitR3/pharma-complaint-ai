export const handleDownloadPDF = (fields = {}) => {
  const lines = [
    "PHARMACEUTICAL CUSTOMER COMPLAINT REPORT",
    "API & FDF Quality Assurance Module - QMS Ledger Record",
    "-------------------------------------------------------------------",
    `1. ORIGIN & CUSTOMER DETAILS`,
    `Complaint Source : ${fields.complaintSource || 'N/A'}`,
    `Customer Name    : ${fields.customerName || 'N/A'}`,
    "",
    `2. PRODUCT & BATCH IDENTIFICATION`,
    `Product Name       : ${fields.productName || 'N/A'}`,
    `Product Strength   : ${fields.productStrength || 'N/A'}`,
    `Batch / Lot Number : ${fields.batchNumber || 'N/A'}`,
    `Affected Quantity  : ${fields.affectedQuantity || 'N/A'}`,
    `Manufacturing Date : ${fields.manufacturingDate || 'N/A'}`,
    `Expiry Date        : ${fields.expiryDate || 'N/A'}`,
    "",
    `3. FACILITY & MATERIAL IMPACT`,
    `Originating Site Block : ${fields.originatingBlock || 'N/A'}`,
    `Impacted NPM           : ${fields.impactedNpm || 'N/A'}`,
    "",
    `4. DEFECT ANALYSIS`,
    `Complaint Category    : ${fields.complaintCategory || 'N/A'}`,
    `Complaint Date        : ${fields.complaintDate || 'N/A'}`,
    `Complaint Description : ${fields.complaintDescription || 'N/A'}`,
    "",
    "-------------------------------------------------------------------",
    `AI COPILOT RISK ASSESSMENT`,
    `Suggested Severity     : ${fields.suggestedSeverity || 'N/A'}`,
    `Suggested Next Action  : ${fields.suggestedNextAction || 'N/A'}`,
    `Initial Risk Assessment: ${fields.initialRiskAssessment || 'N/A'}`,
    "-------------------------------------------------------------------"
  ];

  const streamBody = lines.map(line => `(${line.replace(/[()]/g, '')}) '`).join('\n');

  const pdfBinary = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length 1200 >>
stream
BT
/F1 11 Tf
50 740 Td
16 TL
${streamBody}
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000323 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
1600
%%EOF`;

  const blob = new Blob([pdfBinary], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Customer_Complaint_${fields.batchNumber || 'Report'}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
