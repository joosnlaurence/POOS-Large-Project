import '../scss/Navbar.scss';
import { useNavigate } from "react-router-dom";
import * as URL from '../url.ts';
import Logo from "../assets/Logo.png"

function Navbar()
{
    const navigate = useNavigate();

    async function doLogout(event: any) {
        event.preventDefault();

        await fetch(URL.buildPath('api/users/logout'), {
            method: "POST",
            credentials: "include",     // send cookie so backend clears it
        });

        navigate("/");
    }

    return (
        <div className="top-navbar">
            <div className="navbar-content">
                <h1 className="navbar-title">
                    <span className="title-wheres">Where's</span>
                    <span className="title-my">My</span>
                    <span className="title-water">Water?</span>
                </h1>
                
                <div className="navbar-right">
                    <div className="gator-logo">
                        <img src={Logo} alt="IMAGEMISSING" />
                    </div>
                    <button className="logout-button" onClick={doLogout}>
                        Log out
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Navbar;