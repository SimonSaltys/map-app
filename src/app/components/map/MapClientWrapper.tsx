"use client";

import "react-image-gallery/styles/css/image-gallery.css";
import "@/app/tailwind.css";
import dynamic from 'next/dynamic';
import { Header } from "@/app/components/Header";
import ImageGallery from 'react-image-gallery';
import { ReactImageGalleryItem } from "react-image-gallery"
import { useState, useEffect } from "react";

import { LatLngLiteral } from "leaflet";
import { SearchValues } from "./Map";
import { DisplayOptions } from "./Map";
const DynamicMap = dynamic(() => import('./Map'), {
    ssr: false 
    });


export default function MapClientWrapper() {
    const defaultCoordinates: LatLngLiteral = { lat: 40, lng: -95 };

    const [searchedValue, setSearchedValue] = useState<SearchValues>({
                                                specimenName: undefined, 
                                                taxonId: -1 
                                                })
     const [displayOptions,setDisplayOptions] = useState<DisplayOptions>({
        radius : 75,
        displayAmount : 20,
        beforeDate : undefined,
        sinceDate : undefined,
        gradeType : "needs_id,research,casual"})

    const [userCoordinates, setUserCoordinates] = useState<LatLngLiteral>()
    const [coordinates, setCoordinates] = useState<LatLngLiteral>()

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
    
            if(!searchedValue.specimenName)
                return;
    
            const iNatFetchObj = {
                activeSpecies: searchedValue.specimenName,
                userCoordinates: userCoordinates ? userCoordinates : undefined,
                radius: displayOptions.radius,
                qualityGrade: displayOptions.gradeType
            };
    
            const res = await fetch('api/collections/inaturalist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',  
                },
                body: JSON.stringify(iNatFetchObj) 
            });
    
            if (res.ok) {
                const json = await res.json();
    
                setCoordinates(userCoordinates);
                setObservations(json.data.observations);
                setImages(json.data.images);
                setTopObservers(json.data.topObservers);
                setTopIdentifiers(json.data.topIdentifiers);
    
                if (!userCoordinates) {
                    setCoordinates(json.data.point);
                }
            } else {
                console.error("Error fetching iNaturalist data:", res.statusText);
            }
        };
    
        iNatFetch();
    
    }, [userCoordinates, displayOptions]); 
 
    return (
        <>
        <Header setSearchValues={setSearchedValue} />
    
        <main className="h-full w-full flex">
    
            <section className='flex h-full ml-2 w-1/3 items-center justify-center'>
           
                <DynamicMap activeSpecies={searchedValue.specimenName} 
                            position={coordinates ?? defaultCoordinates} 
                            userCoordinates={userCoordinates} 
                            setUserCoordinates={setUserCoordinates} 
                            observations={observations ?? []}
                            displayOptions={displayOptions}
                            setDisplayOptions={setDisplayOptions}
                />
        
                
            </section>
            
            <section className='flex items-center justify-center w-full lg:w-1/3 flex-col'>
                {observations && (
                    <>
                        <p className='flex h-[10%] w-full justify-center items-center text-2xl xl:text-3xl'>{(observationTitle as string)}</p>
                        <div className='w-4/5  xl:w-[95%] h-[500px] xl:h-[75%]'>
                            <ImageGallery autoPlay items={images as ReactImageGalleryItem[]} slideInterval={100} onSlide={(currentIndex) => setCredentials(currentIndex)}/>
                        </div>
                        <div id='observationCredentials' className='flex flex-col h-[25%] xl:h-[15%] w-3/5 text-center items-center justify-center text-base xl:text-lg p-2 m-2'>
                            <p className="">{observationLocation}</p>
                            <p className="">{observationDate}</p>
                            <p className='mt-1'>
                                <img className='inline-block h-[48px] w-[48px] mr-4' src={observerIcon} alt='Observer Icon' />
                                <span className="">{observer}</span>
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
