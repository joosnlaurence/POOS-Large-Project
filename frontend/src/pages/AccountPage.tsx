import { useEffect, useState} from "react";
import { MainCard } from "../components/MainCard";
import Navbar from "../components/Navbar";
import { PageTransition } from "../components/PageTransition";
import WheresMyWaterTitle from "../components/WheresMyWaterTitle";
import { SubmitButton } from "../components/SubmitButton";
import { sendResetLink } from "../utils/passwordResetUtils";
import { useNavigate } from "react-router-dom";
import * as URL from '../url';

function AccountPage()
{
    const [username, setUsername] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [isVerified, setIsVerified] = useState(false);
    const [verificationMsg, setVerificationMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [changePasswordMsg, setChangePasswordMsg] = useState("Sending...");
    const [linkSent, setLinkSent] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        getUserData();
    }, []);

    function getUserData()
    {
        const stored = localStorage.getItem("user_data");
        if (!stored)
        {
            navigate("/");
            return;
        }
        const userData = JSON.parse(stored);

        setUsername(userData.username);
        setFirstName(userData.firstName);
        setLastName(userData.lastName);
        setEmail(userData.email);
    }

    async function handleSend()
    {
        setLinkSent(false);
        setChangePasswordMsg("");

        setLoading(true);
        const res = await sendResetLink(email);
        setChangePasswordMsg(res.msg);
        setLoading(false);
        setLinkSent(true);
    }

    const StatusText: React.FC<{success: boolean, msg: string}> = ({success, msg}) => {
        return (
            <div className="d-flex gap-2 justify-content-center">
                <i className={`bi ${ success
                    ? `bi-patch-check-fill success-text` 
                    : `bi-x-circle-fill failure-text`}`}
                ></i>
                <span className={`fw-medium ${success ? "success-text" : "failure-text"}`}>
                    {msg}
                </span>
            </div>
        );
    };

    useEffect(() => {
        if(email) {
            checkVerification();
        }
    }, [email]);

    async function checkVerification() {
        const response = await fetch(URL.buildPath("api/users/check-verification"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });

        const res = await response.json();

        if(!res.success) {
            setIsVerified(false);
            setVerificationMsg("Could not check if email is verified...");
            return;
        }

        if(res.isVerified){
            setIsVerified(true);
            setVerificationMsg("Email verified!");
            const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
            userData.isVerified = true;
            localStorage.setItem('user_data', JSON.stringify(userData));
            return;
        }
        else {
            setIsVerified(false);
            setVerificationMsg('Email not verified...')
            return;
        }
    }


    return (
        <div className="d-flex flex-column vh-100">
            <Navbar/>
            <PageTransition>
                <MainCard >
                    <WheresMyWaterTitle className="mb-4" />    

                    <h1 className="mb-2 text-light">
                        My Account
                    </h1>

                    <div className="mb-3 mt-3 fs-5 w-75">
                        <p className="mb-2 text-light d-flex justify-content-between">
                            <strong>First Name: </strong>{firstName}
                        </p>
                        <p className="mb-2 text-light d-flex justify-content-between">
                            <strong>Last Name: </strong>{lastName}
                        </p>
                        <p className="mb-2 text-light d-flex justify-content-between">
                            <strong>Username: </strong>{username}
                        </p>
                        <p className="mb-2 text-light d-flex justify-content-between">
                            <strong>Email: </strong>{email}
                        </p>
                        <StatusText 
                            success={isVerified}
                            msg={verificationMsg}
                        />
                    </div>
                    <SubmitButton
                        onClick={handleSend}
                        isDisabled={loading}
                        defaultMsg="Change Password"
                        disabledMsg={changePasswordMsg}
                        className="mb-4"
                    />
                    {linkSent && (
                        <div>
                            <i className={`bi p-2 bi-check-circle-fill success-text`}></i>
                            <span className="mb-2 success-text">
                                {changePasswordMsg}
                            </span>
                        </div>
                    )}
                </MainCard>
            </PageTransition>
        </div>
    );
}

export default AccountPage;