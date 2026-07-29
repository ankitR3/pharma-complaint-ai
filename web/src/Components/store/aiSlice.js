import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  duplicateFlag: false,
  auditNotes: '',
  suggestions: [],
  isLoading: false,
  error: null,
};

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    setAuditResults: (state, action) => {
      state.duplicateFlag = action.payload.duplicate_flag ?? false;
      state.auditNotes = action.payload.notes ?? '';
    },
    setSuggestions: (state, action) => {
      state.suggestions = action.payload;
    },
    setAiLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setAiError: (state, action) => {
      state.error = action.payload;
    },
    resetAiState: (state) => {
      state.duplicateFlag = false;
      state.auditNotes = '';
      state.suggestions = [];
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const {
  setAuditResults,
  setSuggestions,
  setAiLoading,
  setAiError,
  resetAiState,
} = aiSlice.actions;

export default aiSlice.reducer;
