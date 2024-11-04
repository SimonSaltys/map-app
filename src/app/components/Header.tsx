"use client"
import { Search } from "@/app/components/Search"
import '@/app/tailwind.css';
import { Dispatch, SetStateAction } from "react";

export function Header(props: { setSearchValues: Dispatch<SetStateAction<SearchValues>>}) {
    
    return (
        <header className="bg-slate-100 py-2 flex justify-start items-center">
            <div className="w-full">
                <Search setSearchValues={props.setSearchValues} />
            </div>
        </header>
    );
}