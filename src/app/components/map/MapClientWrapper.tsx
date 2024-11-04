"use client";
import "react-image-gallery/styles/css/image-gallery.css";

import "@/app/tailwind.css";
import { Header } from "@/app/components/Header";
import ImageGallery from 'react-image-gallery';
import { ReactImageGalleryItem } from "react-image-gallery"
import { useState, useEffect } from "react";
import { SearchValues } from "./Map";
import { LatLngLiteral } from "leaflet";
import dynamic from 'next/dynamic';
const DynamicMap = dynamic(() => import('./Map'), {
    ssr: false 
    });


export default function MapClientWrapper() {
    const [searchedValue, setSearchedValue] = useState<SearchValues>({
                                                specimenName: "default", 
                                                taxonId: -1 
                                                })
    const [userCoordinates, setUserCoordinates] = useState<LatLngLiteral>()


    const [images, setImages] = useState<any[]>([]);
    const [observations, setObservations] = useState<any[]>([])
    const [topObservers, setTopObservers] = useState<any[]>()
    const [topIdentifiers, setTopIdentifiers] = useState<any[]>()

    const [observer, setObserver] = useState<string>()
    const [observationTitle, setObservationTitle] = useState<string>()
    const [observationLocation, setObservationLocation] = useState<string>()
    const [observationDate, setObservationDate] = useState<string>()
    const [observerIcon, setObserverIcon] = useState<string>()



    const setCredentials = (index: number) => {
        const observation = observations[index]
        setObserver(observation.user.login_exact ?? observation.user.login ?? '')
        setObservationTitle(observation.species_guess ?? observation.taxon.name ?? '')
        setObservationDate(observation.observed_on_details.date ?? observation.time_observed_at ?? '')
        setObservationLocation(observation.place_guess ?? '')
        setObserverIcon(observation.user.icon ?? 'img/blankIcon.jpg')
    }

    useEffect(() => {

        const iNatFetch = async () => {

            const iNatFetchObj = {
                activeSpecies: searchedValue.specimenName,
                userCoordinates: userCoordinates ? userCoordinates : undefined
            }

            const res = await fetch('/api/collections/inaturalist', {
                method: 'POST',
                body: JSON.stringify(iNatFetchObj)

            })

            if (res.ok) {
                const json = await res.json()

                setCoordinates(userCoordinates)
                setObservations(json.data.observations)
                setImages(json.data.images)
                setTopObservers(json.data.topObservers)
                setTopIdentifiers(json.data.topIdentifiers)

                if (!userCoordinates) {
                    setCoordinates(json.data.point)
                }
            }
        }

        iNatFetch()

    }, [userCoordinates]) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        const getImages = () => {
            if (observations.length > 0) {
                const imageItems = observations.map((observation) => {
                    const imageUrl = observation.photos[0]?.url?.replace('square', 'medium'); // Use 'medium' or 'large' for better quality
                    return {
                        original: imageUrl,
                        thumbnail: imageUrl,
                        originalAlt: observation.species_guess ?? 'Image of specimen',
                        thumbnailAlt: observation.species_guess ?? 'Thumbnail of specimen',
                    };
                });
                setImages(imageItems);
            }
        };

        getImages()
    }, [observations]);
 
    return (
        <>
        <Header setSearchValues={setSearchedValue} />
    
        <main className="h-full w-full flex">
    
            <section className='flex h-full w-1/3 items-center justify-center'>
                <DynamicMap specimenName={searchedValue?.specimenName} taxonId={searchedValue?.taxonId}
                            observations={observations} setObservations={setObservations}
                />
            </section>
            
            <section className='flex items-center justify-center w-full lg:w-1/3 flex-col'>
                {observations && (
                    <>
                        <p className='flex h-[10%] w-full justify-center items-center text-2xl xl:text-2xl'>{(observationTitle as string)}</p>
                        <div className='w-4/5 xl:w-[95%] xl:h-[75%]'>
                            <ImageGallery autoPlay items={images as ReactImageGalleryItem[]} slideInterval={5000} onSlide={(currentIndex) => setCredentials(currentIndex)}/>
                        </div>
                        <div id='observationCredentials' className='flex flex-col h-[35%] xl:h-[25%] w-3/5 text-center items-center justify-center text-base xl:text-lg overflow-y-auto max-h-[25vh]'>
                            <p className="truncate max-w-full">{observationLocation}</p>
                            <p className="truncate max-w-full">{observationDate}</p>
                            <p className='mt-2'>
                                <img className='inline-block h-[48px] w-[48px] mr-4' src={observerIcon} alt='Observer Icon' />
                                <span className="truncate max-w-full">{observer}</span>
                            </p>
                        </div>
                    </>
                )}
            </section>
    
            <section>
                <p></p>
            </section>
        </main>
        </>
    );
    
}
