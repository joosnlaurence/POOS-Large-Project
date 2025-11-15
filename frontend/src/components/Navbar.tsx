import '../scss/Navbar.scss';
import Logo from "../assets/Logo.png"
import { useNavigate } from 'react-router-dom';
import * as URL from '../url.ts';

function Navbar() {

    const navigate = useNavigate();

    async function doLogout(event: any) {
            event.preventDefault();

            localStorage.removeItem("user_data");
            await fetch(URL.buildPath('api/users/logout'), {
                method: "POST",
                credentials: "include",     // send cookie so backend clears it
            });
    
            navigate("/");
    } 

  return (
    <nav className="water-navbar">
      <div className="navbar-container">
        <div className="navbar-content">
          {/* Logo/Title Section */}
          <div className="title-section">
            <h1 className="title">
              <span className="title-wheres">Where's My</span>
              <span className="title-water">Water?</span>
            </h1>
          </div>

          {/* Alligator Character */}
          <div className="right-section">
            <img 
              src={Logo}
              alt="Alligator character"
              className="alligator-image"
            />

            {/* Log out button */}
            <button className="logout-button" onClick={doLogout}>
              Log out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;