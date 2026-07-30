import { setStatus, resetForm } from '../store/formSlice';

export const handleOpenHistoricalRecord = (item, dispatch, setShowHistoryModal, showNotification) => {
  dispatch(resetForm());
  dispatch(setStatus('Committed'));
  // Populate form fields with historical database record
  dispatch({
    type: 'form/populateExtractedComplaint',
    payload: {
      fields: {
        complaintSource: item.complaint_source || '',
        customerName: item.customer_name || '',
        productName: item.product_name || '',
        productStrength: item.product_strength_grade || '',
        batchNumber: item.batch_lot_number || '',
        affectedQuantity: item.affected_quantity || '',
        manufacturingDate: item.manufacturing_date || '',
        expiryDate: item.expiry_date || '',
        originatingBlock: item.originating_site_block || '',
        impactedNpm: item.impacted_npm || '',
        complaintCategory: item.complaint_category || '',
        complaintDate: item.complaint_date || '',
        complaintDescription: item.complaint_description || '',
        suggestedSeverity: item.suggested_severity || 'Major',
        suggestedNextAction: item.suggested_next_action || '',
        initialRiskAssessment: item.initial_risk_assessment || '',
      },
    },
  });
  if (setShowHistoryModal) setShowHistoryModal(false);
  if (showNotification) showNotification(`Opened historical QMS record QMS-2026-00${item.id}`, 'info');
};
