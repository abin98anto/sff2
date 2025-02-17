import React from "react";
import "./AddModal.scss";

interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
}

const AddModal: React.FC<ModalProps> = ({
  isOpen,
  title,
  onClose,
  onSubmit,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div className="addmodal-overlay">
      <div className="addmodal-content">
        <h2>{title}</h2>
        <form onSubmit={onSubmit}>
          {children}
          <div className="addmodal-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit">Submit</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddModal;
