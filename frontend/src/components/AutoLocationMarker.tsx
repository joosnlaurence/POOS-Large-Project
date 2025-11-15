import { useState, useEffect } from 'react';
import { Marker, Popup, useMap} from 'react-leaflet';
import '../scss/HomeUI.scss';
import locationImg from '../assets/Location.webp';
import L from 'leaflet';

const userLocationIcon = L.icon({
    iconUrl: locationImg,
    iconSize: [30, 30],       
    iconAnchor: [15, 30],
    popupAnchor: [0, -25],
});

function AutoLocationMarker()
{
    const [position, setPosition] = useState<[number, number] | null>(null);
    const map = useMap();

    useEffect(() => {
        // Try to get the location immediately, then update every 5 seconds
        const updateLocation = () => {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const newPos: [number, number] = [pos.coords.latitude, pos.coords.longitude];
                    setPosition(newPos);
                    //map.flyTo(newPos, map.getZoom());
                },
                (err) => {
                    console.error("Error getting location:", err);
                },
                { enableHighAccuracy: true }
            );
        };

        updateLocation(); // initial call
        const interval = setInterval(updateLocation, 5000); // every 5 seconds

        return () => clearInterval(interval);
    }, [map]);

    return position === null ? null : (
        <Marker position={position} icon={userLocationIcon}>
            <Popup>You are here</Popup>
        </Marker>
    );
}

export default AutoLocationMarker;