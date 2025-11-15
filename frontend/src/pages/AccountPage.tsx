import { useEffect, useState } from "react";
import { MainCard } from "../components/MainCard";
import Navbar from "../components/Navbar";
import { PageTransition } from "../components/PageTransition";
import WheresMyWaterTitle from "../components/WheresMyWaterTitle";
import { SubmitButton } from "../components/SubmitButton";
import { sendResetLink } from "../utils/passwordResetUtils";
import { useNavigate } from "react-router-dom";

function AccountPage()
{
    const [username, setUsername] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("Sending...");
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
        setMsg("");

        setLoading(true);
        const res = await sendResetLink(email);
        setMsg(res.msg);
        setLoading(false);
        setLinkSent(true);
    }

    return (
        <div>
            <Navbar/>
            <PageTransition>
                <MainCard>
                    <WheresMyWaterTitle />    

                    <h1 className="mb-2 text-light">
                        Your Account Info
                    </h1>

                    <div className="text-start">
                        <h3 className="mb-2 text-light">Username: {username}</h3>
                        <h3 className="mb-2 text-light">First Name: {firstName}</h3>
                        <h3 className="mb-2 text-light">Last Name: {lastName}</h3>
                        <h3 className="mb-2 text-light">Email: {email}</h3>
                    </div>
                    <SubmitButton
                        onClick={handleSend}
                        isDisabled={loading}
                        defaultMsg="Change Password"
                        disabledMsg={msg}
                        className="mb-4"
                    />
                    {linkSent && (
                        <div>
                            <i className={`bi p-2 bi-check-circle-fill success-text`}></i>
                            <span className="mb-2 text-light">
                                {msg}
                            </span>
                        </div>
                    )}
                </MainCard>
            </PageTransition>
        </div>
    );
}

export default AccountPage;