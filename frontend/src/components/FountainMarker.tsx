import { useEffect, useRef, useState } from 'react';
import { Marker, Popup } from 'react-leaflet';
import type { Fountain } from '../types/Fountain';
import '../scss/HomeUI.scss';
import { SubmitButton } from './SubmitButton';
import { sendVote } from '../utils/voting.ts';

function FountainMarker({ fountain, selected, onFilterUpdate, setOverlayImage}: 
    { 
        fountain: Fountain; 
        selected: boolean; 
        onFilterUpdate: (fountainId: string, newFilterColor: string) => void;
        setOverlayImage: (url: string) => void
    })
{
    const markerRef = useRef<any>(null);

    const [msg, setMsg] = useState("");
    const [vote,setVote] = useState("");
    const [voteSuccess, setVoteSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleVote() {
        // these are here just so TS doesn't complain about unused vars. 
        // i'll delete this once i use them for what I need them for.  
        msg;
        voteSuccess;
        
        setMsg("");

        if(!vote || vote === 'none'){
            // popup that say something like "Please choose a vote"
            console.log("Please choose a vote");
            return;
        }

        setLoading(true);
        console.log(`sending ${vote} to ${fountain.id}`)
        
        const res = await sendVote(fountain.id, vote);
        
        setMsg(res.msg);
        setVoteSuccess(res.success);

        if(res.filterChanged) {
            // also want in the toast to put some sort of message that says "You updated the fountain filter!"
            onFilterUpdate(fountain.id, res.newFilterColor);
        }
        
        console.log(res.msg, res.success, res.updatedVote, res.filterChanged, res.newFilterColor)
        setLoading(false);
    }

    useEffect(() => {
        if (selected && markerRef.current) {
            markerRef.current.openPopup();
        }
    }, [selected]);

    return (
        <Marker position={fountain.fountainLocation} ref={markerRef}>
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

                    <div className="popup-bottom">
                        <select 
                            className="filter-select"
                            value={vote}
                            onChange={(e) => setVote(e.target.value)}
                        >
                            <option value="none">Select Status Color</option>
                            <option value="green">Green</option>
                            <option value="yellow">Yellow</option>
                            <option value="red">Red</option>
                        </select>

                        <SubmitButton 
                            onClick={handleVote}
                            defaultMsg='Submit'
                            isDisabled={loading}
                            disabledMsg=""
                            id='toastBtn' // We'll use this when we display the toast
                        />
                        
                    </div>
                </div>
            </Popup>
        </Marker>
    );
}

export default FountainMarker;