"use client"
import { useEffect, useState } from "react"
import { invoke } from "@tauri-apps/api/tauri"


export default function BookContent({ assetId }) {
    const [bookContent, setBookContent] = useState({});
    useEffect(() => {
        invoke('book_highlight', { assetId: assetId }).then(result => {
            console.log(result);
            setBookContent(result);
        }).catch(console.error)
    }, [])

    return <>
        {
            bookContent.text?.map(text => {
                return <div>{text}</div>
            })
        }
    </>;
}