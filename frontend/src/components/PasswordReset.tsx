import { useState } from "react";
import { Link } from "react-router-dom";
import "../scss/PasswordReset.scss";
import * as URL from "../url.ts";
import waterText from '../assets/water.png';

const PasswordReset = () => {
    const [email, setEmail] = useState("");
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const [sendSuccess, setSendSuccess] = useState(true); 

    async function handleSend() {
        if (!email.trim()) {
            setMsg("Please enter your email.");
            setSendSuccess(false);
            return;
        }
        const emailInput = document.getElementById('floatingInputValue') as HTMLInputElement;
        if(!emailInput?.checkValidity()) {
            setMsg('Please enter a valid email address');
            setSendSuccess(false);
            return;
        }

        setLoading(true);

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
        <div className="container-fluid d-flex justify-content-center align-items-center min-vh-100">
            <div className="main-container card shadow-lg p-4 mx-auto">
                <div className="text-center mb-4 wheres-my-water inter">
                    <div>
                        <span id="wheres">Where's </span><span id="my"> My</span>
                    </div>
                    <div>
                        <img src={waterText} id="water"></img>
                    </div>
                </div>
                <div className="text-center mb-4">
                    <h3 className="text-light">Forgot Your Password?</h3>
                    <p className="text-light">Enter your email to get a link to reset your password</p>
                </div>
                <form 
                    className="mb-4" 
                    style={{width: "100%"}}
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSend();
                    }}
                >
                    <div className="form-floating mb-1" style={{width: "80%"}}>
                        <input 
                            type="email" 
                            className={`form-control ${sendSuccess ? "" : "failure-send"}`} 
                            id="floatingInputValue" 
                            placeholder="your@email.com" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)} 
                            onInvalid={(e) => {
                                e.preventDefault(); 
                                handleSend();
                            }}
                            aria-label="email" 
                            aria-labelledby="email" 
                        />
                        <label htmlFor="floatingInputValue">Email address</label>
                    </div>
                    
                    {msg && (
                        <div className="status-msg">
                            <i className={`bi p-2 ${sendSuccess 
                                ? "bi-check-circle-fill success-text" 
                                : "bi-exclamation-diamond-fill failure-text"}`}
                            ></i>
                            <span className={`fw-medium ${sendSuccess ? "success-text" : "failure-text"}`}>{msg}</span>
                        </div>
                    )}
                </form>
                
                <button type="button" className="btn fw-medium mx-auto shadow-lg send-email-btn mb-4" style={{width:"70%"}}
                        onClick={handleSend} disabled={loading}>
                    {loading ? "Sending..." : "Send Reset Link"}
                </button>

                <Link to="/login" className="link-light link-underline-opacity-0 link-underline-opacity-75-hover">
                    Return to Login
                </Link>
            </div>
        </div>
    );
};

export default PasswordReset;
