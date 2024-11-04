"use client"
import 'leaflet/dist/leaflet.css'
import "@/app/tailwind.css"
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents } from 'react-leaflet'
import { useState , Dispatch, SetStateAction} from "react"
import { MapOptions } from '@/app/components/map/MapOptions'
import L from 'leaflet'

export interface SearchValues {
    specimenName : string 
    taxonId : number
}

type GradeType = 'verified' | 'researched' | 'none';

export interface DisplayOptions {
    radius : number
    displayAmount : number
    beforeDate: Date | undefined; 
    sinceDate: Date | undefined; 
    gradeType : GradeType
}

export interface MapProps extends SearchValues {
    observations: any[]; 
    setObservations: Dispatch<SetStateAction<any[]>>;
}

export default function Map(props: MapProps) {

    const { specimenName, taxonId } = props
    const [showMapOptions, setShowMapOptions] = useState<boolean>(false)
    const [clickedLocation, setClickedLocation] = useState<L.LatLngLiteral>()
    const [displayOptions,setDisplayOptions] = useState<DisplayOptions>({
        radius : 7500,
        displayAmount : 50,
        beforeDate : undefined,
        sinceDate : undefined,
        gradeType : "none"})

    const lightModeTiles: string = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png'
    const darkModeTiles: string = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
    const prefersDarkMode: boolean = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    const openAttribution: string = '&copy; https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    const esriAttribution: string = "Powered by <a href='https://www.esri.com/en-us/home' rel='noopener noreferrer'>Esri</a>"
    const iNatTileUrl: string = 'https://api.inaturalist.org/v1/points/{z}/{x}/{y}.png?photos=true&taxon_name=' + props.specimenName

    let tiles = !prefersDarkMode ? lightModeTiles : darkModeTiles
    let attribution = !prefersDarkMode ? openAttribution : esriAttribution
    
    const customIcon = L.icon({
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
                setClickedLocation(e.latlng)
                getObservations(e.latlng, map.getZoom());
            },
        })
        return null
    }

    const toggleMapOptions = () => {
        setShowMapOptions((prev) => !prev)
    };

    const getObservations = async (latLng: L.LatLngLiteral, zoom : number) => {

        let gradeType = ''
        switch (displayOptions.gradeType) {
            case 'researched':
                gradeType = 'research'
                break; 
            case 'verified':
                gradeType = 'needs_id,research'
                break; 
            default:
                gradeType = 'needs_id,research,casual'
                break; 
        }

        try {
            const params = new URLSearchParams({
                taxon_name: specimenName,
                taxon_id: taxonId.toString(),
                lat: latLng.lat.toString(),
                lng: latLng.lng.toString(),
                radius: (displayOptions.radius / 1000).toString(),
                per_page: displayOptions.displayAmount.toString(),
                quality_grade: gradeType
            })

            if (displayOptions.beforeDate) {
                params.append('d2', displayOptions.beforeDate.toDateString())
            }
            if (displayOptions.sinceDate) {
                params.append('d1', displayOptions.sinceDate.toDateString())
            }

            const url = `https://api.inaturalist.org/v1/observations?${params.toString()}`
            const response = await fetch(url)
                  .then(res => res.json())
           
            props.setObservations(response.results || [])

            console.log(props.observations)

        } catch (error) {
            console.error("Error fetching observations:", error)
        }
    }

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
                <MapOptions setDisplayOptions={setDisplayOptions}/>
            </div>
        }

        <MapContainer className="z-0" center={[40, -95]} zoom={3} style={{ height: "100vh", width: "100%" }} scrollWheelZoom={false}>
            <LocationFinder />
            <TileLayer
                attribution={attribution}
                url={tiles}
            />
            <TileLayer
                url={iNatTileUrl}
            />
            {clickedLocation && (
                <Circle
                    center={clickedLocation}
                    radius={displayOptions.radius}
                    pathOptions={{ color: '#004C46', fillColor: '#004C46' }}
                />
            )}

            {props.observations.length > 0 && (
                <>
                    {props.observations.map((observation, index) => {
                        if (index < displayOptions.displayAmount) {
                            return (
                                <Marker 
                                    key={index} 
                                    position={[observation.geojson.coordinates[1], observation.geojson.coordinates[0]]} 
                                    icon={customIcon}
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