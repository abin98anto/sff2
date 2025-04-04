import React from "react";
import "./CustomModal.scss";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  header: string;
  children: React.ReactNode;
  buttons?: {
    text: string;
    onClick: () => void;
    variant?: "primary" | "secondary";
  }[];
  className?: string;
}

const CustomModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  header,
  children,
  buttons,
  className = "",
}) => {
  if (!isOpen) return null;

  return (
    <div className="CusMod-overlay" onClick={onClose}>
      <div
        className={`CusMod-modal ${
          header === "Success" ? "success" : ""
        } ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`CusMod-header ${className}`}>
          <h2>{header}</h2>
        </div>
        <div className="CusMod-content">{children}</div>
        {buttons && buttons.length > 0 && (
          <div className="CusMod-footer">
            {buttons.map((button, index) => (
              <button
                key={index}
                className={`CusMod-button ${
                  button.variant === "primary"
                    ? "CusMod-primary"
                    : "CusMod-secondary"
                }`}
                onClick={button.onClick}
              >
                {button.text}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomModal;
