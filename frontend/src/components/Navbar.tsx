import '../scss/Navbar.scss';
import Logo from "../assets/Logo.webp"
import { Link, useNavigate } from 'react-router-dom';
import { Navbar as BSNavbar, Nav, OverlayTrigger, Tooltip } from 'react-bootstrap';
import * as URL from '../url.ts';
import WheresMyWaterTitle from './WheresMyWaterTitle.tsx';
import { SubmitButton } from './SubmitButton.tsx';

function Navbar() {
  const navigate = useNavigate();

  async function doLogout() {
    localStorage.removeItem("user_data");
    
    await fetch(URL.buildPath('api/users/logout'), {
      method: "POST",
      credentials: "include",
    });
    
    navigate("/");
  } 

  return (
    <BSNavbar className="water-navbar p-0">
        <BSNavbar.Brand as={Link} to="/home" className="ms-5">
          <WheresMyWaterTitle className="white-glow" isInNavbar={true} />
        </BSNavbar.Brand>

        <Nav className="ms-auto d-flex align-items-center gap-3 me-5">
          <OverlayTrigger
            placement="bottom"
            delay={{ show: 100, hide: 100 }}
            overlay={<Tooltip id="alligator-tooltip">Go to Account</Tooltip>}
          >
            <Nav.Link as={Link} to="/account" className='d-flex flex-column justify-content-center align-items-center'>
                <img 
                src={Logo}
                alt="Alligator character"
                className="alligator-image"
                />
                <label className="flex-grow-0 text-center text-light text-decoration-underline fs-6">
                    My Account
                </label>
            </Nav.Link>
          </OverlayTrigger>
          
          <SubmitButton 
            width="auto"
            defaultMsg='Logout'
            className="logout-button" 
            onClick={doLogout}
          />
        </Nav>
    </BSNavbar>
  );
}

export default Navbar;