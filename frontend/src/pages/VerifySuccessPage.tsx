import { Link } from "react-router-dom";

import "../scss/VerifySuccess.scss";
import { WheresMyWaterTitle } from "../components/WheresMyWaterTitle";

const VerifySuccessPage = () => {
    return (
        <div className="container-fluid d-flex justify-content-center align-items-center min-vh-100">
            <div className="main-container card shadow-lg p-4 mx-auto text-light">
                <WheresMyWaterTitle/>
                
                <h1 className="mt-4 mb-4">Your account is now verified!</h1>
                <p className="mb-4 fs-5">You can now log in and use all features.</p>
                
                
                <Link to="/login" className="btn fw-medium mx-auto shadow-lg submit-btn" style = {{width: "50%"}}>
                    Return to Login
                </Link>
            </div>
        </div>
    );
};

export default VerifySuccessPage;
