"use client"
import 'leaflet/dist/leaflet.css'
import "@/app/tailwind.css"
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents } from 'react-leaflet'
import { useState , Dispatch, SetStateAction} from "react"
import { MapOptions } from '@/app/components/map/MapOptions'
import L, { LatLngLiteral } from 'leaflet'
import { Console } from 'console'

export interface SearchValues {
    specimenName : string | undefined
    taxonId : number 
}

export interface DisplayOptions {
    radius : number
    displayAmount : number
    beforeDate: Date | undefined; 
    sinceDate: Date | undefined; 
    gradeType : string
}

export interface MapProps {
    activeSpecies : string | undefined
    position : LatLngLiteral
    userCoordinates: LatLngLiteral | undefined 
    setUserCoordinates: Dispatch<SetStateAction<LatLngLiteral | undefined>> 
    observations: any[]
    setDisplayOptions : Dispatch<SetStateAction<DisplayOptions>>
    displayOptions : DisplayOptions 
}

export default function Map(props: MapProps) {

    const [showMapOptions, setShowMapOptions] = useState<boolean>(false)

    const lightModeTiles: string = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png'
    const darkModeTiles: string = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
    const prefersDarkMode: boolean = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    const openAttribution: string = '&copy; https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    const esriAttribution: string = "Powered by <a href='https://www.esri.com/en-us/home' rel='noopener noreferrer'>Esri</a>"
    const iNatTileUrl: string = 'https://api.inaturalist.org/v1/points/{z}/{x}/{y}.png?photos=true&taxon_name=' + props.activeSpecies

    let tiles = !prefersDarkMode ? lightModeTiles : darkModeTiles
    let attribution = !prefersDarkMode ? openAttribution : esriAttribution
    
    const observationIcon = L.icon({
        iconRetinaUrl: '/img/marker-32.png',
        iconUrl: '/img/marker-32.png',
        popupAnchor: [-0, -0],
        iconSize: [32, 32],
      });

      const centerIcon = L.icon({
        iconRetinaUrl: '/img/marker-icon-2x.png',
        iconUrl: '/img/marker-icon.png',
        shadowUrl: '/img/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        tooltipAnchor: [16, -28],
        shadowSize: [41, 41]
      });

      

    const LocationFinder = () => {
        const map = useMapEvents({
            click(e) {
                props.setUserCoordinates({ lat: e.latlng.lat, lng: e.latlng.lng });
            },
        })

        return props.position === null ? null : (
            <Marker position={props.position} icon={centerIcon} />
        )
    }

    const toggleMapOptions = () => {
        setShowMapOptions((prev) => !prev)
    };

   return (
        <div className="relative">
        
        <button 
            onClick={toggleMapOptions} 
            className="bg-blue-500 text-white p-2 rounded absolute top-4 right-4 z-10 shadow-md"
        >
            Toggle Map Options
        </button>

        {showMapOptions && 
            <div className="absolute top-16 right-4 z-50 bg-white shadow-md p-4 rounded">
                <MapOptions 
                    setDisplayOptions={props.setDisplayOptions}
                    displayOptions={props.displayOptions}
                />
            </div>
        }

        <MapContainer className="z-0 rounded-xl" center={[props.position.lat, props.position.lng]} zoom={3}  style={{ height: "100vh", width: "30vw"}} scrollWheelZoom={false}>
            <LocationFinder />
            <TileLayer
                attribution={attribution}
                url={tiles}
            />
            <TileLayer
                url={iNatTileUrl}
            />
            {props.position && (
                <Circle
                    center={props.position}
                    radius={props.displayOptions.radius * 1000}
                    pathOptions={{ color: '#004C46', fillColor: '#004C46' }}
                />
            )}

            {props.observations.length > 0 && (
                <>
                    {props.observations.map((observation, index) => {
                        if (index < props.displayOptions.displayAmount) {
                            return (
                                <Marker 
                                    key={index} 
                                    position={[observation.geojson.coordinates[1], observation.geojson.coordinates[0]]} 
                                    icon={observationIcon}
                                >
                                    <Popup>
                                        <div className='flex h-[200px] w-[300px] justify-between'>
                                            <div>
                                                <p className='text-center text-[20px] !mt-0 !mb-[12px] text-[#004C46] dark:text-[#F5F3E7]'>
                                                    {observation.taxon.preferred_common_name}
                                                </p>
                                                <p className='text-[14px] !mt-0 !mb-[12px]'>Observer: {observation.user.login}</p>
                                                <p className='text-[14px] !m-0 !mb-[12px]'>Date: {observation.observed_on_details.date}</p>
                                                <p className='text-[14px] !m-0 !mb-[12px]'>Verifiable: {observation.quality_grade}</p>

                                            </div>
                                            {observation.photos && observation.photos.length > 0 && (
                                                <img 
                                                    src={observation.photos[0].url.replace('square', 'small')} 
                                                    alt="observation photo" 
                                                    className='inline-block w-[125px] h-[150px]' 
                                                />
                                            )}
                                        </div>
                                    </Popup>
                                </Marker>
                            );
                        }
                        return null; //beyond index allowed
                    })}
                </>
            )}
        </MapContainer>
    </div>
   ) 
}