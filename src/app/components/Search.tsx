"use client"

import { FaSearch } from "react-icons/fa"
import { Dispatch, SetStateAction, useState } from "react"
import "@/app/tailwind.css";

const URL = "https://api.inaturalist.org/v1/taxa/autocomplete";

export function Search(props: { setSearchValues: Dispatch<SetStateAction<SearchValues>>}) {
    const [results, setResults] = useState<SearchValues[]>([]); //the results of the fetch request 
    const [highlightedIndex, setHighlightedIndex] = useState<number>(-1); //the currently highlighted index in the results array

    const [optionsVisible, setOptionsVisible] = useState<boolean>(false); 
    const [inputValue, setInputValue] = useState<string>(''); //the value currently entered in the search bar

    //Called when the user inputs a character into the search bar
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setOptionsVisible(true)

        const value : string = event.target.value
        setInputValue(value)

        if(value)
            fetchData(value)
        else {
            setResults([])
            setHighlightedIndex(-1)
            setOptionsVisible(false)
        }
    }
    
    const fetchData = async (searchTerm : string) => {
            try{
                const response = await fetch(`${URL}?q=${encodeURIComponent(searchTerm)}`)
                .then(res => res.json())
                
                const mappedResults: SearchValues[] = response.results.map((result: any) => ({
                    specimenName: result.name,
                    taxonId: result.id
                }))

                setResults(mappedResults)
            } catch {
                console.log("Error fetching auto complete")
            }
   }

   //Called when the user clicks a result option in the results array
   const handleClick = (indexClicked: number) => {
    setHighlightedIndex(indexClicked);

    const selectedResult = results[indexClicked];

    if (selectedResult) {
        setInputValue(selectedResult.specimenName)
        props.setSearchValues(selectedResult)
        setHighlightedIndex(-1)
    }
    setOptionsVisible(false) 
}

   //Called when the user hits enter or the search button
   const handleSubmit = (event?: React.FormEvent<HTMLFormElement>) => {
    setOptionsVisible(false)
    
       if(event)
        event.preventDefault()

       if(highlightedIndex >= 0 && highlightedIndex < results.length) {
            const completedValue = results[highlightedIndex]

            props.setSearchValues(completedValue)
            setInputValue(completedValue.specimenName)
            setHighlightedIndex(-1)
       }
        else {
        //    props.setSearchValues({
        //     specimenName: "default", 
        //     taxonId: -1 
        //    })
        }
            

            
   }


    //Handles all keystrokes when navigating the autocomplete results
    const autoCompleteKeyHandler = (event: React.KeyboardEvent<HTMLInputElement>) => {

            if(event.key == "Enter") {
                handleSubmit();

            } else if(optionsVisible) {

            switch (event.key) {
                case "ArrowDown":
                case "Tab":
                    event.preventDefault();
                    if (highlightedIndex < results.length - 1) {
                        setHighlightedIndex(highlightedIndex + 1);
                    }
                    break;
                case "ArrowUp":
                case "Shift":
                    event.preventDefault();
                    if (highlightedIndex > 0) {
                        setHighlightedIndex(highlightedIndex - 1);
                    }
                    break;
                default:
                    break;
            }
        }
    }

    return (
        <>
        <form className="max-w-md ml-2" onSubmit={handleSubmit}>
            <label htmlFor="default-search" className="mb-2 text-sm font-medium text-gray-900 sr-only">Search</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FaSearch />
                </div>
                <input
                    type="text"
                    id="default-search"
                    className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Get autocomplete for the INaturalist site"
                    value={inputValue}
                    required
                    onChange ={handleChange}
                    onKeyDown={autoCompleteKeyHandler}
                />
                <button
                    type="submit"
                    className="text-white absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2"
                >
                    Search
                </button>
            </div>
            {
                results.length >= 0 && optionsVisible && 
                <ul className="border border-gray-300 rounded-lg absolute z-50 bg-white shadow-2xl mt-1">
                        {results.map((result, index) => (
                    <li
                        key={result.taxonId}
                        className={`p-2 border-b ${highlightedIndex === index ? "bg-blue-700 text-white" : "hover:bg-gray-200"}`}
                        onClick={() => {
                            handleClick(index);
                        }}>
                        {result.specimenName}
                    </li>
                        ))}
                </ul> 
            }
        </form>
        </>    
    );
}
