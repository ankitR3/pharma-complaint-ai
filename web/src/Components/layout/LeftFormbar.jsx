import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setStatus } from '../store/formSlice';
import { FlaskConical, Download } from 'lucide-react';

export default function LeftFormbar() {
  const dispatch = useDispatch();
  const fields = useSelector((state) => state.form.fields);
  const status = useSelector((state) => state.form.status);
  const isSubmitting = useSelector((state) => state.form.isSubmitting);

  const handleDownloadPDF = () => {
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

  const handleCommit = (e) => {
    e.preventDefault();
    if (status !== 'Ready to Commit') {
      alert('Please use AIVOA Copilot on the right to extract and populate a complaint before committing.');
      return;
    }
    dispatch(setStatus('Committed'));
    alert('Complaint successfully committed to QMS Ledger!');
  };

  return (
    <div className="flex-1 bg-slate-50/40 overflow-y-auto h-screen p-6 md:p-8 custom-scrollbar">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="bg-white border border-slate-200/80 rounded-lg p-6 shadow-xs flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Log Customer Complaint</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">API & FDF Quality Assurance Module</p>
          </div>

          {/* Download PDF Button replacing status badge */}
          <button
            type="button"
            onClick={handleDownloadPDF}
            className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold rounded-md flex items-center gap-2 transition cursor-pointer shadow-xs"
            title="Download Log Customer Complaint form as PDF"
          >
            <Download className="w-4 h-4 text-indigo-600" />
            Download PDF
          </button>
        </div>

        <form onSubmit={handleCommit} className="space-y-6">
          {/* 1. ORIGIN & CUSTOMER DETAILS */}
          <div className="bg-white border border-slate-200/80 rounded-lg p-6 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              1. ORIGIN & CUSTOMER DETAILS
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
              <div>
                <label className="block font-semibold text-slate-800 mb-1.5">Complaint Source</label>
                <input
                  type="text"
                  name="complaintSource"
                  readOnly
                  value={fields.complaintSource || ''}
                  placeholder="Awaiting AI extraction..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:outline-none text-sm cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1.5">Customer Name</label>
                <input
                  type="text"
                  name="customerName"
                  readOnly
                  value={fields.customerName || ''}
                  placeholder="Awaiting AI extraction..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:outline-none text-sm cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* 2. PRODUCT & BATCH IDENTIFICATION */}
          <div className="bg-white border border-slate-200/80 rounded-lg p-6 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              2. PRODUCT & BATCH IDENTIFICATION
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
              <div>
                <label className="block font-semibold text-slate-800 mb-1.5">Product Name</label>
                <input
                  type="text"
                  name="productName"
                  readOnly
                  value={fields.productName || ''}
                  placeholder="Awaiting AI extraction..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none text-sm cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1.5">Product Strength</label>
                <input
                  type="text"
                  name="productStrength"
                  readOnly
                  value={fields.productStrength || ''}
                  placeholder="Awaiting AI extraction..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:outline-none text-sm cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1.5">Batch / Lot Number</label>
                <input
                  type="text"
                  name="batchNumber"
                  readOnly
                  value={fields.batchNumber || ''}
                  placeholder="Awaiting AI extraction..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none text-sm cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1.5">Affected Quantity</label>
                <input
                  type="text"
                  name="affectedQuantity"
                  readOnly
                  value={fields.affectedQuantity || ''}
                  placeholder="Awaiting AI extraction..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:outline-none text-sm cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1.5">Manufacturing Date</label>
                <input
                  type="text"
                  name="manufacturingDate"
                  readOnly
                  value={fields.manufacturingDate || ''}
                  placeholder="Awaiting AI extraction..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:outline-none text-sm cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1.5">Expiry Date</label>
                <input
                  type="text"
                  name="expiryDate"
                  readOnly
                  value={fields.expiryDate || ''}
                  placeholder="Awaiting AI extraction..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:outline-none text-sm cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* 3. FACILITY & MATERIAL IMPACT */}
          <div className="bg-white border border-slate-200/80 rounded-lg p-6 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              3. FACILITY & MATERIAL IMPACT
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
              <div>
                <label className="block font-semibold text-slate-800 mb-1.5">Originating Site Block</label>
                <input
                  type="text"
                  name="originatingBlock"
                  readOnly
                  value={fields.originatingBlock || ''}
                  placeholder="Awaiting AI classification..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:outline-none text-sm cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1.5">Impacted Non-Product Materials (NPM)</label>
                <input
                  type="text"
                  name="impactedNpm"
                  readOnly
                  value={fields.impactedNpm || ''}
                  placeholder="e.g., Primary packaging..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none text-sm cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* 4. DEFECT ANALYSIS */}
          <div className="bg-white border border-slate-200/80 rounded-lg p-6 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              4. DEFECT ANALYSIS
            </h2>
            <div className="space-y-4 text-sm">
              <div>
                <label className="block font-semibold text-slate-800 mb-1.5">Complaint Category</label>
                <input
                  type="text"
                  name="complaintCategory"
                  readOnly
                  value={fields.complaintCategory || ''}
                  placeholder="Awaiting AI extraction..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:outline-none text-sm cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1.5">Complaint Description</label>
                <textarea
                  name="complaintDescription"
                  rows={3}
                  readOnly
                  value={fields.complaintDescription || ''}
                  placeholder="AI will synthesize the complaint into a formal QMS description..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none text-sm resize-none cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* AI copilot risk assessment Container */}
          <div className="p-6 bg-indigo-50/70 border border-indigo-100/90 rounded-lg space-y-4">
            <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
              <FlaskConical className="w-4.5 h-4.5 text-indigo-600" />
              <span>AI copilot risk assessment</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
              <div>
                <label className="block text-slate-700 mb-1.5 text-xs font-semibold">Severity (Suggested)</label>
                <input
                  type="text"
                  name="suggestedSeverity"
                  readOnly
                  value={fields.suggestedSeverity || ''}
                  placeholder="Awaiting AI evaluation..."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-md text-slate-900 focus:outline-none text-sm cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1.5 text-xs font-semibold">Suggested Next Action</label>
                <input
                  type="text"
                  name="suggestedNextAction"
                  readOnly
                  value={fields.suggestedNextAction || ''}
                  placeholder="Awaiting AI evaluation..."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-md text-slate-900 focus:outline-none text-sm cursor-not-allowed"
                />
              </div>
            </div>

            <div className="text-sm">
              <label className="block text-slate-700 mb-1.5 text-xs font-semibold">Initial Risk Assessment</label>
              <input
                type="text"
                name="initialRiskAssessment"
                readOnly
                value={fields.initialRiskAssessment || ''}
                placeholder="Awaiting AI evaluation..."
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-md text-slate-900 focus:outline-none text-sm cursor-not-allowed"
              />
            </div>
          </div>

          {/* Commit to QMS Ledger Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || status !== 'Ready to Commit'}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-sm tracking-wide transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
            >
              Commit to QMS Ledger
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
