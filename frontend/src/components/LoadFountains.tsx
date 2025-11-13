import type { Fountain } from "../types/Fountain.tsx";
import * as URL from '../url.ts';

async function LoadFountains(fountainIds: string[]): Promise<Fountain[]> {
    const fountains: Fountain[] = [];

    for (let i = 0; i < fountainIds.length; i++) {
        const obj = { _id: fountainIds[i] };
        const js = JSON.stringify(obj);

        try {
            const response = await fetch(URL.buildPath('api/fountains/get'), {
                method: 'POST',
                credentials: "include",
                body: js,
                headers: { 'Content-Type': 'application/json' },
            });

            const res = JSON.parse(await response.text());

            if (!res.success) {
                console.error(res.err);
            } else {
                const f = res.fountain;
                const cleanedFountain: Fountain = {
                    id: f._id,
                    fountainLocation: [
                        f.location.coordinates.latitude,
                        f.location.coordinates.longitude,
                    ],
                    fountainDescription: f.location.description,
                    filterStatus: f.filter,
                    name: f.location.building + " " + (f.floor == 1 ? "1st" : f.floor == 2 ? "2nd" : f.floor == 3 ? "3rd" : f.floor + "th") + " Floor " + " Fountain " + (i + 1),
                    floor: f.floor,
                    imageUrl: f.imgUrl
                };
                fountains.push(cleanedFountain);
            }
        } catch (error: any) {
            console.error(error);
        }
    }

    return fountains;
}

export default LoadFountains;
