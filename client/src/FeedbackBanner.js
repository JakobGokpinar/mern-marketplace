import React, { useEffect } from "react";
import "./FeedbackBanner.css";
import { useDispatch, useSelector } from "react-redux";
import { uiSliceActions } from "./features/uiSlice";

const severityMap = {
  success: "success",
  error: "danger",
  warning: "warning",
  info: "info",
};

const FeedbackBanner = () => {
  const bannerSeverity = useSelector((state) => state.ui.feedbackBannerSeverity);
  const showBanner = useSelector((state) => state.ui.showFeedbackBanner);
  const bannerMsg = useSelector((state) => state.ui.feedbackBannerMsg);
  const dispatch = useDispatch();

  const closeBanner = () => {
    dispatch(uiSliceActions.hideFeedbackBanner());
  };

  useEffect(() => {
    if (showBanner) {
      const timer = setTimeout(() => {
        dispatch(uiSliceActions.hideFeedbackBanner());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showBanner, dispatch]);

  if (!showBanner) return null;

  return (
    <div className="feedback-div">
      <div className={`feedback-banner alert alert-${severityMap[bannerSeverity] || "info"} alert-dismissible`} role="alert">
        {bannerMsg}
        <button type="button" className="btn-close" onClick={closeBanner} aria-label="Close" />
      </div>
    </div>
  );
};

export default FeedbackBanner;