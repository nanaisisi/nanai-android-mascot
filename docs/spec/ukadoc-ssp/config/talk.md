# 設定：喋り/バルーン

- **規格**: [config/talk.md](https://ukatech.shillest.net/ukadoc-ssp/config/talk/) (ukadoc-ssp/config/talk.md)
- **対応状況**: ✅ 実装済

## 突合結果

自動トーク頻度設定、バルーン消去待ち時間

## 実装箇所

- `src-tauri/src/commands/ext.rs:47` `// [readme,ファイル名], [readme.charset,文字コード], [charset,文字コード], [secondchangeinterva`
- `src-tauri/src/commands/ext.rs:52` `let _other_talk = map.get("otherghosttalk");`
- `src-tauri/src/commands/window/menu_native.rs:64` `.text("talk", "💬 もう一度話す (A)")`
- `crates/ui/src/animation/tests.rs:69` `for v in ["never", "bind", "talk", "starttalk", "endtalk", r"\e"] {`
- `crates/ui/src/shiori/protocol/request.rs:224` `assert!(built.contains("Status: talking"));`
