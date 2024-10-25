"use client"
import { useEffect, useState } from "react"
import { invoke } from "@tauri-apps/api/tauri"


export default function BookShelf() {
    const [bookshelf, setBookshelf] = useState([]);
    useEffect(() => {
        invoke('book_shelf', {}).then(result => {
            console.log(result);
            setBookshelf(result);
        }).catch(console.error)
    }, [])

    return <>
        {bookshelf.map((item) => {
            return <div id={item.asset_id}>{item.title}</div>
        })}
    </>;
}