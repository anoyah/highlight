"use client";

import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import Link from "next/link";
import Image from "next/image";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";

import Detail from "../components/detail";
import { Button } from "@mui/material";

export default function Home() {
  const [AssetId, setAssetId] = useState(""); // 书本id
  const [search, setSearch] = useState("");
  const [fresh, setFresh] = useState(true); // 刷新
  const [bookshelf, setBookshelf] = useState([]);
  const [isFold, setIsFold] = useState(false); // 是否折叠？
  const [bookContent, setBookContent] = useState({});
  const [age, setAge] = useState("全部");

  useEffect(() => {
    invoke("book_shelf", {})
      .then((result) => {
        console.log(result);
        setBookshelf(result);
      })
      .catch(console.error);
  }, []);

  // searchBook 根据关键词检索图书
  const searchBook = () => {
    invoke("book_search", { text: search }).then((result) => {
      console.log(result);
      setBookshelf(result);
    });
  };

  //
  const handleChange = (event) => {
    setAge(event.target.value);
  };

  // 监听输入文本狂变化
  const onChange = (event) => setSearch(event.target.value);

  // onEnter 点击Enter调用
  const onEnter = (event) => {
    if (event.key == "Enter") {
      searchBook();
    }
  };

  const getHighLight = (assetID) => {
    setFresh(true);
    setAssetId(assetID);
    invoke("book_highlight", { assetId: assetID })
      .then((result) => {
        console.log(result);
        setBookContent(result);
      })
      .catch(console.error);
    setFresh(false);
  };

  return (
    <div className="flex flex-row h-full">
      <div
        className={`${
          isFold ? "hidden" : "basis-1/3 "
        } flex flex-col ml-10 mt-10`}
      >
        <div className="flex flex-row justify-between">
          <h1 className="text-2xl font-bold mb-4">
            <Link href="/second">Hightlight</Link>
          </h1>
          <div className="flex flex-row gap-4 pr-5">
            <div>
              <Image
                className="cursor-pointer"
                src="/images/search.png"
                width={24}
                height={24}
              />
            </div>
            <div>
              <Image
                className="cursor-pointer"
                src="/images/unfinished.png"
                width={24}
                height={24}
              />
            </div>
            {/* TODO 添加折叠功能 */}
            {/* <div>
                <Image
                  className="cursor-pointer"
                  src="/images/fold.png"
                  onClick={() => {
                    setIsFold(!isFold);
                  }}
                  width={24}
                  height={24}
                />
              </div> */}
          </div>
        </div>

        {bookshelf.length === 0 ? (
          <div className="bg-center">
            <CircularProgress />
          </div>
        ) : (
          <div className="overflow-auto mr-2 pr-10">
            {bookshelf.map((item) => {
              if (item.is_finished == "1") {
              }
              return (
                <ListItem
                  className={`cursor-pointer  rounded-lg ${
                    AssetId == item.asset_id ? "bg-[#CFCDCF]" : ""
                  }`}
                  key={item.asset_id}
                  onClick={() => getHighLight(item.asset_id)}
                >
                  <ListItemText primary={item.title} secondary={item.author} />
                </ListItem>
              );
            })}
          </div>
        )}
      </div>
      {fresh ? (
        <div
          className={`${
            isFold ? "" : "basis-2/3"
          } bg-white flex-grow grid place-items-center h-screen`}
        >
          <Image src="/images/no_data.png" width={100} height={100} />
        </div>
      ) : (
        <div
          className={`${isFold ? "" : "basis-2/3"} bg-white border-solid py-5`}
        >
          <Detail info={bookContent} />
        </div>
      )}
    </div>
  );
}
