import { useEffect, useRef, useState } from 'react';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import type { Building } from '../types/Building';
import type { Fountain } from '../types/Fountain';

import L from 'leaflet';

import '../scss/HomeUI.scss';

import FountainMarker from '../components/FountainMarker';
import AutoLocationMarker from '../components/AutoLocationMarker';
import LoadBuildings from '../components/LoadBuildings';
import LoadFountains from '../components/LoadFountains';
import buildingImg from '../assets/Building.webp';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

const buildingIcon = L.icon({
    iconUrl: buildingImg,
    iconSize: [30, 30],       
    iconAnchor: [15, 30],
    popupAnchor: [0, -25],
});

function HomePage() {
    const mapRef = useRef(null);
    const centerLocation: [number, number] = [28.602348, -81.200227];

    const buildings = LoadBuildings();
    const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
    const [fountains, setFountains] = useState<Fountain[]>([]);
    const [showBuildings, setShowBuildings] = useState(true);
    const [selectedFountain, setSelectedFountain] = useState<Fountain | null>(null);
    const bounds: L.LatLngBoundsExpression = [
        [28.585046774053048, -81.20933419132147], // southwest corner
        [28.611871821522072, -81.18538756991485], // northeast corner
    ];
    const [overlayImage, setOverlayImage] = useState<string | null>(null);
    const navigate = useNavigate();

    
    useEffect(() => {
        checkLogin();
    }, []);

    function checkLogin()
    {
        const stored = localStorage.getItem("user_data");
        if (!stored)
        {
            navigate("/");
            return;
        }
    }

    // Used to update a single fountain's filter
    const updateFountainFilter = (fountainId: string, newFilterColor: string) => {
        setFountains(prevFountains =>
            // Iterates through every fountain to find the correct one to update
            prevFountains.map(f =>
                f.id === fountainId
                    ? { ...f, filterStatus: newFilterColor }
                    : f
            )
        )
    };

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
            setShowBuildings(false);
            const loadedFountains = await LoadFountains(b.fountainIds);
            setFountains(loadedFountains);
            if (map && "flyTo" in map)
            {
                (map as any).flyTo(b.buildingLocation, 19);
            }
        }
    }

    function handleSelectFountain(fountain: Fountain)
    {
        setSelectedFountain(fountain);
        const map = mapRef.current;
        if (map && "flyTo" in map)
        {
            const offsetLat = 0.0004; // move marker slightly up
            const offsetLng = 0.00025; // move marker slightly right (adjust as needed)
            const [lat, lng] = fountain.fountainLocation;
            (map as any).flyTo([lat + offsetLat, lng + offsetLng], 19);
        }
    }

    return (
        <div>
            <Navbar/>

            <div className="location-container">
                <div className="location-title">Select Your Location or Click a Building</div>

                <select className="location-select" value={selectedBuilding?.id || ""}
                    onChange={(e) => {
                    const found = buildings.find(b => b.id === e.target.value);
                    handleSetSelectedBuilding(found || null);
                    }}
                >
                    <option value="">Choose a building...</option>
                    {buildings.map(b => (
                    <option key={b.id} value={b.id}>
                        {b.name}
                    </option>
                    ))}
                </select>
            </div>

            <div className="home-container mx-auto p-lg-4">
                
                <MapContainer center={centerLocation} ref={mapRef} zoom={17} style={{ flex: 1 }} className="custom-map" maxBounds={bounds} maxBoundsViscosity={1.0}>
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
                            icon={buildingIcon}
                        />
                    ))}

                    
                    {fountains.map((fountain) => (
                        selectedFountain?.id === fountain.id ? (
                            <FountainMarker
                                key={fountain.id}
                                fountain={fountain}
                                selected={true}
                                onFilterUpdate={updateFountainFilter}
                                setOverlayImage={setOverlayImage}
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
                                        <span className={`status-circle ${fountain.filterStatus}`}></span>
                                        {fountain.name}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                )}
                {overlayImage && (
                    <div className="image-overlay">
                        <button className="overlay-close" onClick={() => setOverlayImage(null)}>✕</button>
                        <img src={overlayImage} alt="Full Size Fountain" className="overlay-image"/>
                    </div>
                )}
            </div>
        </div>
    );
}


export default HomePage;

