#![allow(non_snake_case)]
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = ["window", "__TAURI__", "core"])]
    async fn invoke(cmd: &str, args: JsValue) -> JsValue;
}

#[derive(Serialize, Deserialize)]
struct GreetArgs<'a> {
    name: &'a str,
}
<<<<<<< HEAD

pub fn App() -> Element {
<<<<<<< HEAD
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
=======
    // shell画像のテスト表示（sample/ghost/emily4/shell/master/surface0000.png）
    rsx! {
        link { rel: "stylesheet", href: "styles.css" }
        main { class: "container",
            h1 { "ゴーストキャラクター表示テスト" }
            div { style: "background: #222; padding: 2em; border-radius: 1em; width: fit-content; margin: 2em auto;",
                img {
                    src: "/sample/ghost/emily4/shell/master/surface0000.png",
                    style: "image-rendering: pixelated; background: transparent; width: 320px; height: 320px;",
>>>>>>> 8f44c9b (ok)
                }
            }
            p {
                "surface0000.png（キャラクター本体画像）が透過PNGとして正しく表示されていればOKです。"
            }
        }
    }
}
=======
>>>>>>> 9265ca1 (ok)
