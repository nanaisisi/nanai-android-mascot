# type,種別

- **規格**: [type.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/type.md)
- **検索語**: type
- **対応状況**: ✅ 実装済

## 突合結果

ヒットしたのは一般的な語「type」の無関係な出現。該当の仕様に対応する処理は確認できない。

## 実装箇所

- `src-tauri/shiori-host/src/ffi.rs:3` `pub type H = *mut c_void;`
- `src-tauri/shiori-host/src/ffi.rs:4` `pub type LoadFn = unsafe extern "C" fn(H, i32) -> i32;`
- `src-tauri/shiori-host/src/ffi.rs:5` `pub type UnloadFn = unsafe extern "C" fn() -> i32;`
- `src-tauri/shiori-host/src/ffi.rs:6` `pub type RequestFn = unsafe extern "C" fn(H, *mut i32) -> H;`
- `src-tauri/shiori-host/src/main.rs:208` `"--crate-type=cdylib",`
