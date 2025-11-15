import { useState } from "react";
import { Link } from "react-router-dom";

import "../scss/PasswordReset.scss";

import WheresMyWaterTitle from "../components/WheresMyWaterTitle.tsx";
import { FormInput } from "../components/FormInput.tsx";
import { SubmitButton } from "../components/SubmitButton.tsx";
import { sendResetLink } from "../utils/passwordResetUtils.ts";
import { validateEmail } from "../utils/validation.ts";
import { PageTransition } from "../components/PageTransition.tsx";
import { MainCard } from "../components/MainCard.tsx";

const PasswordResetPage = () => {
    const [email, setEmail] = useState("");
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const [sendSuccess, setSendSuccess] = useState(false); 

    async function handleSend() {
        setMsg("");

        const emailInput = document.getElementById('floatingInputValue') as HTMLInputElement;
        const emailValidation = validateEmail(email, emailInput);

        if(!emailValidation.valid) {
            setMsg(emailValidation.msg);
            setSendSuccess(false);
            return;
        }

        setLoading(true);
        const res = await sendResetLink(email);
        setMsg(res.msg);
        setSendSuccess(res.success);
        setLoading(false);
    } 

    return (
        <PageTransition>
            <MainCard>
                <WheresMyWaterTitle></WheresMyWaterTitle>

                <div className="text-center mb-4">
                    <h3 className="text-light">Forgot Your Password?</h3>
                    <p className="text-light">Enter your email to get a link to reset your password</p>
                </div>
                
                <FormInput
                    type="email"
                    label="Email address"
                    placeholder="your@email.com"
                    inputValue={email}
                    onChange={(e) => setEmail(e.target.value)} 
                    onSubmit={handleSend}
                    isSuccess={msg ? sendSuccess : null}
                    statusMsg={msg}
                    formClassName="mb-4"
                />
                
                <SubmitButton
                    onClick={handleSend}
                    isDisabled={loading}
                    disabledMsg="Sending..."
                    defaultMsg="Send Reset Link"
                    className="mb-4"
                />

                <Link to="/login" className="link-light link-underline-opacity-100 link">
                    Return to Login →
                </Link>
            </MainCard>
        </PageTransition>
    );
};

export default PasswordResetPage;

