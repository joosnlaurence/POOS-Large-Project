import type { ValidateResponse } from "./passwordResetUtils";

export function validateEmail(email: string, emailInputElement: HTMLInputElement | null): ValidateResponse {
    let msg: string;
    let valid: boolean;
    
    if (!email.trim()) {
        msg = "Email cannot be blank."
        valid = false;
    }
    else if(!emailInputElement?.checkValidity()) {
        msg = "Invalid email address format";
        valid = false;
    }
    else {
        msg = ""
        valid = true;
    }

    return { valid, msg }
}