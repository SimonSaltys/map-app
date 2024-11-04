"use client"
import { Header } from "@/app/components/Header"
import '@/app/tailwind.css';
import { useState } from "react";
import { AutoCompleteResult } from "./AutoCompleteResult";

export function ClientWrapper() {
    const [searchedValue, setSearchedValue] = useState<string>('')

    return (
       <>
       <Header searchedValue={searchedValue} setSearchedValue={setSearchedValue} />
       <AutoCompleteResult searchedValue={searchedValue}/>  
       </>

        
    );
}