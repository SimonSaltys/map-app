"use client"
import "@/app/tailwind.css";
import { DisplayOptions } from "./Map"
import { Dispatch, SetStateAction, useState } from "react"

export function MapOptions(props : {displayOptions : DisplayOptions, setDisplayOptions : Dispatch<SetStateAction<DisplayOptions>> }) {
    const displayOptions = props.displayOptions;
    const [radius, setRadius] = useState<number>(displayOptions.radius);
    const [displayAmount, setDisplayAmount] = useState<number>(displayOptions.displayAmount);
    const [beforeDate, setBeforeDate] = useState<Date | undefined>(displayOptions.beforeDate);  
    const [sinceDate, setSinceDate] = useState<Date | undefined>(displayOptions.sinceDate);
    const [gradeType, setGradeType] = useState<string>(displayOptions.gradeType);

    const handleSubmit = (event : React.FormEvent) => {
        event.preventDefault()
        props.setDisplayOptions({
            radius,
            displayAmount,
            beforeDate,
            sinceDate,
            gradeType,
        });
    }

    return (
    <>
    <form onSubmit={handleSubmit}>
        <div className="mb-4">
            <input
                id="radius"
                type="number"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                min={1}
                max={75}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-300"
            />

            <label htmlFor="radius" className="block text-gray-700 mb-2">Radius of search</label>
        </div>

        <div className="mb-4">
            <input
                id="display"
                type="number"
                value={displayAmount}
                onChange={(e) => setDisplayAmount(Number(e.target.value))}
                max={30}
                min={1}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-300"
            />

            <label htmlFor="display" className="block text-gray-700 mb-2">Max Occurrences</label>
        </div>

        <div className="mb-4">
            <input
                id="after-date"
                type="date"
                value={beforeDate ? beforeDate.toISOString().split('T')[0] : ''}
                onChange={(e) => setBeforeDate(e.target.value ? new Date(e.target.value) : undefined)}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-300"
            />

            <label htmlFor="date-before" className="block text-gray-700 mb-2">Before date</label>
        </div>

        <div className="mb-4">
            <input
                id="date-since"
                type="date"
                value={sinceDate ? sinceDate.toISOString().split('T')[0] : ''}
                onChange={(e) => setSinceDate(e.target.value ? new Date(e.target.value) : undefined)}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-300"
            />

            <label htmlFor="date-after" className="block text-gray-700 mb-2">Since date</label>
        </div>

        <div className="mb-4">
        <select
            id="grade-type"
            value={gradeType}
            onChange={(e) => setGradeType(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-300"
            >
                <option value="needs_id,research,casual">None</option>
                <option value="needs_id,research">Verifiable</option>
                <option value="research">Researched</option>
            </select>
                
            <label htmlFor="grade-type" className="block text-gray-700 mb-2"> Grade type </label>

            <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">
                Submit
            </button>
        </div>
    </form>
    </>
    )
}