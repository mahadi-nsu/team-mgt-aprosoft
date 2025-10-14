"use client";

import { useState } from "react";

interface ApprovalCircleProps {
  status: "pending" | "approved" | "rejected";
  onStatusChange: () => void;
  disabled?: boolean;
}

export default function ApprovalCircle({
  status,
  onStatusChange,
  disabled = false,
}: ApprovalCircleProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getStatusIcon = () => {
    switch (status) {
      case "approved":
        return "✓";
      case "rejected":
        return "✗";
      case "pending":
      default:
        return "";
    }
  };

  const getStatusStyles = () => {
    switch (status) {
      case "approved":
        return {
          backgroundColor: "#28a745", // Bootstrap success green
          color: "white",
          border: "2px solid #28a745",
        };
      case "rejected":
        return {
          backgroundColor: "#dc3545", // Bootstrap danger red
          color: "white",
          border: "2px solid #dc3545",
        };
      case "pending":
      default:
        return {
          backgroundColor: "#adb5bd", // Bootstrap light gray
          color: "white",
          border: "2px solid #adb5bd",
        };
    }
  };

  const getTooltipText = () => {
    switch (status) {
      case "approved":
        return "Approved";
      case "rejected":
        return "Rejected";
      case "pending":
      default:
        return "No Action Taken";
    }
  };

  return (
    <div
      className={`d-inline-block ${disabled ? "pe-none" : "pe-auto"}`}
      style={{ cursor: disabled ? "default" : "pointer" }}
      onClick={disabled ? undefined : onStatusChange}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={isHovered ? getTooltipText() : ""}
    >
      <div
        className={`d-flex align-items-center justify-content-center ${
          disabled ? "opacity-50" : ""
        }`}
        style={{
          ...getStatusStyles(),
          width: "24px",
          height: "24px",
          borderRadius: "50%",
          fontSize: "0.9rem",
          fontWeight: "bold",
          transition: "all 0.2s ease-in-out",
        }}
      >
        {getStatusIcon()}
      </div>
    </div>
  );
}
