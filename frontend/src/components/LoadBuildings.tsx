import { useEffect, useState } from "react";
import type { Building } from "../types/Building";
import * as URL from '../url.ts';

function LoadBuildings()
{
    const [buildings, setBuildings] = useState<Building[]>([]);

    useEffect(() => {
        fetchBuildings();
    }, []);
    
    async function fetchBuildings(event?:any) : Promise<void>
    {
        if (event) event.preventDefault(); // Only prevent if event exists

        try
        {    
            const response = await fetch(URL.buildPath('api/buildings/list'),
                {method:'GET',credentials: "include",headers:{'Content-Type': 'application/json'}});
    
            var res = JSON.parse(await response.text());
    
            if( !res.success )
            {
                console.error(res.err);
            }
            else
            {
                const cleanedBuildings: Building[] = res.buildings.map((b: any) => ({
                    id: b._id,
                    name: b.name,
                    buildingLocation: [b.pinCoords.latitude, b.pinCoords.longitude],
                    fountainIds: b.fountainIds
                }));

                setBuildings(cleanedBuildings);
            }
        }
        catch(error:any)
        {
            alert(error.toString());
            return;
        }
    };

    return buildings;
}

export default LoadBuildings;