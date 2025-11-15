import { Link } from 'react-router-dom';
import waterText from '../assets/water.webp';

function WheresMyWaterTitle() {
  return (
    <div className="text-center mb-4 wheres-my-water inter">
      <div>
        <span id="wheres">Where's </span>
        <span id="my">My</span>
      </div>
      <div>
        <Link to="https://github.com/joosnlaurence/POOS-Large-Project">
            <img src={waterText} id="water" alt="Water text logo" />
        </Link>
        
      </div>
    </div>
  );
};

export default WheresMyWaterTitle;