import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "../scss/ChangePassword.scss";
import * as URL from "../url.ts";

const ChangePassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"success" | "error">("error");
  const [loading, setLoading] = useState(false);
  
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setMsg("Invalid reset link");
      setMsgType("error");
    }
  }, [token]);

  async function handleReset() {
    setMsg("");

    if (!newPassword.trim() || !confirmPassword.trim()) {
      setMsg("Please fill in all fields");
      setMsgType("error");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMsg("Passwords do not match");
      setMsgType("error");
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
        setMsg("Password reset successfully!");
        setMsgType("success");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setMsg(data.error || "Failed to reset password");
        setMsgType("error");
      }
    } catch (err) {
      console.error("Error:", err);
      setMsg("Could not connect to the server");
      setMsgType("error");
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
    <div className="changePassword__wrap">
      <h1 className="changePassword__title">Change Password</h1>
      <p className="changePassword__subtitle">Enter your new password</p>

      <div className="changePassword__form">
        <div className="changePassword__field">
          <label className="changePassword__label">New Password</label>
          <input
            type="password"
            className="changePassword__input"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        <div className="changePassword__field">
          <label className="changePassword__label">Confirm Password</label>
          <input
            type="password"
            className="changePassword__input"
            placeholder="Re-enter new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleReset()}
          />
        </div>
      </div>

      {msg && (
        <div className={`changePassword__message changePassword__message--${msgType}`}>
          {msg}
        </div>
      )}

      <button 
        className="changePassword__btn" 
        onClick={handleReset} 
        disabled={loading}
      >
        {loading ? "Resetting..." : "Reset Password"}
      </button>
    </div>
  );
};

export default ChangePassword;
