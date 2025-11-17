import type { Fountain } from "../types/Fountain";
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

                fountains.push({
                    id: f._id,
                    fountainLocation: [
                        f.location.coordinates.latitude,
                        f.location.coordinates.longitude,
                    ],
                    fountainDescription: f.location.description,
                    filterStatus: f.filter,
                    name: "",
                    floor: f.floor,
                    imageUrl: f.imgUrl
                });
            }
        } catch (error: any) {
            console.error(error);
        }
    }

    fountains.sort((a, b) => a.floor - b.floor);

    fountains.forEach((f, index) => {
        const suffix =
            f.floor === 1 ? "1st" :
            f.floor === 2 ? "2nd" :
            f.floor === 3 ? "3rd" :
            f.floor + "th";

        f.name = `${suffix} Floor Fountain ${index + 1}`;
    });

    return fountains;
}

export default LoadFountains;
