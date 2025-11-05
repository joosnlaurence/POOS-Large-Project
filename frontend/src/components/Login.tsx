import React, { useState } from "react";
import "./Login.css";
import * as URL from '../url.ts';

function Login()
{
    const [message,setMessage] = useState('');
    const [loginName,setLoginName] = React.useState('');
    const [loginPassword,setPassword] = React.useState('');


    async function doLogin(event:any) : Promise<void>
    {
        event.preventDefault();

        var obj = {ident:loginName,password:loginPassword};
        var js = JSON.stringify(obj);
  
        try
        {    
            const response = await fetch(URL.buildPath('api/users/login'),
                {method:'POST',credentials: "include",body:js,headers:{'Content-Type': 'application/json'}});
  
            var res = JSON.parse(await response.text());
  
            if( !res.success )
            {
                setMessage('User/Password combination incorrect');
            }
            else
            {
                var user = {firstName:res.firstName,lastName:res.lastName,id:res._id}
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
      };

    function handleSetLoginName( e: any ) : void
    {
      setLoginName( e.target.value );
    }

    function handleSetPassword( e: any ) : void
    {
      setPassword( e.target.value );
    }

  return (
    <div className="loginBody">
      <div className="loginContainer">
        <div className="headerContainer loginContainerHeader trade-winds">
          <span id="upperLoginHead">Plunder the</span>
          <span id="lowerLoginHead">Cap'n's Log</span>
        </div>

        <form onSubmit={doLogin}>
          <div className="loginGroup">
            <label htmlFor="loginName" className="pirata-one">Yer Username</label>
            <input
              type="text"
              id="loginName"
              className="inputField typewriter-text"
              placeholder="Username"
              onChange={handleSetLoginName}
              onKeyDown={(e) => e.key === "Enter" && doLogin}
            />
          </div>

          <div className="loginGroup">
            <label htmlFor="loginPassword" className="pirata-one">Yer Secret Key</label>
            <input
              type="password"
              id="loginPassword"
              className="inputField typewriter-text"
              placeholder="Password"
              onChange={handleSetPassword}
              onKeyDown={(e) => e.key === "Enter" && doLogin}
            />
          </div>

          {message && (
              <div className="errorContainer invalidLoginError pirata-one">
              {message}
              </div>
          )}

          <button
            type="submit"
            id="loginButton"
            className="buttons pirata-one"
          >
            Login
          </button>

          <div className="createAccountLink pirata-one">
            <span>New to our crew?</span>
            <span
              id="createAccountPrompt"
              onClick={() => (window.location.href = "/register")}
            >
              Registarr here →
            </span>
          </div>
        </form>
      </div>
    </div>
  );



}

export default Login;