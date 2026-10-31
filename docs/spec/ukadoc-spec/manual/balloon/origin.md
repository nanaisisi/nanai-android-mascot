# 原点オフセット設定 (`origin.*`)

- **対応状況**: ✅ 実装済

`origin.x`, `origin.y` を用いたバルーン描画原点オフセット調整。


## 実装箇所

- `src-tauri/src/sstp.rs:16` `pub security_origin: Option<String>,`
- `src-tauri/src/sstp.rs:86` `security_origin: None,`
- `src-tauri/src/sstp.rs:181` `security_origin: None,`
- `crates/ui/src/descript/parser.rs:70` `/// バルーン用原点座標 (origin.x, origin.y)`
- `crates/ui/src/descript/parser.rs:71` `pub fn origin(&self) -> (Option<i32>, Option<i32>) {`
