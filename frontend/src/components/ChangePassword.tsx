import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import "../scss/ChangePassword.scss";
import * as URL from "../url.ts";
import { WheresMyWaterTitle } from "./WheresMyWaterTitle.tsx";
import { FormInput } from "./FormInput.tsx";
import { SubmitButton } from "./SubmitButton.tsx";

const ChangePassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(true);
    
    const token = searchParams.get("token");

    useEffect(() => {
        if (!token) {
        setMsg("Invalid reset link");
        }
    }, [token]);

    async function handleReset() {
        setMsg("");

        if (!newPassword.trim() || !confirmPassword.trim()) {
        setMsg("Please fill in all fields");
        setSuccess(false);
        return;
        }

        if (newPassword !== confirmPassword) {
        setMsg("Passwords do not match");
        setSuccess(false);
        return;
        }

        setLoading(true);

        try {
        const response = await fetch(URL.buildPath("api/users/reset-password"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, newPassword }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
            setMsg("Password reset successfully! Going back to login...");
            setSuccess(true);
            setTimeout(() => navigate("/login"), 2000);
        } else {
            setMsg(data.error || "Failed to reset password");
            setSuccess(false);
        }
        } catch (err) {
            console.error("Error:", err);
            setMsg("Could not connect to the server");
            setSuccess(false);
        } finally {
            setLoading(false);
        }
    }

    if (!token) {
        return (
        <div className="changePassword__wrap">
            <h1 className="changePassword__title">Invalid Link</h1>
            <p className="changePassword__subtitle">This reset link is invalid or expired</p>
            <button className="changePassword__btn" onClick={() => navigate("/reset-password")}>
            Request New Link
            </button>
        </div>
        );
    }

    return (
        <div className="container-fluid d-flex justify-content-center align-items-center min-vh-100">
            <div className="main-container card shadow-lg p-4 mx-auto text-light">
                <WheresMyWaterTitle/>
                
                <h1 className="fw-semibold">Change Password</h1>
                <p className="fw-semibold">Enter your new password</p>

                <FormInput
                    type="password"
                    label="New Password"
                    placeholder="stealthispassword123"
                    inputValue={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    onSubmit={handleReset}
                    isSuccess={success}
                />

                <FormInput
                    type="password"
                    label="Confirm Password"
                    placeholder="stealthispassword123"
                    inputValue={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onSubmit={handleReset}
                    isSuccess={success}
                    statusMsg={msg}
                />

                <SubmitButton 
                    onClick={handleReset}
                    isDisabled={loading}
                    disabledMsg="Resetting..."
                    defaultMsg="Reset Password"
                />

                <Link to="/login" className="link-light link-underline-opacity-0 link-underline-opacity-75-hover">
                    Return to Login
                </Link>
            </div>
        </div>
    );
};

export default ChangePassword;
