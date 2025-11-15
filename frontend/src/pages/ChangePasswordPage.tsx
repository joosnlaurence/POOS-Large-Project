import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";

import WheresMyWaterTitle from "../components/WheresMyWaterTitle.tsx";
import { FormInput } from "../components/FormInput.tsx";
import { SubmitButton } from "../components/SubmitButton.tsx";
import { resetPassword, checkNewPassword } from "../utils/passwordResetUtils.ts";
import { MainCard } from "../components/MainCard.tsx";

const ChangePasswordPage = () => {
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

        const validate = checkNewPassword(newPassword, confirmPassword);
        if(!validate.valid){
            setMsg(validate.msg);
            setSuccess(false);
            return;
        }


        setLoading(true);
        const res = await resetPassword(token, newPassword);
        setMsg(res.msg);
        setSuccess(res.success);
        if(res.success)
            setTimeout(() => navigate("/login"), 2000);
        setLoading(false);
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
        <MainCard>
            <WheresMyWaterTitle/>
            
            <h1 className="fw-semibold text-light">Change Password</h1>
            <p className="fw-semibold text-light">Enter your new password</p>

            <FormInput
                type="password"
                label="New Password"
                placeholder="stealthispassword123"
                inputValue={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onSubmit={handleReset}
                isSuccess={success}
                className="mb-4"
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
                className='mb-4'
            />

            <SubmitButton 
                onClick={handleReset}
                isDisabled={loading}
                disabledMsg="Resetting..."
                defaultMsg="Reset Password"
                className="mb-4"
            />

            <Link to="/login" className="link-light link">
                Return to Login
            </Link>
        </MainCard>
    );
};

export default ChangePasswordPage;
