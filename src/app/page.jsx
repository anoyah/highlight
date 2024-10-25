"use client";

import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import Index from "./home/page";
import First from "./choise/choise";
import { Store } from "tauri-plugin-store-api";
import { useRouter } from "next/navigation";
import CircularProgress from "@mui/material/CircularProgress";

export default function Home() {
  const router = useRouter();
  // 创建软件配置文件
  const store = new Store(".setting");
  const [loading, setLoading] = useState(true);

  const [already, setAlready] = useState(false);

  // 判断是否已经存储了图书的sqlite目录
  useEffect(() => {
    store.get("book_path").then((result) => {
      if (result == "" || result == null) {
        // router.push("/choise");
        return;
      } else {
        init(result);
        setAlready(true);
        // router.replace("/home");
      }
    });

    return () => {};
  });

  const init = (path) => {
    invoke("init", { path: path });
  };

  return (
    <main className="static h-screen overflow-hidden font-[family-name:var(--font-geist-sans)]">
      <div
        data-tauri-drag-region
        className="h-8 absolute left-0 top-0 w-full"
      />
      {already ? (
        <Index />
      ) : loading ? (
        s({ chilren: <CircularProgress /> })
      ) : (
        s({ chilren: <First /> })
      )}
    </main>
  );
}

function s({ chilren }) {
  return (
    <div className="h-full flex items-center justify-center">{chilren}</div>
  );
}
