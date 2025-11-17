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
    style?: object;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({
    width = "70%",
    onClick,
    isDisabled = false,
    disabledMsg = "",
    defaultMsg,
    className = "",
    id = "",
    style = {},
}) => {
    return (
        <button 
            type="button" 
            className={`btn fw-medium mx-auto shadow-lg submit-btn ${className}`} 
            id={id}
            style={{ width, ...style}}
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