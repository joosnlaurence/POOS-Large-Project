import { useEffect, useRef, useState } from 'react';
import { Marker, Popup } from 'react-leaflet';
import type { Fountain } from '../types/Fountain';
import '../scss/HomeUI.scss';
// import { SubmitButton } from './SubmitButton';
import { sendVote } from '../utils/voting.ts';
import fountainImg from '../assets/Fountain.webp';
import L from 'leaflet';
import SubmitButtonAddToast from './SubmitButtonAddToast';

const fountainLocationIcon = L.icon({
    iconUrl: fountainImg,
    iconSize: [30, 30],       
    iconAnchor: [15, 30],
    popupAnchor: [0, -25],
});

function FountainMarker({ fountain, selected, onFilterUpdate, setOverlayImage, onDeselect}: 
    { 
        fountain: Fountain; 
        selected: boolean; 
        onFilterUpdate: (fountainId: string, newFilterColor: string) => void;
        setOverlayImage: (url: string) => void;
        onDeselect: () => void;
    })
{
    const markerRef = useRef<any>(null);

    const [msg, setMsg] = useState("");
    const [vote,setVote] = useState("");
    const [voteSuccess, setVoteSuccess] = useState(false);
    // const [loading, setLoading] = useState(false);

    async function handleVote() {
        // these are here just so TS doesn't complain about unused vars. 
        // i'll delete this once i use them for what I need them for.  
        msg;
        voteSuccess;
        
        setMsg("");

        if(!vote || vote === 'none'){
            console.log("Please choose a vote");
            return { success: false, msg: "Please choose a vote"};
        }

        // setLoading(true);
        console.log(`sending ${vote} to ${fountain.id}`)
        
        const res = await sendVote(fountain.id, vote);
        
        setMsg(res.msg);
        setVoteSuccess(res.success);

        if(res.filterChanged) {
            // also want in the toast to put some sort of message that says "You updated the fountain filter!"
            onFilterUpdate(fountain.id, res.newFilterColor);
        }
        
        console.log(res.msg, res.success, res.updatedVote, res.filterChanged, res.newFilterColor)
        // setLoading(false);

        return {success: res.success, msg: res.msg}
    }

    useEffect(() => {
        if (selected && markerRef.current) {
            markerRef.current.openPopup();
        }
    }, [selected]);

    const mapContainer = document.querySelector('.leaflet-container');

    return (
        <Marker position={fountain.fountainLocation} ref={markerRef} icon={fountainLocationIcon}
        eventHandlers={{
        popupclose: () => {
            if (selected) onDeselect();  // only unselect if it was selected
        }
        }}>
            <Popup maxWidth={380} className="fountain-popup">
                <div className="fountain-popup-div">
                    <div className="popup-left">
                        <p><strong>Floor:</strong> {(fountain.floor == 1 ? "1st" : fountain.floor == 2 ? "2nd" : fountain.floor == 3 ? "3rd" : fountain.floor + "th")}</p>
                        <p><strong>Description:</strong><br/>{fountain.fountainDescription}</p>
                        <p><strong>Filter Status:</strong><br/><span className={`status-circle ${fountain.filterStatus}`}></span> {fountain.filterStatus}</p>
                    </div>

                    <div className="popup-right">
                        <img 
                            src={fountain.imageUrl} 
                            alt="Fountain" 
                            className="fountain-image" 
                            style={{ cursor: 'pointer' }}
                            onClick={() => setOverlayImage(fountain.imageUrl)}
                        />
                    </div>

                    {fountain.filterStatus !== "none" && (
                        <div className="popup-bottom">
                            <select className="filter-select" value={vote} onChange={(e) => setVote(e.target.value)}>
                                <option value="none">Select Status Color</option>
                                <option value="green">Green</option>
                                <option value="yellow">Yellow</option>
                                <option value="red">Red</option>
                            </select>

                            <SubmitButtonAddToast 
                                header="Voting"
                                buttonMsg="Submit"
                                onClick={handleVote}
                                position='top-end'
                                containerElement={mapContainer}
                            />
                        </div>
                    )}
                </div>
            </Popup>
        </Marker>
    );
}

export default FountainMarker;