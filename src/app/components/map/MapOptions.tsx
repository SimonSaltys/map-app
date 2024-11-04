"use client"
import "@/app/tailwind.css";
import { Dispatch, SetStateAction, useState } from "react"

export function MapOptions(props : {setDisplayOptions : Dispatch<SetStateAction<DisplayOptions>> }) {
    const [radius, setRadius] = useState<number>(7500);
    const [displayAmount, setDisplayAmount] = useState<number>(20);
    const [beforeDate, setBeforeDate] = useState<Date | undefined>(undefined);  
    const [sinceDate, setSinceDate] = useState<Date | undefined>(undefined);
    const [gradeType, setGradeType] = useState<GradeType>('none');

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
                max={7500}
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
            onChange={(e) => setGradeType(e.target.value as GradeType)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-300"
            >
                <option value="none">None</option>
                <option value="verifiable">Verifiable</option>
                <option value="researched">Researched</option>
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