# *（任意のエイリアス名）

- **規格**: [star.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-alias-brace/star/) (ukadoc-spec/descript/shell-surfaces/surface-alias-brace/star.md)
- **検索語**: *
- **対応状況**: ⚠️ 一部対応

## 突合結果

`ui/js/surface/surface-load.js` において、`surfaces.txt` 内の任意のエイリアス定義キーと配列解決を行う実装が行われている。

## 実装箇所

- `src-tauri/capabilities/default.json:3` `"windows": ["*"],`
- `src-tauri/shiori-host/src/ffi.rs:3` `pub type H = *mut c_void;`
- `src-tauri/shiori-host/src/ffi.rs:6` `pub type RequestFn = unsafe extern "C" fn(H, *mut i32) -> H;`
- `src-tauri/shiori-host/src/ffi.rs:13` `pub fn SetDllDirectoryW(lpPathName: *const u16) -> i32;`
- `src-tauri/shiori-host/src/ffi.rs:18` `fn malloc(size: usize) -> *mut c_void;`
