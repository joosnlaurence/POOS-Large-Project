import { Link } from 'react-router-dom';
import waterText from '../assets/water.webp';

interface WheresMyWaterTitleProps {
    isInNavbar?: boolean;
    className?: string;
}

export const WheresMyWaterTitle: React.FC<WheresMyWaterTitleProps> = ({
    isInNavbar = false,
    className = ""
}) => {
    const Water = isInNavbar ? 
        <span>
            <Link to="https://github.com/joosnlaurence/POOS-Large-Project">
                <img src={waterText} id="water" alt="Water text logo"/>
            </Link>
        </span>
        :
        <div>
            <Link to="https://github.com/joosnlaurence/POOS-Large-Project">
                <img src={waterText} id="water" alt="Water text logo" fetchPriority="high"/>
            </Link>
        </div>
  
    return (
        <div className={`text-center wheres-my-water inter ${className}`}>
            <div>
                <span id="wheres">Where's </span>
                <span id="my">My </span>
                {isInNavbar ? Water : ""}
            </div>
            {!isInNavbar ? Water : ""}
        </div>
    );
};

export default WheresMyWaterTitle;