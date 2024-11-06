import { Console } from 'console';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const data = await request.json();

    let coordinates: { lat: number, lng: number } | undefined;
    let observations: any[] | undefined;
    let imageArr: { original: string, thumbnail: string }[] | undefined;

    try {
        // Function to fetch marker location based on species
        const getMarkerLocation = async () => {
            const observation = await fetch(`https://api.inaturalist.org/v1/observations?taxon_name=${data.activeSpecies}&photos=true`)
                .then(res => res.json())
                .then(json => {
                    const results = json.results;

                    if (results.length) {
                        for (let i in results) {
                            const point = results[i].geojson?.coordinates ?? '';
                            if (point) {
                                coordinates = { lat: point[1] as number, lng: point[0] as number };
                                break;
                            }
                        }
                    }
                    return coordinates ? true : false;
                });
            return observation;
        };

        // Function to get top observers/identifiers within a specific radius
        const getLeaders = async (type: 'observers' | 'identifiers') => {
            const point = data.userCoordinates ? data.userCoordinates : coordinates;
            const leaders = await fetch(`https://api.inaturalist.org/v1/observations/${type}?taxon_name=${data.activeSpecies}&lat=${point.lat}&lng=${point.lng}&radius=${data.radius}&photos=true`)
                .then(res => res.json())
                .then(json => json.results.splice(0, 10));
            return leaders;
        };

        // Function to fetch surrounding observations and images
        const getSurroundingObservations = async (url: string) => {
            await fetch(url)
                .then(res => res.json())
                .then((json) => {
                    if (json.results.length) {
                        const images = [];
                        for (let i in json.results) {
                            const image = json.results[i].photos[0].url.replace('square', 'large');
                            images.push({ original: image, thumbnail: json.results[i].photos[0].url });
                        }

                        observations = json.results;
                        imageArr = images;
                    }
                });
        };

        // Handling the case if userCoordinates are available
        if (data.userCoordinates) {
            await getSurroundingObservations(`https://api.inaturalist.org/v1/observations?taxon_name=${data.activeSpecies}&lat=${data.userCoordinates.lat}&lng=${data.userCoordinates.lng}&radius=${data.radius}&quality_grade=${data.qualityGrade}`);
            const topObservers = await getLeaders('observers');
            const topIdentifiers = await getLeaders('identifiers');
            return NextResponse.json({
                data: { observations, images: imageArr, topObservers, topIdentifiers },
            });
        }
        // If userCoordinates are not available, use coordinates from getMarkerLocation
        else {
            await getMarkerLocation();
            if (coordinates) {
                await getSurroundingObservations(`https://api.inaturalist.org/v1/observations?taxon_name=${data.activeSpecies}&lat=${coordinates.lat}&lng=${coordinates.lng}&radius=${data.radius}&photos=true&quality_grade=${data.qualityGrade}`);
                const topObservers = await getLeaders('observers');
                const topIdentifiers = await getLeaders('identifiers');
                return NextResponse.json({
                    data: { point: coordinates, observations, images: imageArr, topObservers, topIdentifiers },
                });
            }
        }
    }
    catch (e: any) {
        // Handle errors and respond with a 400 status
        return NextResponse.json({ data: e.message }, { status: 400, statusText: 'fetch error' });
    }
}
