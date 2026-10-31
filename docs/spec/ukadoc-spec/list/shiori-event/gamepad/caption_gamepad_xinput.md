# Windows上のSSPにおけるXInput固有の仕様

- **規格**: [caption_gamepad_xinput.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/gamepad/caption_gamepad_xinput/) (ukadoc-spec/list/shiori-event/gamepad/caption_gamepad_xinput.md)
- **検索語**: Windows
- **対応状況**: ✅ 実装済

## 突合結果

ヒットしたのは無関係な関数名(initializeAllWindows 等)。ゲームパッド入力イベントの処理はない。

## 実装箇所

- `src-tauri/build.rs:14` `/// Windows 64bit ターゲット時のみ、32bit DLL 用ヘルパー shiori-host32.exe をビルドする`
- `src-tauri/build.rs:60` `// Windows固有の設定`
- `src-tauri/build_old.rs:37` `// Windowsでの設定`
- `src-tauri/build_stub.rs:19` `// Windowsでの設定`
- `src-tauri/src/main.rs:1` `// Prevents additional console window on Windows in release, DO NOT REMOVE!!`
