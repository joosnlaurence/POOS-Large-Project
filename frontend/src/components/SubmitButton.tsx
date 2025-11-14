import React from 'react';
import '../scss/SubmitButton.scss';

interface SubmitButtonProps {
    width?: string;
    onClick: () => void;
    isDisabled?: boolean;
    disabledMsg?: string;
    defaultMsg: string;
    className?: string;
    id?: string;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({
    width = "70%",
    onClick,
    isDisabled = false,
    disabledMsg = "",
    defaultMsg,
    className = "",
    id = "",
}) => {
    return (
        <button 
            type="button" 
            className={`btn fw-medium mx-auto shadow-lg submit-btn ${className}`} 
            id={id}
            style={{ width }}
            onClick={onClick} disabled={isDisabled}
        >
            { isDisabled ? (
                <>
                    <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
                    <span role="status">{disabledMsg}</span>
                </>
            ) : (defaultMsg) }
        </button>
    )
};