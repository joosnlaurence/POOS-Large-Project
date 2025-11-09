import { useState, useEffect } from 'react';
import * as URL from '../url.ts';

function LoggedInName()
{
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user_data');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserName(`${user.firstName} ${user.lastName}`);
    }
  }, []);

  // New logout function that clears jwt cookie
  async function doLogout(event: any) {
    event.preventDefault();

    await fetch(URL.buildPath('api/users/logout'), {
      method: "POST",
      credentials: "include",     // send cookie so backend clears it
    });

    window.location.href = "/";
  }

  // function doLogout(event:any) : void
  // {
  //   event.preventDefault();
    
  //   localStorage.removeItem("user_data")
  //   window.location.href = '/';
  // };    

  return (
    <div id="loggedInDiv">
      <span id="userName">Logged In As {userName}</span><br />
        <button
          type="button"
          id="logoutButton"
          className="buttons"
          onClick={doLogout}
        >
          Log Out
        </button>
    </div>
    );
};


export default LoggedInName;