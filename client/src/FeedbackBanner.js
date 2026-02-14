import React, { useEffect } from "react";

import "./FeedbackBanner.css";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import CloseIcon from "@mui/icons-material/Close";
import { useDispatch, useSelector } from "react-redux";
import { uiSliceActions } from "./features/uiSlice";

const FeedbackBanner = () => {

  const bannerSeverity = useSelector(state => state.ui.feedbackBannerSeverity);
  const showBanner = useSelector(state => state.ui.showFeedbackBanner);
  const bannerMsg = useSelector(state => state.ui.feedbackBannerMsg)
  const dispatch = useDispatch();

  const closeBanner = () => {
    dispatch(uiSliceActions.hideFeedbackBanner());
  }

  useEffect(() => {
    if(showBanner) {
      setInterval(() => {
        dispatch(uiSliceActions.hideFeedbackBanner())
      }, 5000)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showBanner])


  return (
    <div className="feedback-div">
      <Collapse in={showBanner} className="feedback-banner">
        <Alert
          variant="filled"
          severity={bannerSeverity}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => {
                closeBanner()
              }}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          {bannerMsg}
        </Alert>
      </Collapse>
    </div>
  );
};

export default FeedbackBanner;
