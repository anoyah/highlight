"use client"
import { useState, useEffect } from "react"
import Divider from '@mui/material/Divider';


export default function Second() {
    return <div className="overflow-clip static">
        <div data-tauri-drag-region className="absolute  h-8 float-right left-0 top-0  w-full"></div>
        <div className="flex flex-row gap-10 h-screen">
            <ul className="basis-1/3 m-10 overflow-auto">
                <li className="my-10">123</li>
                <li className="my-10">123</li>
                <li className="my-10">123</li>
                <li className="my-10">123</li>
                <li className="my-10">123</li>
                <li className="my-10">123</li>
                <li className="my-10">123</li>
                <li className="my-10">123</li>
                <li className="my-10">123</li>
                <li className="my-10">123</li>
                <li className="my-10">123</li>
                <li className="my-10">123</li>
            </ul>
            {/* <div className="basis-1/3  bg-black">2</div> */}
            <Divider orientation="vertical" />
            <div className="basis-2/3 m-10   bg-black">3</div>
        </div>
    </div>
}