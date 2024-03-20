import React from "react";
import CircularProgress, {
  CircularProgressProps,
} from "@mui/material/CircularProgress";

const CircularProgressWithLabel = (props) => {
  const { value, ...otherProps } = props;

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <CircularProgress {...otherProps} value={value} />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          color: value === 100 ? "transparent" : "inherit", // Hide label when progress is complete
        }}
      >
        <span>{`${Math.round(value)}%`}</span>
      </div>
    </div>
  );
};

export default CircularProgressWithLabel;
