import type React from "react";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import "./ConfirmationModal.scss";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onYes: () => void;
  onNo: () => void;
  title: string;
  content: string;
}

const ConfirmationModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onYes,
  onNo,
  title,
  content,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="conf-modal-overlay">
      <div className="conf-modal" ref={modalRef}>
        <div className="conf-modal-header">
          <h2>{title}</h2>
        </div>
        <div className="conf-modal-content">
          <p>{content}</p>
        </div>
        <div className="conf-modal-actions">
          <button onClick={onYes} className="conf-btn btn-yes">
            Yes
          </button>
          <button onClick={onNo} className="conf-btn btn-no">
            No
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmationModal;
