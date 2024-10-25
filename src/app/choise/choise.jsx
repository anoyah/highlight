"use client";

import { open } from "@tauri-apps/api/dialog";
import { invoke } from "@tauri-apps/api/tauri";
import { useState, useEffect } from "react";
import { Button } from "@mui/material";
import { Store } from "tauri-plugin-store-api";
import { useRouter } from "next/navigation";

export default function Choise() {
  const router = useRouter();
  // 创建软件配置文件
  const store = new Store(".setting");

  useEffect(() => {
    store
      .get("book_path")
      .then((result) => {
        console.log("store.get: ", result);
        if (result == null || result == "") {
        }
        // to get home path with backend
        getHome();
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  // 通过Rust 获取根目录地址
  const getHome = () => {
    invoke("get_home", {}).then((result) => {
      console.log(result);
      setHome(result);
    });
  };

  const init = (path) => {
    invoke("init", { path: path });
  };

  // like execute cmd: echo ~
  const [home, setHome] = useState("");

  async function selectDirectory() {
    const selected = await open({
      directory: true, // 设置为true以选择目录
      multiple: false, // 是否允许选择多个目录
      defaultPath: home + "/Library/Containers/com.apple.iBooksX/Data", // 可以设置默认打开的路径
      title: "Select a Directory", // 对话框标题
    });

    if (selected) {
      console.log("Selected directory:", selected);
      // 回调Rust，选择目录；处理用户选择的目录
      const path = await store.set("book_path", selected);
      init(selected);
      console.log("root's path: ", path);
      // 存储数据
      await store.save();
      router.push("/home");
    } else {
      console.log("No directory selected");
    }
  }

  return (
    <>
      <div>点击后请选择 Documents 目录</div>
      <Button onClick={selectDirectory}>点击选择</Button>
    </>
  );
}
