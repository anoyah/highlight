// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use std::{
    fs,
    path::PathBuf,
    sync::{Arc, Mutex},
};

use cocoa::appkit::{NSWindow, NSWindowStyleMask};
use tauri::{Manager, Runtime, Window};

mod book;

fn main() {
    let book = Arc::new(Mutex::new(book::Book::default())); // 包装在 Arc<Mutex<T>> 中

    // build tauri's app
    tauri::Builder::default()
        .manage(book.clone())
        .plugin(tauri_plugin_store::Builder::default().build())
        .setup(|app| {
            // implement app's style of status of macos
            let win = app.get_window("main").unwrap();
            win.set_transparent_titlebar(true);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            init,
            get_home,
            book_shelf,
            book_highlight,
            copy_to_clipboard,
            book_search
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// 初始化软件，并获取sqlite文件名
#[tauri::command]
fn init(path: String, book: tauri::State<Arc<Mutex<book::Book>>>) {
    let mut bk: String = String::from("");
    let mut ae: String = String::from("");

    let p = path.clone();

    let mut bk_library = PathBuf::from(path);
    let mut ae_annotation = bk_library.clone();

    bk_library.push("BKLibrary");
    ae_annotation.push("AEAnnotation");

    let entries = fs::read_dir(bk_library).unwrap();
    for entry in entries {
        let entry = entry.unwrap();
        let file_name = entry.file_name(); // 获取文件名
        let fn1 = file_name.clone();
        let fn2 = fn1.to_str().unwrap();

        if fn2.starts_with("BKLibrary") && fn2.ends_with(".sqlite") {
            bk = fn2.to_string();
        }
    }

    let entries = fs::read_dir(ae_annotation).unwrap();
    for entry in entries {
        let entry = entry.unwrap();
        let file_name = entry.file_name(); // 获取文件名
        let fn1 = file_name.clone();
        let fn2 = fn1.to_str().unwrap();

        if fn2.starts_with("AEAnnotation") && fn2.ends_with(".sqlite") {
            ae = fn2.to_string();
        }
    }

    let mut book = book.lock().unwrap();
    book.renew(
        format!("{}/AEAnnotation/{}", p, ae),
        format!("{}/BKLibrary/{}", p, bk),
    );
}

#[tauri::command]
fn get_home() -> String {
    dirs::home_dir().unwrap().to_str().unwrap().to_string()
}

// copy_to_clipboard 将text发送至系统粘贴板
#[tauri::command]
fn copy_to_clipboard(text: String) -> Result<(), String> {
    let mut clipboard = arboard::Clipboard::new().map_err(|e| e.to_string())?;
    clipboard.set_text(text).map_err(|e| e.to_string())?;
    Ok(())
}

// book_shelf 获取存在标注的图书
#[tauri::command]
fn book_shelf(book: tauri::State<Arc<Mutex<book::Book>>>) -> Vec<book::Library> {
    let book = book.lock().unwrap();
    let library: Vec<book::Library> = book.get_library();
    return library;
}

// book_search 根据作者或是标题模糊匹配图书
#[tauri::command]
fn book_search(book: tauri::State<Arc<Mutex<book::Book>>>, text: String) -> Vec<book::Library> {
    let library: Vec<book::Library> = book.lock().unwrap().get_library_with_text(text);
    return library;
}

// book_highlight 根据asset id获取所有的图书高亮显示文字
#[tauri::command]
fn book_highlight(
    book: tauri::State<Arc<Mutex<book::Book>>>,
    asset_id: String,
) -> Option<book::Library> {
    book.lock()
        .unwrap()
        .get_library_with_asset_id(asset_id.as_str())
}

pub trait WindowExt {
    #[cfg(target_os = "macos")]
    fn set_transparent_titlebar(&self, transparent: bool);
}

impl<R: Runtime> WindowExt for Window<R> {
    #[cfg(target_os = "macos")]
    fn set_transparent_titlebar(&self, transparent: bool) {
        use cocoa::appkit::NSWindowTitleVisibility;

        unsafe {
            let id = self.ns_window().unwrap() as cocoa::base::id;

            let mut style_mask = id.styleMask();
            style_mask.set(
                NSWindowStyleMask::NSFullSizeContentViewWindowMask,
                transparent,
            );
            id.setStyleMask_(style_mask);

            id.setTitleVisibility_(if transparent {
                NSWindowTitleVisibility::NSWindowTitleHidden
            } else {
                NSWindowTitleVisibility::NSWindowTitleVisible
            });
            id.setTitlebarAppearsTransparent_(if transparent {
                cocoa::base::YES
            } else {
                cocoa::base::NO
            });
        }
    }
}
