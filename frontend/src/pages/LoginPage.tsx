import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../scss/Login.scss";
import * as URL from '../url.ts';
import { PageTransition } from "../components/PageTransition.tsx";
import WheresMyWaterTitle from "../components/WheresMyWaterTitle.tsx";
import { FormInput } from "../components/FormInput.tsx";
import { SubmitButton } from "../components/SubmitButton.tsx";
import { MainCard } from "../components/MainCard.tsx";
import Ducky_3D from "../assets/Ducky_resize.webp"
import squeek from "../assets/squeek.mp3"

function Login()
{
    const [message,setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [loginName,setLoginName] = useState('');
    const [validLogin, setValidLogin] = useState(true);
    const [loginPassword,setPassword] = useState('');
    const [validPassword, setValidPassword] = useState(true);
    const navigate = useNavigate();
    const playSound = () => {
        const audio = new Audio(squeek);
        audio.play();
    };

    const StatusText: React.FC<{success: boolean, msg: string}> = ({success, msg}) => {
      return (
          <div className="d-flex gap-2 justify-content-center mb-2">
              <i className={`bi ${ success
                  ? `bi-patch-check-fill success-text` 
                  : `bi-exclamation-diamond-fill failure-text`}`}
              ></i>
              <span className={`fw-medium ${success ? "success-text" : "failure-text"}`}>
                  {msg}
              </span>
          </div>
      );
  };


    async function doLogin() : Promise<void>
    {

        var obj = {ident:loginName,password:loginPassword};
        var js = JSON.stringify(obj);

        if(!loginName.trim()){
            setMessage('Please give your username or email.');
            setValidLogin(false);
            setValidPassword(loginPassword.trim() ? true : false);
            return;
        }
        if(!loginPassword.trim()){
            setMessage('Please give your password.');
            setValidLogin(true);
            setValidPassword(false);
            return;
        }

        setLoading(true);
        try
        {    
            const response = await fetch(URL.buildPath('api/users/login'), {
                method:'POST',
                credentials: "include",
                body: js,
                headers: {'Content-Type': 'application/json'}
            });
  
            var res = await response.json();
  
            if( !res.success )
            {
                setMessage(res.error);
                setValidLogin(false);
                setValidPassword(false);
            }
            else
            {
                setValidLogin(true);
                setValidPassword(true);
                var user = {
                    id: res._id,
                    username: res.user,
                    email: res.email,
                    firstName: res.firstName,
                    lastName: res.lastName,
                    isVerified: res.isVerified,
                    accessToken: res.accessToken
                };
                localStorage.setItem('user_data', JSON.stringify(user));
  
                setMessage('');
                navigate('/home');
            }
        }
        catch(error:any)
        {
            alert(error.toString());
            return;
        }    
        setLoading(false);
    };

  return (
    <PageTransition>
        <MainCard className="vh-100"> 
            <WheresMyWaterTitle className="mb-4" />

            <FormInput
                label='Username or Email Address'
                placeholder='Bob'
                inputValue={loginName}
                onChange={(e) => setLoginName(e.target.value)}
                onSubmit={doLogin}
                isSuccess={validLogin}
                formClassName="mb-4"
            />

            <FormInput
                type ="password"
                label='Password'
                placeholder='Bob'
                inputValue={loginPassword}
                onChange={(e) => setPassword(e.target.value)}
                onSubmit={doLogin}
                isSuccess={validPassword}
                formClassName="mb-4"
            />

            {message && (
                <StatusText
                success={validLogin && validPassword}
                msg={message}
                />
            )}


            <SubmitButton 
                    onClick={doLogin}
                    isDisabled={loading}
                    defaultMsg="Login"
                    disabledMsg="Logging in..."
                    className="mb-4 text-light"
            />

            <div className="login-bottom-container">
                {/* Text block stacked vertically */}
                <div className="text-links">
                    <div className="link-light text-center mb-1">
                    New to Where's My Water?{" "}
                    <Link 
                        to="/register" 
                        className="link-light link-underline-opacity-100 link"
                    >
                        Register here →
                    </Link>
                    </div>

                    <div className="link-light text-center">
                    Forgot Password?{" "}
                    <Link 
                        to="/reset-password" 
                        className="link-light link-underline-opacity-100 link"
                    >
                        Reset it here →
                    </Link>
                    </div>
                </div>

                {/* Duck next to the text */}
                <button onClick={playSound} className="ducky-button">
                    <img src={Ducky_3D} alt="Ducky" className="ducky-img" />
                </button>
            </div>
        </MainCard>
    </PageTransition>
  );
}

export default Login;
