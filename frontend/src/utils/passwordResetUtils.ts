import * as URL from '../url.ts';

export interface ValidateResponse {
    valid: boolean;
    msg: string;
}

export interface ApiResponse {
    success: boolean;
    msg: string;
}

export async function sendResetLink(email: string): Promise<ApiResponse> {
    let msg: string;
    let success: boolean;

    try {
        const response = await fetch(URL.buildPath("api/users/request-password-reset"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });

        const data = await response.json();
        if (response.ok && data.success) {
            msg = "Reset link sent! Check your email.";
            success = true;
        } 
        else {
            msg = `${data.error || "Failed to send reset link."}`;
            success = false;
        }
    } 
    catch (err) {
        console.error("Error in sending reset link:", err);
        msg = "Could not connect to the server.";
        success = false;
    } 

    return {success, msg};
}

export function checkNewPassword(newPassword: string, confirmPassword: string): ValidateResponse {
    let msg: string;
    let valid: boolean;

    if (!newPassword.trim() || !confirmPassword.trim()) {
        msg = "Please fill in all fields";
        valid = false;
    }
    else if (newPassword !== confirmPassword) {
        msg = "Passwords do not match";
        valid = false;
    }
    else {
        msg = "";
        valid = true;
    }

    return { valid, msg };
}

export async function resetPassword(token: string | null, newPassword: string): Promise<ApiResponse> {
    let msg: string;
    let success: boolean;

    try {
        const response = await fetch(URL.buildPath("api/users/reset-password"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, newPassword }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
            msg = "Password reset successfully! Going back to login...";
            success = true;
        }
         else {
            msg = data.error || "Failed to reset password";
            success = false;
        }
    }
    catch (err) {
        console.error("Error in resetting password:", err);
        msg = "Could not connect to the server";
        success = false;
    }

    return {success, msg};
}