# type,種別

- **規格**: [type.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/install-txt/) (ukadoc-spec/descript/install/install-txt/type.md)
- **検索語**: type
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/commands/install/archive.rs` において `type` キー（`ghost`, `balloon`, `shell`, `plugin`, `headline`, `supplement`, `package`）をパースし、インストールターゲット種別を判定・振り分ける実装が行われている。

## 実装箇所

- `src-tauri/shiori-host/src/main.rs:12` `type H = *mut c_void;`
- `src-tauri/shiori-host/src/main.rs:13` `type LoadFn = unsafe extern "C" fn(H, i32) -> i32;`
- `src-tauri/shiori-host/src/main.rs:14` `type UnloadFn = unsafe extern "C" fn() -> i32;`
- `src-tauri/shiori-host/src/main.rs:15` `type RequestFn = unsafe extern "C" fn(H, *mut i32) -> H;`
- `src-tauri/shiori-host/src/main.rs:288` `"--crate-type=cdylib",`
