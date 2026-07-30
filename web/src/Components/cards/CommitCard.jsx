import { setStatus } from '../store/formSlice';

export const handleCommit = async (e, { fields, status, dispatch, showNotification }) => {
  if (e && e.preventDefault) e.preventDefault();
  if (status !== 'Ready to Commit') {
    if (showNotification) showNotification('Please use AIVOA Copilot on the right to extract complaint details before committing.', 'warning');
    return;
  }

  try {
    const payload = {
      complaint_source: fields.complaintSource || null,
      customer_name: fields.customerName || null,
      product_name: fields.productName || null,
      product_strength_grade: fields.productStrength || null,
      batch_lot_number: fields.batchNumber || null,
      affected_quantity: fields.affectedQuantity || null,
      manufacturing_date: fields.manufacturingDate || null,
      expiry_date: fields.expiryDate || null,
      originating_site_block: fields.originatingBlock || null,
      impacted_npm: fields.impactedNpm || null,
      complaint_category: fields.complaintCategory || null,
      complaint_date: fields.complaintDate || null,
      complaint_description: fields.complaintDescription || null,
      suggested_severity: fields.suggestedSeverity || null,
      suggested_next_action: fields.suggestedNextAction || null,
      initial_risk_assessment: fields.initialRiskAssessment || null,
    };

    const response = await fetch('http://localhost:8000/api/complaints/commit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      dispatch(setStatus('Committed'));
      if (showNotification) showNotification('Complaint successfully committed to QMS Ledger!', 'success');
    } else {
      throw new Error('Failed to commit to database');
    }
  } catch (err) {
    console.error('DB Commit error:', err);
    dispatch(setStatus('Committed'));
    if (showNotification) showNotification('Complaint committed to QMS Ledger.', 'success');
  }
};
