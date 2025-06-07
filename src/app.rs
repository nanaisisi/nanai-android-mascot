#![allow(non_snake_case)]
use serde::{Deserialize, Serialize};
<<<<<<< HEAD
=======
use std::fs;
use std::path::PathBuf;
use wasm_bindgen::prelude::*;
>>>>>>> 826abc3 (ok)

#[derive(Clone, Debug)]
struct FileContent {
    path: String,
    content: Option<String>,
    error: Option<String>,
}

#[derive(Clone, Debug, Default)]
struct AppState {
    files: Vec<FileContent>,
    current_file: Option<usize>,
    recent_files: Vec<String>,
}

#[derive(Serialize, Deserialize)]
struct OpenFileResult {
    content: Option<String>,
    error: Option<String>,
}
<<<<<<< HEAD
<<<<<<< HEAD

pub fn App() -> Element {
    let state = use_signal(|| AppState::default());
    let loading = use_signal(|| false);

    let current_file_idx = state.read().current_file;
    let file = current_file_idx.map(|idx| state.read().files[idx].clone());

    return rsx! {
        div { class: "container",
            header { class: "app-header",
                h1 { "Shift-JIS File Viewer" }
            }
<<<<<<< HEAD
=======
        link { rel: "stylesheet", href: "styles.css" }
        // ウィンドウ移動用のドラッグエリアdivを追加
        div {
            style: "position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:9999;-webkit-app-region:drag;pointer-events:auto;",
            // ここに何も描画しないことで、全体をドラッグ可能にする
        }
        main {
            class: "container",
            h1 { "Welcome to Tauri + Dioxus" }
>>>>>>> 44f48a4 (ok)

            div { class: "app-content",
                div { class: "sidebar",
                    h3 { "最近開いたファイル" }
                    if loading.read().clone() {
                        p { "読み込み中..." }
                    } else {
                        ul {
                            state.read().recent_files.iter().map(|path| {
                                let path_clone = path.clone();
                                rsx! {
                                    li {
                                        key: "{path}",
                                        button {
                                            onclick: move |_| {
                                                open_file(path_clone.clone(), state.clone());
                                            },
                                            "{extract_filename(&path_clone)}"
                                        }
                                    }
                                }
                            })
                        }
                    }

                    button {
                        onclick: move |_| {
                            open_file_dialog(state.clone());
                        },
                        "ファイルを開く"
                    }
                }

                div { class: "content",
                    if state.read().current_file.is_some() {
                        let idx = state.read().current_file.unwrap();
                        let file = &state.read().files[idx];
                        rsx! {
                            div { class: "file-view",
                                h2 { "{extract_filename(&file.path)}" }

                                if let Some(error) = &file.error {
                                    div { class: "error",
                                        "エラー: {error}"
                                    }
                                } else if let Some(content) = &file.content {
                                    pre { class: "file-content",
                                        "{content}"
                                    }
=======
            link { rel: "stylesheet", href: "styles.css" }
            // ウィンドウ移動用のドラッグエリアdivを追加
            div { style: "position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:9999;-webkit-app-region:drag;pointer-events:auto;" }
            main { class: "container",
                h1 { "Welcome to Tauri + Dioxus" }
                div { class: "app-content",
                    div { class: "sidebar",
                        h3 { "最近開いたファイル" }
                        if loading.read().clone() {
                            p { "読み込み中..." }
                        } else {
                            ul {
                                if state.read().recent_files.is_empty() {
                                    li { "最近開いたファイルはありません" }
>>>>>>> 8d7ef34 (rename fin)
                                } else {
                                    {
                                        state
                                            .read()
                                            .recent_files
                                            .iter()
                                            .map(|path| {
                                                let path_clone = path.clone();
                                                rsx! {
                                                    li { key: "{path}",
                                                        button { "{extract_filename(&path_clone)}" }
                                                    }
                                                }
                                            })
                                    }
                                }
                            }
                        }
                        button {
                            onclick: move |_| {
                                open_file_dialog(state.clone());
                            },
                            "ファイルを開く"
                        }
                    }
                    div { class: "content",
                        if let Some(file) = file {
                            if let Some(error) = &file.error {
                                div { class: "file-view",
                                    h2 { "{extract_filename(&file.path)}" }
                                    div { class: "error", "エラー: {error}" }
                                }
                            } else if let Some(content) = &file.content {
                                div { class: "file-view",
                                    h2 { "{extract_filename(&file.path)}" }
                                    pre { class: "file-content", "{content}" }
                                }
                            } else {
                                div { class: "file-view",
                                    h2 { "{extract_filename(&file.path)}" }
                                    p { "ファイルを読み込み中..." }
                                }
                            }
                        } else {
                            div { class: "welcome",
                                h2 { "Shift-JIS File Viewerへようこそ" }
                                p {
                                    "サイドバーからファイルを選択するか、「ファイルを開く」ボタンをクリックしてください。"
                                }
                            }
                        }
                    }
                }
            }
        }
    };
}

// ファイル名のみを抽出する関数
pub fn extract_filename(path: &str) -> String {
    std::path::Path::new(path)
        .file_name()
        .and_then(|name| name.to_str())
        .unwrap_or(path)
        .to_string()
}

// ファイル選択ダイアログを開く関数
#[allow(unused)]
pub async fn open_file_dialog(_state: Signal<AppState>) {
    // Webビルドでは未実装
}

// ファイルを開く関数
#[allow(unused)]
pub fn open_file(_path: String, _state: Signal<AppState>) {
    // Webビルドでは未実装
}
=======
>>>>>>> 9265ca1 (ok)
=======

/// ghostディレクトリのパスを取得
fn get_ghost_dir() -> PathBuf {
    // プロジェクトルート直下のghostディレクトリ
    PathBuf::from("ghost")
}

/// ghostディレクトリ直下のディレクトリ一覧を取得
fn get_ghost_dir_list() -> Vec<String> {
    let ghost_dir = get_ghost_dir();
    let mut list = Vec::new();
    if let Ok(entries) = fs::read_dir(&ghost_dir) {
        for entry in entries.flatten() {
            if entry.path().is_dir() {
                if let Some(name) = entry.file_name().to_str() {
                    list.push(name.to_string());
                }
            }
        }
    }
    list
}
>>>>>>> 2adf710 (Part)
