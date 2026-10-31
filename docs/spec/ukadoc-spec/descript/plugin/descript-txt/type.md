# type,種別

- **規格**: [type.md](https://ukatech.shillest.net/ukadoc-spec/descript/plugin/descript-txt/) (ukadoc-spec/descript/plugin/descript-txt/type.md)
- **検索語**: type
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/commands/ext.rs` において `type` キーをパースし、`plugin` 種別を透過判別する実装が行われている。

## 実装箇所

- `src-tauri/shiori-host/src/ffi.rs:3` `pub type H = *mut c_void;`
- `src-tauri/shiori-host/src/ffi.rs:4` `pub type LoadFn = unsafe extern "C" fn(H, i32) -> i32;`
- `src-tauri/shiori-host/src/ffi.rs:5` `pub type UnloadFn = unsafe extern "C" fn() -> i32;`
- `src-tauri/shiori-host/src/ffi.rs:6` `pub type RequestFn = unsafe extern "C" fn(H, *mut i32) -> H;`
- `src-tauri/shiori-host/src/main.rs:208` `"--crate-type=cdylib",`
