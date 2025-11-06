import { useNavigate } from "react-router-dom";
import "./VerifySuccess.css";

const VerifySuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="verifySuccess__wrap">
      <h1 className="verifySuccess__title">✅ Your account is now verified!</h1>
      <p className="verifySuccess__subtitle">
        You can now log in and use all features.
      </p>

      <div className="verifySuccess__actions">
        <button
          className="verifySuccess__btn verifySuccess__btn--primary"
          onClick={() => navigate("/home")}
        >
          Return Home
        </button>
      </div>
    </div>
  );
};

export default VerifySuccess;
