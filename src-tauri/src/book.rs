use serde::Serialize;
use sqlite::State;
use std::{
    path::PathBuf,
    sync::{Arc, Mutex},
    vec,
};

#[derive(Debug, Serialize)]
pub struct Library {
    pub asset_id: String,
    title: String,
    author: String,
    is_finished: String,
    text: Vec<String>,
}

#[derive(Default)]
pub struct Book {
    annotation: Option<Arc<Mutex<sqlite::Connection>>>, // table AeAnnotation sqlite's connect
    library: Option<Arc<Mutex<sqlite::Connection>>>,    // table BkLibrary sqlite's connect
    bklibrary: String,                                  // table's path
    aeannotation: String,                               // the table's path
}

impl Book {
    // renew to connect with sqlite;
    pub fn renew(&mut self, ae: String, bk: String) {
        self.aeannotation = ae;
        self.bklibrary = bk;

        self.annotation = Some(connect_sqlite(self.aeannotation.clone()).unwrap());
        self.library = Some(connect_sqlite(self.bklibrary.clone()).unwrap());
    }

    pub fn get_library(&self) -> Vec<Library> {
        // ZLASTOPENDATE time at last open
        let sql = "SELECT * FROM ZBKLIBRARYASSET ORDER BY ZLASTOPENDATE DESC;";
        self.get_library_with_sql(sql)
    }

    pub fn get_library_with_text(&self, text: String) -> Vec<Library> {
        let sql = if text.is_empty() {
            "SELECT * FROM ZBKLIBRARYASSET ORDER BY ZLASTOPENDATE DESC;".to_string()
        } else {
            format!(
                "SELECT * FROM ZBKLIBRARYASSET WHERE ZTITLE LIKE '%{}%' OR ZAUTHOR LIKE '%{}%'",
                text, text
            )
        };
        self.get_library_with_sql(&sql)
    }

    fn get_library_with_sql(&self, sql: &str) -> Vec<Library> {
        let db = self.library.clone().unwrap();
        let library = db.lock().unwrap();
        let mut statement = library.prepare(sql).unwrap();

        let mut result: Vec<Library> = Vec::new();
        while let Ok(State::Row) = statement.next() {
            let asset_id = statement.read::<String, _>("ZASSETID").unwrap_or_default();
            let title = statement.read::<String, _>("ZTITLE").unwrap_or_default();
            let author = statement.read::<String, _>("ZAUTHOR").unwrap_or_default();
            let is_finished = statement
                .read::<String, _>("ZISFINISHED")
                .unwrap_or_default();

            result.push(Library {
                asset_id: asset_id,
                title: title,
                author: author,
                is_finished: is_finished,
                text: vec![],
            });
        }
        result
    }

    pub fn get_library_with_asset_id(&self, asset_id: &str) -> Option<Library> {
        let sql = format!(
            "SELECT * FROM ZBKLIBRARYASSET WHERE ZASSETID = '{}' AND ZTITLE != '' LIMIT 1",
            asset_id
        );
        let db = self.library.clone().unwrap();
        let library = db.lock().unwrap();

        let mut statement = library.prepare(sql).unwrap();

        while let Ok(State::Row) = statement.next() {
            // To get annotation with asset id.
            let text = self.get_annotation_with_asset_id(asset_id);

            let asset_id = statement.read::<String, _>("ZASSETID").unwrap_or_default();
            let title = statement.read::<String, _>("ZTITLE").unwrap_or_default();
            let author = statement.read::<String, _>("ZAUTHOR").unwrap_or_default();
            let is_finished = statement
                .read::<String, _>("ZISFINISHED")
                .unwrap_or_default();

            return Some(Library {
                asset_id: asset_id,
                title: title,
                is_finished: is_finished,
                author: author,
                text: text,
            });
        }
        None
    }

    fn get_annotation_with_asset_id(&self, asset_id: &str) -> Vec<String> {
        let sql =
            format!("SELECT * FROM ZAEANNOTATION WHERE ZANNOTATIONASSETID = '{}' AND ZANNOTATIONREPRESENTATIVETEXT != '';", asset_id);

        let db = self.annotation.clone().unwrap();
        let library = db.lock().unwrap();

        let mut statement = library.prepare(sql).unwrap();

        let mut highlight: Vec<String> = Vec::new();
        while let Ok(State::Row) = statement.next() {
            let text = statement
                .read::<String, _>("ZANNOTATIONREPRESENTATIVETEXT")
                .unwrap_or_default();
            highlight.push(text);
        }
        highlight
    }
}

// connect sqlite with sql's path
fn connect_sqlite(path: String) -> Result<Arc<Mutex<sqlite::Connection>>, sqlite::Error> {
    let home: String = dirs::home_dir().unwrap().to_str().unwrap().to_string();
    let mut dir = PathBuf::from(home);
    dir.push(path);
    let connection = sqlite::open(dir)?;

    Ok(Arc::new(Mutex::new(connection)))
}
