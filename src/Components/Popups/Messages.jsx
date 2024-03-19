import React from "react";
import { Alert, Progress } from "antd";

const Messages = ({ messageType, message, percent, status }) => {
  const ErrorMessage = () => {
    return <Alert message={message} type="error" showIcon />;
  };

  const SuccessMessage = () => {
    return <Alert message={message} type="success" showIcon />;
  };

  const CustomProgressBar = () => {
    return <Progress type="circle" percent={percent} status={status} />;
  };

  const renderMessage = () => {
    switch (messageType) {
      case "error":
        return <ErrorMessage />;
      case "success":
        return <SuccessMessage />;
      case "progress":
        return <CustomProgressBar />;
      default:
        return null;
    }
  };

  return <div>{renderMessage()}</div>;
};

export default Messages;
