import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PasswordReset.css";
import * as URL from "../url.ts";

const PasswordReset = () => {
    const [email, setEmail] = useState("");
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const [sendSuccess, setSendSuccess] = useState(false); 
    const navigate = useNavigate();

    async function handleSend() {
        if (!email.trim()) {
            setMsg("Please enter your email.");
            return;
        }

        setLoading(true);
        setMsg("");

        try {
        const response = await fetch(URL.buildPath("api/users/request-password-reset"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });

        const data = await response.json();
        if (response.ok && data.success) {
            setMsg("Reset link sent! Check your email.");
            setSendSuccess(true);
        } 
        else {
            setMsg(`${data.error || "Failed to send reset link."}`);
            setSendSuccess(false);
        }
        } 
        catch (err) {
            console.error("Error:", err);
            setMsg("Could not connect to the server.");
            setSendSuccess(false);
        } 
        finally {
            setLoading(false);
        }
    } 


    return (
        <div className="resetBody">
        <div className="headerContainer resetHeaderContainer">
            <div id="upperResetHead">Lost your treasure?</div>
            <div id="lowerResetHead">Reset Password</div>
        </div>

        <div className="resetInputContainer">
            <div className="resetInputTitle">
            <h2>Enter your email to reset your password</h2>
            </div>

            <div className="resetInputBlock">
            <label className="resetLabel">
                Email <span className="requiredSymbol">*</span>
            </label>
            <input
                type="email"
                className="inputField"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            {msg && (
                <div className={sendSuccess ? "successContainer" : "errorContainer"}>
                {msg}
                </div>
            )}
            </div>

            <button className="resetButton" onClick={handleSend} disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <div className="resetInputBlock returnLogin">
            <span>Remembered your password?</span>
            <span
                id="backToLogin"
                onClick={() => (navigate("/login"))}
            >
                {" "}Back to Login
            </span>
            </div>
        </div>
        </div>
    );
};

export default PasswordReset;
