import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  fields: {
    complaintSource: '',
    customerName: '',
    productName: '',
    productStrength: '',
    batchNumber: '',
    affectedQuantity: '',
    manufacturingDate: '',
    expiryDate: '',
    originatingBlock: '',
    impactedNpm: '',
    complaintCategory: '',
    complaintDescription: '',
    // Risk Assessment fields
    suggestedSeverity: '',
    suggestedNextAction: '',
    initialRiskAssessment: '',
  },
  status: 'Pending Triage', // 'Pending Triage' | 'Ready to Commit' | 'Committed'
  isSubmitting: false,
  error: null,
};

const formSlice = createSlice({
  name: 'form',
  initialState,
  reducers: {
    updateField: (state, action) => {
      const { field, value } = action.payload;
      state.fields[field] = value;
    },
    populateExtractedComplaint: (state, action) => {
      state.fields = {
        ...state.fields,
        ...action.payload.fields,
      };
      state.status = 'Ready to Commit';
    },
    updatePartialFields: (state, action) => {
      // Merges updated fields while preserving all existing form information
      state.fields = {
        ...state.fields,
        ...action.payload.fields,
      };
      state.status = 'Ready to Commit';
    },
    resetForm: (state) => {
      state.fields = initialState.fields;
      state.status = 'Pending Triage';
      state.error = null;
    },
    setStatus: (state, action) => {
      state.status = action.payload;
    },
    setSubmitting: (state, action) => {
      state.isSubmitting = action.payload;
    },
  },
});

export const {
  updateField,
  populateExtractedComplaint,
  updatePartialFields,
  resetForm,
  setStatus,
  setSubmitting,
} = formSlice.actions;

export default formSlice.reducer;
