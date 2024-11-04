"use client";
import "react-image-gallery/styles/css/image-gallery.css";

import "@/app/tailwind.css";
import { Header } from "@/app/components/Header";
import ImageGallery from 'react-image-gallery';
import { ReactImageGalleryItem } from "react-image-gallery"
import { useState, useEffect } from "react";
import { SearchValues } from "./Map";
import dynamic from 'next/dynamic';
const DynamicMap = dynamic(() => import('./Map'), {
    ssr: false 
    });


export default function MapClientWrapper() {
    const [searchedValue, setSearchedValue] = useState<SearchValues>({
                                                specimenName: "default", 
                                                taxonId: -1 
                                                })

    const [images, setImages] = useState<any[]>([]);
    const [observations, setObservations] = useState<any[]>([])
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
        getImages();
    }, [observations]);
 
    return (
        <>
        <Header setSearchValues={setSearchedValue}/>

        <main className="h-full w-full flex">

            <section className='flex h-full w-2/3 items-center justify-center'>
            <DynamicMap specimenName={searchedValue?.specimenName} taxonId={searchedValue?.taxonId}
                        observations={observations} setObservations={setObservations}
            
            />
            </section>
            
            <section className="className='flex items-center justify-center w-full lg:w-1/3 flex-col'">
                {
                    observations && (
                        <>
                         <p className='flex h-[10%] w-full justify-center items-center text-2xl xl:text-3xl'>{(observationTitle as string)}</p>

                        <div className='w-4/5  xl:w-[95%] h-[65%] xl:h-[75%]'>
                            <ImageGallery 
                            autoPlay 
                            items={images as ReactImageGalleryItem[]} 
                            slideInterval={5000} 
                            onSlide={(currentIndex) => setCredentials(currentIndex)}
                            />
                        </div>   
                        </>
                    )

                }
            </section>

            <section>
                <p>hello</p>
            </section>
        </main>
        </>
    );
}
