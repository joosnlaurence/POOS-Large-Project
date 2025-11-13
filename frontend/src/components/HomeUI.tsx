import { useEffect, useRef, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap} from 'react-leaflet';
import LoadBuildings from './LoadBuildings';
import LoadFountains from './LoadFountains';
import type { Building } from '../types/Building';
import type { Fountain } from '../types/Fountain';
import './HomeUI.css';


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

function FountainMarker({ fountain, selected }: { fountain: Fountain; selected: boolean })
{
    const markerRef = useRef<any>(null);

    useEffect(() => {
        if (selected && markerRef.current) {
            markerRef.current.openPopup();
        }
    }, [selected]);

    return (
        <Marker position={fountain.fountainLocation} ref={markerRef}>
            <Popup>
                <div>
                    {fountain.name}
                    <img src={fountain.imageUrl} alt="Fountain" className="fountain-image"/>
                </div>


            </Popup>
        </Marker>
    );
}



function HomeUI() {
    const mapRef = useRef(null);
    const centerLocation: [number, number] = [28.602348, -81.200227];

    const buildings = LoadBuildings();
    const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
    const [fountains, setFountains] = useState<Fountain[]>([]);
    const [showBuildings, setShowBuildings] = useState(true);
    const [selectedFountain, setSelectedFountain] = useState<Fountain | null>(null);
    

    async function handleSetSelectedBuilding(b: Building | null)
    {
        setSelectedBuilding(b);
        setSelectedFountain(null);

        if (b === null)
        {
            setFountains([]);
            setShowBuildings(true);
        }
        else
        {
            
            const map = mapRef.current;
            if (map && "flyTo" in map)
            {
                (map as any).flyTo(b.buildingLocation, 19);
            }
            setShowBuildings(false);
            const loadedFountains = await LoadFountains(b.fountainIds);
            setFountains(loadedFountains);
        }
    }

    function handleSelectFountain(fountain: Fountain)
    {
        setSelectedFountain(fountain);
        const map = mapRef.current;
        if (map && "flyTo" in map)
        {
            (map as any).flyTo(fountain.fountainLocation, 19);
        }
    }

    return (
        <div className="home-container">
            <MapContainer center={centerLocation} ref={mapRef} zoom={17} style={{ flex: 1 }}>
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maxZoom={19}
                />

                <AutoLocationMarker />

                {showBuildings && buildings.map((b) => (
                    <Marker
                        key={b.id}
                        position={b.buildingLocation}
                        eventHandlers={{
                            click: () => handleSetSelectedBuilding(b),
                        }}
                    />
                ))}

                
                {fountains.map((fountain) => (
                    selectedFountain?.id === fountain.id ? (
                        <FountainMarker
                            key={fountain.id}
                            fountain={fountain}
                            selected={true}
                        />
                    ) : null
                ))}


            </MapContainer>

            {selectedBuilding && (
                <div className="info-panel">
                    <button onClick={() => handleSetSelectedBuilding(null)} className="close-button">✕</button>

                    <h2>{selectedBuilding.name}</h2>

                    <h3>Fountains</h3>

                    <div className="fountain-list">
                        {fountains.length === 0 ? (
                            <p className="no-fountains">No fountains found.</p>
                        ) : (
                            fountains.map((fountain) => (
                                <button
                                    key={fountain.id}
                                    className="fountain-button"
                                    onClick={() => handleSelectFountain(fountain)}
                                >
                                    {fountain.name}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}


export default HomeUI;
