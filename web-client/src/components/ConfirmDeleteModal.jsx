import React from "react";
import "../style/ConfirmDeleteModal.css";

const ConfirmDeleteModal = ({ onConfirm, onCancel }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Сигурни ли сте, че искате да изтриете това място?</h3>
        <div className="modal-actions">
          <button className="confirm-btn" onClick={onConfirm}>
            Да, изтрий
          </button>
          <button className="cancel-btn" onClick={onCancel}>
            Отказ
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
