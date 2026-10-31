# SHIORI Resource

- **規格**: [caption_shioriresource.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-resource/caption_shioriresource/)
- **検索語**: SHIORI
- **対応状況**: ✅ 対応済

## 突合結果

`crates/ui/src/shiori/protocol/` における SHIORI 3.0 / 2.x リクエスト・レスポンスパーサーおよびヘッダ管理モデルにより、各種 SHIORI Resource（`craftman`, `name`, `version`, 状態トークン等）の送受信・処理に対応。

## 実装箇所

- `src-tauri/build.rs:4` `// 32bit SHIORI ホスト (tauri_build が bundle resources を検証する前に用意する)`
- `src-tauri/build.rs:43` `"cargo:warning=shiori-host32 のビルドに失敗: `rustup target add i686-pc-windows-msvc` を`
- `src-tauri/shiori-host/src/main.rs:1` `//! 32bit SHIORI ホスト`
- `src-tauri/shiori-host/src/main.rs:39` `let resp = b"SHIORI/3.0 200 OK\r\n\r\n";`
- `src-tauri/shiori-host/src/main.rs:196` `let resp = b"SHIORI/3.0 200 OK\r\n\r\n";`
