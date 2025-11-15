import React from 'react';

interface FormInputProps {
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date' | 'time';
    id?: string;
    label: string;
    placeholder?: string;
    inputValue: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: () => void;
    isSuccess: boolean | null;
    statusMsg?: string;
    successIcon?: string;
    errorIcon?: string;
    formWidth?: string;
    inputWidth?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
    formClassName?: string;
}

// form input react component to make putting more input fields easier
export const FormInput: React.FC<FormInputProps> = ({
    type = "text",
    id = "floatingInputValue",
    label,
    placeholder = "",
    inputValue,
    onChange,
    onSubmit,
    isSuccess,
    statusMsg = "",
    successIcon = "bi-check-circle-fill",
    errorIcon = "bi-exclamation-diamond-fill",
    formWidth = "100%",
    inputWidth = "80%",
    required = false,
    disabled = false,
    className = "",
    formClassName = ""
}) => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSubmit();
    };

    const handleInvalid = (e: React.InvalidEvent<HTMLInputElement>) => {
        e.preventDefault();
        onSubmit();
    };

    return (
        <form 
            className={formClassName}
            style={{ width: formWidth }}
            onSubmit={handleSubmit}
        >
            <div className="form-floating mx-auto" style={{ width: inputWidth }}>
                <input 
                    type={type}
                    className={`form-control ${isSuccess === false ? "failure-send" : ""} ${className}`}
                    id={id}
                    placeholder={placeholder}
                    value={inputValue}
                    onChange={onChange}
                    onInvalid={handleInvalid}
                    aria-label={label}
                    aria-labelledby={label}
                    required={required}
                    disabled={disabled}
                />
                <label htmlFor={id}>{label}</label>
            </div>
            
            {statusMsg && (
                <div className="status-msg mx-auto">
                 
                <i className={`bi p-2 ${isSuccess 
                    ? `${successIcon} success-text` 
                    : `${errorIcon} failure-text`}`}
                ></i>
                <span className={`fw-medium ${isSuccess ? "success-text" : "failure-text"}`}>
                    {statusMsg}
                </span>
                </div>
            )}
        </form>
    );
};