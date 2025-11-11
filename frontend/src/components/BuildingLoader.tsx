import { useEffect, useState } from "react";
import type { Building } from "../types/Building";
import * as URL from '../url.ts';

function BuildingLoader()
{
    const [buildings, setBuildings] = useState<Building[]>([]);

    
    async function fetchBuildings(event:any) : Promise<void>
    {
        event.preventDefault();

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
                
            }
        }
        catch(error:any)
        {
            alert(error.toString());
            return;
        }
    };

    return
    (
        {}
    );
}

export default BuildingLoader;