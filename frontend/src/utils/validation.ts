import type { ValidateResponse } from "./passwordResetUtils";
import * as EmailValidtor from 'email-validator';

export function validateEmail(email: string): ValidateResponse {
    let msg: string;
    let valid: boolean;
    
    if (!email.trim()) {
        msg = "Email cannot be blank!"
        valid = false;
    }
    else if(!EmailValidtor.validate(email)) {
        msg = "Invalid email address format!";
        valid = false;
    }
    else {
        msg = ""
        valid = true;
    }

    return { valid, msg }
}