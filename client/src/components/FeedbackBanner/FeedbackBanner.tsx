import { useEffect } from "react";
import styles from "./FeedbackBanner.module.css";
import { useDispatch } from "react-redux";
import { useAppSelector } from "../../store/hooks";
import { uiSliceActions } from "../../store/uiSlice";

const severityMap: Record<string, string> = {
  success: "success",
  error: "danger",
  warning: "warning",
  info: "info",
};

const FeedbackBanner = () => {
  const bannerSeverity = useAppSelector((state) => state.ui.feedbackBannerSeverity);
  const showBanner = useAppSelector((state) => state.ui.showFeedbackBanner);
  const bannerMsg = useAppSelector((state) => state.ui.feedbackBannerMsg);
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
    <div className={styles['feedback-div']}>
      <div className={`${styles['feedback-banner']} alert alert-${severityMap[bannerSeverity] || "info"} alert-dismissible`} role="alert">
        {bannerMsg}
        <button type="button" className="btn-close" onClick={closeBanner} aria-label="Close" />
      </div>
    </div>
  );
};

export default FeedbackBanner;
