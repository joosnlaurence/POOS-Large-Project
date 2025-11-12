import { useEffect, useRef, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap} from 'react-leaflet';

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
        <Marker position={position}>
            <Popup>You are here</Popup>
        </Marker>
    );
}

function HomeUI()
{
    const mapRef = useRef(null);
    const centerLocation: [number, number] = [28.602348, -81.200227];
    const centerLocation2: [number, number] = [28.600484146464797, -81.20139027355133];
    const centerLocation3: [number, number] = [28.6020736, -81.1986191];

    return(
        //IMPORTANT ALSO TO SET A SIZE OF THE MAP OR ELSE IT ALSO WON'T RENDER
        <MapContainer center={centerLocation} ref={mapRef} zoom={17} style={{height: "75vh", width: "63.5vw"}}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker position={centerLocation2}>
                <Popup>
                    <div>
                        A pretty CSS3 popup. <br /> Library.
                        <button>TEST</button>

                    </div>
                </Popup>
            </Marker>

            <Marker position={centerLocation3}>
                <Popup>
                    <div>
                        A pretty CSS3 popup. <br /> Easily customizable.
                        <button>TEST</button>

                    </div>
                </Popup>
            </Marker>
            <AutoLocationMarker />
        </MapContainer>
    );
}


export default HomeUI;
