import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
    name: 'ui',
    initialState: {
        showFeedbackBanner: false,
        feedbackBannerSeverity: 'info',
        feedbackBannerMsg: '',
    },
    reducers:{
        showFeedbackBanner(state) {
            state.showFeedbackBanner = true
        },
        hideFeedbackBanner(state) {
            state.showFeedbackBanner = false
        },
        setFeedbackBannerSeverity(state, action) {
            state.feedbackBannerSeverity = action.payload;
        },
        setFeedbackBannerMsg(state,action) {
            state.feedbackBannerMsg = action.payload
        },
        setFeedbackBanner(state, action) {
            state.showFeedbackBanner = true;
            state.feedbackBannerSeverity = action.payload.severity;
            state.feedbackBannerMsg = action.payload.msg;
        }
    }
})

export const uiSliceActions = uiSlice.actions;

export default uiSlice;