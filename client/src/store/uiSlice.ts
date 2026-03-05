import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type Severity = 'info' | 'success' | 'error' | 'warning';

interface UIState {
  showFeedbackBanner: boolean;
  feedbackBannerSeverity: Severity;
  feedbackBannerMsg: string;
}

const initialState: UIState = {
  showFeedbackBanner: false,
  feedbackBannerSeverity: 'info',
  feedbackBannerMsg: '',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showFeedbackBanner(state) {
      state.showFeedbackBanner = true;
    },
    hideFeedbackBanner(state) {
      state.showFeedbackBanner = false;
    },
    setFeedbackBannerSeverity(state, action: PayloadAction<Severity>) {
      state.feedbackBannerSeverity = action.payload;
    },
    setFeedbackBannerMsg(state, action: PayloadAction<string>) {
      state.feedbackBannerMsg = action.payload;
    },
    setFeedbackBanner(state, action: PayloadAction<{ severity: Severity; msg: string }>) {
      state.showFeedbackBanner = true;
      state.feedbackBannerSeverity = action.payload.severity;
      state.feedbackBannerMsg = action.payload.msg;
    },
  },
});

export const uiSliceActions = uiSlice.actions;

export default uiSlice;
