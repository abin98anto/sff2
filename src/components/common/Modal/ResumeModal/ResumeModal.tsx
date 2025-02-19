import { createPortal } from "react-dom";
import "./ResumeModal.scss";

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeUrl: string;
}

const ResumeModal = ({ isOpen, onClose, resumeUrl }: ResumeModalProps) => {
  if (!isOpen) return null;

  const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(
    resumeUrl
  )}&embedded=true`;

  return createPortal(
    <div className="resume-modal-overlay" onClick={onClose}>
      <div
        className="resume-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <iframe
          src={googleDocsUrl}
          className="resume-iframe"
          title="Resume Viewer"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
      </div>
    </div>,
    document.body
  );
};

export default ResumeModal;
