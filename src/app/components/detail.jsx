"use client";
import { invoke } from "@tauri-apps/api/tauri";
import Alert from "@mui/material/Alert";
import CheckIcon from "@mui/icons-material/Check";
import { useState } from "react";
import Image from "next/image";

export default function Detail({ info }) {
  const [copyFlag, setCopyFlag] = useState(false);

  // copy to clipboard of systecm
  const copy2Clipboard = (t) => {
    invoke("copy_to_clipboard", { text: t })
      .then((result) => {
        setCopyFlag(true);
        alert("Copy success");
        setInterval(() => {
          setCopyFlag(false);
        }, 2000);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  // clickTitle 点击标题
  const clickTitleHandle = () => {
    var content = info.text.join("\n");
    copy2Clipboard(content);
  };

  return (
    <>
      {/* <Alert icon={<CheckIcon fontSize="inherit" />} severity="success" className={`${copyFlag ? 'visible' : 'invisible'}`}>
            Here is a gentle confirmation that your action was successful.
        </Alert> */}
      <div className="h-full flex flex-col">
        <h1
          onClick={clickTitleHandle}
          className=" cursor-pointer text-2xl font-bold text-center"
        >
          {info.title}
        </h1>
        <div className="text-center ml-10">{info.author}</div>
        <div className="flex-1 overflow-auto mx-2">
          <div className="h-full flex flex-col gap-1">
            {info.text?.length == 0 ? (
              <div className="relative flex items-center justify-center h-full">
                <Image
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  src="/images/no_data.png"
                  width={100}
                  height={100}
                />
              </div>
            ) : (
              info.text?.map((text) => {
                return (
                  <div
                    className="mx-10"
                    onClick={() => copy2Clipboard(text.trim())}
                  >
                    <div className="hover:bg-neutral-100 rounded-lg cursor-pointer p-2">
                      {text.trim()}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}
