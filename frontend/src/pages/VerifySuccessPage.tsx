import { Link } from "react-router-dom";

import WheresMyWaterTitle from "../components/WheresMyWaterTitle";
import { MainCard } from "../components/MainCard";

const VerifySuccessPage = () => {
    return (
        <MainCard>
            <WheresMyWaterTitle/>
            
            <h1 className="mt-4 mb-4">Your account is now verified!</h1>
            <p className="mb-4 fs-5">You can now log in and use all features.</p>
            
            
            <Link to="/login" className="btn fw-medium mx-auto shadow-lg submit-btn" style = {{width: "50%"}}>
                Return to Login
            </Link>
        </MainCard>
    );
};

export default VerifySuccessPage;
