import React, { useState, useEffect } from 'react';

const reasons = [
    "Спам",
    "Образливий контент",
    "Нецензурна лексика",
    "Реклама",
    "Порушення авторських прав",
    "Фейковий акаунт",
    "Порушення правил спільноти",
    "Неправдива інформація"
];

function ReportModal({ onClose, onSubmit }) {
    const [selectedReason, setSelectedReason] = useState('');
    const [customReason, setCustomReason] = useState('');

    const handleSubmit = () => {
        const reason = selectedReason === 'Another' ? customReason : selectedReason;
        if (reason) {
            onSubmit(reason);
            onClose();
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h3>Report</h3>
                <ul className="reason-list">
                    {reasons.map((reason) => (
                        <li key={reason}>
                            <label className="radio-label">
                                <input
                                    type="radio"
                                    name="reason"
                                    value={reason}
                                    onChange={() => setSelectedReason(reason)}
                                    className="radio-input"
                                />
                                <span className="radio-text">{reason}</span>
                            </label>
                        </li>
                    ))}
                </ul>
                {selectedReason === 'Another' && (
                    <textarea
                        value={customReason}
                        onChange={(e) => setCustomReason(e.target.value)}
                        placeholder="Describe the problem"
                        className="reason-textarea"
                    />
                )}
                <div className="modal-actions">
                    <button onClick={handleSubmit} className="submit-btn">Send</button>
                    <button onClick={onClose} className="cancel-btn">Cancel</button>
                </div>
            </div>
        </div>
    );
}

export default ReportModal;