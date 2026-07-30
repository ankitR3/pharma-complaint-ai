import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { resetForm } from '../store/formSlice';
import { resetAiState } from '../store/aiSlice';
import { FlaskConical, Download, RotateCcw, CheckCircle2, AlertCircle, X, Database, Lock, Search, ShieldCheck, Save, Eye, Trash2 } from 'lucide-react';
import { handleDownloadPDF } from '../cards/DownloadPDFCard';
import { handleCommit } from '../cards/CommitCard';
import { handleOpenHistoricalRecord } from '../cards/HistoricalRecordCard';

export default function LeftFormbar() {
  const dispatch = useDispatch();
  const fields = useSelector((state) => state.form.fields);
  const status = useSelector((state) => state.form.status);
  const isSubmitting = useSelector((state) => state.form.isSubmitting);
  const duplicateFlag = useSelector((state) => state.ai.duplicateFlag);
  const auditNotes = useSelector((state) => state.ai.auditNotes);

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [complaintHistory, setComplaintHistory] = useState([]);
  const [historySearch, setHistorySearch] = useState('');
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({ show: false, type: 'single', id: null, refId: null });

  const fetchComplaintHistory = async () => {
    setIsLoadingHistory(true);
    setShowHistoryModal(true);
    try {
      const res = await fetch('http://localhost:8000/api/complaints/');
      if (res.ok) {
        const data = await res.json();
        setComplaintHistory(Array.isArray(data) ? data : []);
      } else {
        setComplaintHistory([]);
      }
    } catch (err) {
      console.error('Error fetching complaint history:', err);
      setComplaintHistory([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const openDeleteModal = (id, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setDeleteConfirmModal({ show: true, type: 'single', id, refId: `QMS-2026-00${id}` });
  };

  const openClearAllModal = () => {
    setDeleteConfirmModal({ show: true, type: 'all', id: null, refId: null });
  };

  const handleConfirmDelete = async () => {
    const targetType = deleteConfirmModal.type;
    const targetId = deleteConfirmModal.id;
    const targetRefId = deleteConfirmModal.refId;

    // Immediately close modal & update UI state (0ms latency)
    setDeleteConfirmModal({ show: false, type: 'single', id: null, refId: null });

    if (targetType === 'single' && targetId) {
      // Optimistic UI Removal
      setComplaintHistory((prev) => prev.filter((item) => item.id !== targetId));
      showNotification(`Deleted record ${targetRefId} from database.`, 'warning');

      try {
        const res = await fetch(`http://localhost:8000/api/complaints/${targetId}`, {
          method: 'DELETE',
        });
        if (!res.ok) {
          fetchComplaintHistory();
          showNotification(`Failed to delete record ${targetRefId} from database.`, 'error');
        }
      } catch (err) {
        console.error('Error deleting complaint record:', err);
        fetchComplaintHistory();
      }
    } else if (targetType === 'all') {
      // Optimistic UI Clear
      setComplaintHistory([]);
      showNotification('Cleared all history records from database.', 'warning');

      try {
        const res = await fetch('http://localhost:8000/api/complaints/all', {
          method: 'DELETE',
        });
        if (!res.ok) {
          fetchComplaintHistory();
        }
      } catch (err) {
        console.error('Error clearing complaint history:', err);
        fetchComplaintHistory();
      }
    }
  };

  const showNotification = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 4500);
  };

  const handleReset = () => {
    dispatch(resetForm());
    dispatch(resetAiState());
    showNotification('Form reset to default state.', 'info');
  };

  return (
    <div className="flex-1 bg-slate-50/40 overflow-y-auto h-screen p-6 md:p-8 custom-scrollbar relative">
      {/* Sleek UI Toast Notification Banner */}
      {toast.show && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-md shadow-lg border flex items-center gap-3 transition-all duration-300 ${toast.type === 'success'
          ? 'bg-emerald-950 text-emerald-100 border-emerald-800'
          : toast.type === 'warning'
            ? 'bg-amber-950 text-amber-100 border-amber-800'
            : 'bg-slate-900 text-slate-100 border-slate-700'
          }`}>
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
          {toast.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />}
          {toast.type === 'info' && <FlaskConical className="w-5 h-5 text-indigo-400 shrink-0" />}
          <span className="text-sm font-medium">{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast({ show: false, message: '', type: 'success' })}
            className="p-1 hover:bg-white/10 rounded transition text-slate-400 hover:text-white ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header Section */}
        <div className="bg-white border border-slate-200/80 rounded-md p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Log Customer Complaint</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">API & FDF Quality Assurance Module</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Status Badge */}
            {status === 'Pending Triage' && (
              <span className="px-3 py-1 bg-amber-50/80 text-amber-700 border border-amber-300 text-xs font-semibold rounded-md">
                Pending Triage
              </span>
            )}
            {status === 'Ready to Commit' && (
              <span className="px-3 py-1 bg-emerald-50/80 text-emerald-700 border border-emerald-300 text-xs font-semibold rounded-md">
                Ready to Commit
              </span>
            )}
            {status === 'Committed' && (
              <span className="px-3 py-1 bg-indigo-50/80 text-indigo-700 border border-indigo-300 text-xs font-semibold rounded-md">
                Committed
              </span>
            )}

            {/* View QMS History Button */}
            <button
              type="button"
              onClick={fetchComplaintHistory}
              className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold rounded-md flex items-center gap-2 transition cursor-pointer shadow-xs"
              title="View immutable QMS Ledger audit history"
            >
              <Database className="w-4 h-4 text-indigo-600" />
              View History
            </button>

            {/* Download PDF Button */}
            <button
              type="button"
              onClick={() => handleDownloadPDF(fields)}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold rounded-md flex items-center gap-2 transition cursor-pointer shadow-xs"
              title="Download Log Customer Complaint form as PDF"
            >
              <Download className="w-4 h-4 text-slate-600" />
              Download PDF
            </button>
          </div>
        </div>

        {/* Duplicate Complaint Detection Warning Banner */}
        {duplicateFlag && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-md shadow-xs flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-amber-900">Duplicate Complaint Detected</h3>
              <p className="text-xs text-amber-800 mt-0.5">{auditNotes || 'Duplicate batch record detected in the QMS Ledger.'}</p>
            </div>
          </div>
        )}

        <form onSubmit={(e) => handleCommit(e, { fields, status, dispatch, showNotification })} className="space-y-6">
          {/* 1. ORIGIN & CUSTOMER DETAILS */}
          <div className="bg-white border border-slate-200/80 rounded-md p-6 shadow-xs space-y-4">
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
          <div className="bg-white border border-slate-200/80 rounded-md p-6 shadow-xs space-y-4">
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
          <div className="bg-white border border-slate-200/80 rounded-md p-6 shadow-xs space-y-4">
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
          <div className="bg-white border border-slate-200/80 rounded-md p-6 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              4. DEFECT ANALYSIS
            </h2>
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                  <label className="block font-semibold text-slate-800 mb-1.5">Complaint Date</label>
                  <input
                    type="text"
                    name="complaintDate"
                    readOnly
                    value={fields.complaintDate || ''}
                    placeholder="Awaiting AI extraction..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:outline-none text-sm cursor-not-allowed"
                  />
                </div>
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
          <div className="p-6 bg-indigo-50/70 border border-indigo-100/90 rounded-md space-y-4">
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

          {/* Action Buttons: Reset Form & Save Complaint */}
          <div className="pt-2 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-md font-semibold text-sm transition flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-slate-500" />
              Reset Form
            </button>
            <button
              type="submit"
              disabled={isSubmitting || status !== 'Ready to Commit'}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold text-sm transition flex items-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4 text-white" />
              Save Complaint
            </button>
          </div>
        </form>
      </div>

      {/* Immutable QMS Ledger History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold">QMS Ledger Audit History</h2>
                    <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold rounded-full flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Immutable Audit Record
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">Permanent log of all committed customer complaints</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter / Search Bar */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="Filter records by Product, Customer Name, Batch #, or Category..."
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:border-indigo-500 text-slate-800"
                />
              </div>

              {complaintHistory.length > 0 && (
                <button
                  type="button"
                  onClick={openClearAllModal}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-md flex items-center gap-1.5 transition cursor-pointer shadow-xs shrink-0"
                  title="Delete all complaint history records from database"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  Clear All History
                </button>
              )}

              <span className="text-xs text-slate-500 font-medium px-2 shrink-0">
                Total: {complaintHistory.length} Record(s)
              </span>
            </div>

            {/* Modal Body / Table */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {isLoadingHistory ? (
                <div className="py-12 text-center text-slate-500 space-y-2">
                  <FlaskConical className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                  <p className="text-sm font-medium">Fetching committed QMS ledger records...</p>
                </div>
              ) : complaintHistory.length === 0 ? (
                <div className="py-12 text-center text-slate-500 space-y-2">
                  <Database className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-base font-semibold text-slate-700">No Committed Complaints Found</p>
                  <p className="text-xs text-slate-400">Extract a complaint using AIVOA Copilot and click "Commit to QMS Ledger".</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-md">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Ref ID</th>
                        <th className="p-3">Customer</th>
                        <th className="p-3">Product Name</th>
                        <th className="p-3">Batch / Lot #</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Severity</th>
                        <th className="p-3">Committed Date</th>
                        <th className="p-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-800">
                      {(Array.isArray(complaintHistory) ? complaintHistory : [])
                        .filter((c) => {
                          const query = (historySearch || '').toLowerCase();
                          return (
                            !query ||
                            (c.product_name || '').toLowerCase().includes(query) ||
                            (c.customer_name || '').toLowerCase().includes(query) ||
                            (c.batch_lot_number || '').toLowerCase().includes(query) ||
                            (c.complaint_category || '').toLowerCase().includes(query)
                          );
                        })
                        .map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50 transition">
                            <td className="p-3 font-mono font-bold">
                              <button
                                type="button"
                                onClick={() => handleOpenHistoricalRecord(item, dispatch, setShowHistoryModal, showNotification)}
                                className="text-indigo-600 hover:underline cursor-pointer flex items-center gap-1"
                                title="Click to view full complaint record"
                              >
                                QMS-2026-00{item.id}
                              </button>
                            </td>
                            <td className="p-3 font-semibold">{item.customer_name || 'N/A'}</td>
                            <td className="p-3">{item.product_name || 'N/A'}</td>
                            <td className="p-3 font-mono font-semibold text-slate-900">{item.batch_lot_number || 'N/A'}</td>
                            <td className="p-3">{item.complaint_category || 'N/A'}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.suggested_severity === 'Critical'
                                  ? 'bg-rose-100 text-rose-700'
                                  : item.suggested_severity === 'Major'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-slate-100 text-slate-700'
                                }`}>
                                {item.suggested_severity || 'Major'}
                              </span>
                            </td>
                            <td className="p-3 text-slate-500">
                              {item.created_at ? new Date(item.created_at).toLocaleString() : 'N/A'}
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2 justify-center">
                                <button
                                  type="button"
                                  onClick={() => handleOpenHistoricalRecord(item, dispatch, setShowHistoryModal, showNotification)}
                                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer shadow-xs transition"
                                  title="Open full complaint details in form"
                                >
                                  <Eye className="w-3.5 h-3.5 text-white" /> Open
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => openDeleteModal(item.id, e)}
                                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer shadow-xs transition"
                                  title="Delete this complaint record from database"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-white" /> Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer / Compliance Notice */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Compliance Note:</strong> Administrative override enabled for QMS ledger maintenance.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-md text-xs transition cursor-pointer"
              >
                Close Ledger History
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Dialog Modal */}
      {deleteConfirmModal.show && (
        <div className="fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-md shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                <AlertCircle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Confirm Deletion</h3>
                <p className="text-xs text-slate-500 font-medium">QMS Database Action</p>
              </div>
            </div>

            <p className="text-sm font-semibold text-slate-700 leading-relaxed">
              {deleteConfirmModal.type === 'single'
                ? `Do you want to delete complaint record ${deleteConfirmModal.refId}?`
                : 'Do you want to delete all complaint history from the database?'}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmModal({ show: false, type: 'single', id: null, refId: null })}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold rounded-md text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-md text-xs transition cursor-pointer shadow-xs"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
