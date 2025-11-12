import { useEffect, useRef, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap} from 'react-leaflet';
import LoadBuildings from './LoadBuildings';
import type { Building } from '../types/Building';

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

function HomeUI() {
    const mapRef = useRef(null);
    const centerLocation: [number, number] = [28.602348, -81.200227];

    const buildings = LoadBuildings();
    const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);

    return (
        <div style={{ display: 'flex', width: '100%', height: '75vh' }}>
            {/* Map */}
            <MapContainer center={centerLocation} ref={mapRef} zoom={17} style={{ flex: 1 }}>
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maxZoom={19}
                />

                <AutoLocationMarker />

                {buildings.map((b) => (
                    <Marker
                        key={b.id}
                        position={b.buildingLocation}
                        eventHandlers={{
                            click: () => setSelectedBuilding(b),
                        }}
                    />
                ))}
            </MapContainer>

            {/* Info Panel (conditionally rendered) */}
            {selectedBuilding && (
                <div style={{
                    width: '300px',
                    backgroundColor: '#f9f9f9',
                    color: 'black', // Make text black
                    padding: '10px',
                    borderLeft: '1px solid #ccc',
                    overflowY: 'auto',
                    position: 'relative'
                }}>
                    {/* Close Button */}
                    <button
                        onClick={() => setSelectedBuilding(null)}
                        style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            background: 'transparent',
                            border: 'none',
                            fontSize: '16px',
                            cursor: 'pointer',
                            color: 'black' // Make button text black too
                        }}
                    >
                        ✕
                    </button>

                    <h2>{selectedBuilding.name}</h2>
                    <p>Fountains: {selectedBuilding.fountainIds.length}</p>
                    <p>Latitude: {selectedBuilding.buildingLocation[0]}</p>
                    <p>Longitude: {selectedBuilding.buildingLocation[1]}</p>
                </div>
            )}
        </div>
    );
}


export default HomeUI;
