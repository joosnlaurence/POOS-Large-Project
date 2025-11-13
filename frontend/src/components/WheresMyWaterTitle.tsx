import waterText from '../assets/water.png';
import React from 'react';

export const WheresMyWaterTitle: React.FC = () => {
  return (
    <div className="text-center mb-4 wheres-my-water inter">
      <div>
        <span id="wheres">Where's </span>
        <span id="my">My</span>
      </div>
      <div>
        <img src={waterText} id="water" alt="Water text logo" />
      </div>
    </div>
  );
};