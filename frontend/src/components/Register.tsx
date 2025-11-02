import React, { useState } from "react";
import "./Register.css";
import * as URL from '../url.ts';

function Register()
{
    const [message,setMessage] = useState('');
    const [loginName,setLoginName] = React.useState('');
    const [loginPassword,setPassword] = React.useState('');
    const [loginEmail,setEmail] = React.useState('');
    const [loginFirstName,setFirstName] = React.useState('');
    const [loginLastName,setLastName] = React.useState('');

    async function doLogin(event:any) : Promise<void>
    {
        event.preventDefault();
        
        var obj = {firstName:loginFirstName,lastName:loginLastName,user:loginName,email:loginEmail,password:loginPassword};
        var js = JSON.stringify(obj);

        try
        {    
            const response = await fetch(URL.buildPath('api/users/register'),
                {method:'POST',body:js,headers:{'Content-Type': 'application/json'}});
  
            var res = JSON.parse(await response.text());
  
            if( !res.success )
            {
                setMessage(res.error);
            }
            else
            {
                var user = {firstName:loginFirstName,lastName:loginLastName,id:res._id}
                localStorage.setItem('user_data', JSON.stringify(user));
  
                setMessage('');
                window.location.href = '/home';
            }
        }
        catch(error:any)
        {
            alert(error.toString());
            return;
        }
    }

    return (
  <div className="registerBody">
    {/* Header */}
    <div className="headerContainer registerHeaderContainer trade-winds">
      <span id="upperRegisterHead">Are ya' ready ta plunder the</span>
      <span id="lowerRegisterHead">Cap'n's Log?</span>
    </div>

    {/* Input container */}
    <div className="registerInputContainer">
      {/* Title */}
      <div className="registerInputTitle pirata-one">
        <h2>Ahoy, matey! Sign up here ta join the crew!</h2>
      </div>

      {/* First Name */}
      <div className="registerInputBlock pirata-one">
        <label className="registerLabel" htmlFor="registerFirstName">
          <sup className="requiredNotice requiredSymbol">*</sup>Yer Mate Name
        </label>
        <input
          type="text"
          id="registerFirstName"
          className="inputField typewriter-text"
          placeholder="First Name"
          value={loginFirstName}
          onChange={handleSetFirstName}
        />
      </div>

      {/* Last Name */}
      <div className="registerInputBlock pirata-one">
        <label className="registerLabel" htmlFor="registerLastName">
          <sup className="requiredNotice requiredSymbol">*</sup>Yer Last Name
        </label>
        <input
          type="text"
          id="registerLastName"
          className="inputField typewriter-text"
          placeholder="Last Name"
          value={loginLastName}
          onChange={handleSetLastName}
        />
      </div>

      {/* Username */}
      <div className="registerInputBlock pirata-one">
        <label className="registerLabel" htmlFor="registerUsername">
          <sup className="requiredNotice requiredSymbol">*</sup>Yer Username
        </label>
        <input
          type="text"
          id="registerUsername"
          className="inputField typewriter-text"
          placeholder="Username"
          value={loginName}
          onChange={handleSetLoginName}
        />
      </div>

      {/* Email */}
      <div className="registerInputBlock pirata-one">
        <label className="registerLabel" htmlFor="registerEmail">
          <sup className="requiredNotice requiredSymbol">*</sup>Yer Email
        </label>
        <input
          type="email"
          id="registerEmail"
          className="inputField typewriter-text"
          placeholder="Email"
          value={loginEmail}
          onChange={handleSetEmail}
        />
      </div>

      {/* Password */}
      <div className="registerInputBlock pirata-one">
        <label className="registerLabel" htmlFor="registerPassword">
          <sup className="requiredNotice requiredSymbol">*</sup>Yer Secret Key
        </label>
        <input
          type="password"
          id="registerPassword"
          className="inputField typewriter-text"
          placeholder="Password"
          value={loginPassword}
          onChange={handleSetPassword}
        />
      </div>

      {/* Error message */}
      {message && (
        <div className="errorContainer pirata-one">{message}</div>
      )}

      {/* Required notice */}
      <div className="registerInputBlock requiredNotice pirata-one">
        <sup>*</sup>= required
      </div>

      {/* Submit button */}
      <div className="registerInputBlock registerAccount">
        <button
          type="button"
          id="registerAccountButton"
          className="buttons pirata-one"
          onClick={doLogin}
        >
          Create Account
        </button>
      </div>

      {/* Login redirect */}
      <div className="registerInputBlock loginReturn pirata-one">
        <span>Already have an account?</span>
        <span
          id="loginReturn"
          onClick={() => (window.location.href = "/login")}
        >
          Sign in →
        </span>
      </div>
    </div>
  </div>
);


    function handleSetLoginName( e: any ) : void
    {
      setLoginName( e.target.value );
    }

    function handleSetPassword( e: any ) : void
    {
      setPassword( e.target.value );
    }

    function handleSetEmail( e: any ) : void
    {
      setEmail( e.target.value );
    }

    function handleSetFirstName( e: any ) : void
    {
      setFirstName( e.target.value );
    }

    function handleSetLastName( e: any ) : void
    {
      setLastName( e.target.value );
    }
}


export default Register;