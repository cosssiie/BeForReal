import React, { useState } from 'react';

const reasons = [
    'Reason1',
    'Reason2',
    'Reason3',
    'Reason4',
    'Another'
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
                            <label>
                                <input
                                    type="radio"
                                    name="reason"
                                    value={reason}
                                    onChange={() => setSelectedReason(reason)}
                                />
                                {reason}
                            </label>
                        </li>
                    ))}
                </ul>
                {selectedReason === 'Another' && (
                    <textarea
                        value={customReason}
                        onChange={(e) => setCustomReason(e.target.value)}
                        placeholder="Describe the problem"
                    />
                )}
                <div className="modal-actions">
                    <button onClick={handleSubmit}>Send</button>
                    <button onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
}

export default ReportModal;
