import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as URL from '../url.ts';

import { PageTransition } from "../components/PageTransition.tsx";
import WheresMyWaterTitle from "../components/WheresMyWaterTitle.tsx";
import { FormInput } from "../components/FormInput.tsx";
import { validateEmail } from "../utils/validation.ts";
import { SubmitButton } from "../components/SubmitButton.tsx";

function Register()
{
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [registerSuccess, setRegisterSuccess] = useState(true);

    const [firstName,setFirstName] = useState('');
    const [validFirstName, setValidFirstName] = useState(true);
    const [firstNameMsg, setFirstNameMsg] = useState('');
    
    const [lastName,setLastName] = useState('');
    const [validLastName, setValidLastName] = useState(true);
    const [lastNameMsg, setLastNameMsg] = useState('');

    const [username, setUsername] = useState('');
    const [validUsername, setValidUsername] = useState(true);
    const [usernameMsg, setUsernameMsg] = useState('');

    const [email,setEmail] = useState('');
    const [validEmail, setValidEmail] = useState(true);
    const [emailMsg, setEmailMsg] = useState('');


    const [password,setPassword] = useState('');
    const [validPassword, setValidPassword] = useState(true);
    const [passwordMsg, setPasswordMsg] = useState('');


    const navigate = useNavigate();

    async function handleLogin() : Promise<void>
    {
        let errors = false;

        if(firstName === ''){
            errors = true;
            setValidFirstName(false);
            setFirstNameMsg("First name cannot be blank!");
        }
        else{
            setValidFirstName(true);
            setFirstNameMsg("");
        }
        if(lastName === ''){
            errors = true;
            setValidLastName(false);
            setLastNameMsg("Last name cannot be blank!");
        }
        else{
            setValidLastName(true);
            setLastNameMsg("");
        }
        if(username === ''){
            errors = true;
            setValidUsername(false);
            setUsernameMsg("First name cannot be blank!");
        }
        else{
            setValidUsername(true);
            setUsernameMsg('');
        }
        
        const emailInput = document.getElementById('emailInput') as HTMLInputElement;
        const emailValidation = validateEmail(email, emailInput);
        if(!emailValidation.valid) {
            errors = true;
            setValidEmail(false);
            setEmailMsg(emailValidation.msg);
        }
        else{
            setValidEmail(true);
            setEmailMsg('');
        }
        // password shouldn't be sent as trimmed
        if(password.trim() === ''){
            errors = true;
            setValidPassword(false);
            setPasswordMsg("Password cannot be blank!");
        }
        else {
            setValidPassword(true);
            setPasswordMsg('');
        }

        if(errors) {
            setMsg(''); 
            return;
        }
        
        var obj = { 
            firstName:firstName,
            lastName:lastName,
            user:username,
            email:email,
            password:password
        };
        var js = JSON.stringify(obj);

        setLoading(true);
        try
        {   
            const response = await fetch(URL.buildPath('api/users/register'),
                {method:'POST',body:js,headers:{'Content-Type': 'application/json'}});
  
            var res = JSON.parse(await response.text());
  
            if( !res.success )
            {
                if(response.status === 409) {
                    setUsernameMsg('');
                    setValidUsername(false);
                    setEmailMsg('')
                    setValidEmail(false);
                }
                setMsg(res.error);
                setRegisterSuccess(false);
            }
            else
            {
                var user = { 
                    firstName:firstName,
                    lastName:lastName,
                    id:res._id
                };
                localStorage.setItem('user_data', JSON.stringify(user));
  
                setMsg("User successfully created! Returning to Login...");
                setRegisterSuccess(true);
                setTimeout(() => navigate('/login'), 2000);
            }
        }
        catch(error:any)
        {
            alert(error.toString());
            return;
        }
        setLoading(false);
    }

    return (
        <PageTransition>
            <div className="container-fluid d-flex flex-column justify-content-center align-items-center min-vh-100">
                <div className="main-container card shadow-lg p-4 mx-auto">
                    <WheresMyWaterTitle />    

                    <FormInput
                        label='First Name'
                        placeholder='Bob'
                        inputValue={firstName}
                        onChange={(e) => setFirstName(e.target.value.trim())}
                        onSubmit={handleLogin}
                        isSuccess={validFirstName}
                        statusMsg={firstNameMsg}
                        formClassName="mb-4"
                    />
                    <FormInput
                        label='Last Name'
                        placeholder='Jenkins'
                        inputValue={lastName}
                        onChange={(e) => setLastName(e.target.value.trim())}
                        onSubmit={handleLogin}
                        isSuccess={validLastName}
                        statusMsg={lastNameMsg}
                        formClassName="mb-4"
                    />
                    <FormInput
                        label='Username'
                        placeholder='yourusername123'
                        inputValue={username}
                        onChange={(e) => setUsername(e.target.value.trim())}
                        onSubmit={handleLogin}
                        isSuccess={validUsername}
                        statusMsg={usernameMsg}
                        formClassName="mb-4"
                    />
                    <FormInput
                        type="email"
                        id="emailInput"
                        label='Email address'
                        placeholder='your@email.com'
                        inputValue={email}
                        onChange={(e) => setEmail(e.target.value.trim())}
                        onSubmit={handleLogin}
                        isSuccess={validEmail}
                        statusMsg={emailMsg}
                        formClassName="mb-4"
                    />
                    <FormInput
                        type="password"
                        label='Password'
                        placeholder='dontstealthis!!!'
                        inputValue={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onSubmit={handleLogin}
                        isSuccess={validPassword}
                        statusMsg={passwordMsg}
                        formClassName="mb-4"
                    />

                    {msg && (
                        <div className="mb-2">
                        
                            <i className={`bi p-2 ${ registerSuccess
                                ? `bi-check-circle-fill success-text` 
                                : `bi-exclamation-diamond-fill failure-text`}`}
                            ></i>
                            <span className={`fw-medium ${registerSuccess ? "success-text" : "failure-text"}`}>
                                {msg}
                            </span>
                        </div>
                    )}

                    <SubmitButton 
                        onClick={handleLogin}
                        isDisabled={loading}
                        defaultMsg="Register"
                        disabledMsg="Validating New User..."
                        className="mb-4"
                    />

                    <Link to="/login" className="link-light link-underline-opacity-100 link">
                        Return to Login →
                    </Link>
                </div>
            </div>
        </PageTransition>
);
}


export default Register;