import React from 'react';
import '../scss/SubmitButton.scss';

interface SubmitButtonProps {
    width?: string;
    onClick: () => void;
    isDisabled?: boolean;
    disabledMsg?: string;
    defaultMsg: string;
    className?: string;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({
    width = "70%",
    onClick,
    isDisabled = false,
    disabledMsg = "",
    defaultMsg,
    className = ""
}) => {
    return (
        <button 
            type="button" 
            className={`btn fw-medium mx-auto shadow-lg submit-btn ${className} mb-4`} 
            style={{ width }}
            onClick={onClick} disabled={isDisabled}
        >
            {isDisabled ? disabledMsg : defaultMsg}
        </button>
    )
};