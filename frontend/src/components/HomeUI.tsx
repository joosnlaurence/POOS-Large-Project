import { useRef, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from 'react-leaflet';

//HIGHLY IMPORTANT THAT THIS IS IMPORTED OR ELSE THE MAP WILL NOT RENDER
import "leaflet/dist/leaflet.css";

function HomeUI()
{
    const mapRef = useRef(null);
    const centerLocation: [number, number] = [28.602348, -81.200227];
    const centerLocation2: [number, number] = [28.600484146464797, -81.20139027355133];
    
    function LocationMarker() {
        const [position, setPosition] = useState(null)
        const map = useMapEvents({
            click() {
                map.locate()
            },
            locationfound(e) {
                
                handleSetPosition(e)
                //map.flyTo(e.latlng, map.getZoom())
            },
        })

        function handleSetPosition( e: any ) : void
        {
            setPosition( e.latlng );
        }

        return position === null ? null : (
            <Marker position={position}>
                <Popup>You are here</Popup>
            </Marker>
        )
    }

    return(
        //IMPORTANT ALSO TO SET A SIZE OF THE MAP OR ELSE IT ALSO WON'T RENDER
        <MapContainer center={centerLocation} zoom={17} ref={mapRef} style={{height: "75vh", width: "63.5vw"}}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker position={centerLocation2}>
                <Popup>
                A pretty CSS3 popup. <br /> Easily customizable.
                </Popup>
            </Marker>
            <LocationMarker />
        </MapContainer>
    );
}


export default HomeUI;
