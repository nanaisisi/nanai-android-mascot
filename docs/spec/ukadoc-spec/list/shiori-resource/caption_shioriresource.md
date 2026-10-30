# SHIORI Resource

- **規格**: [caption_shioriresource.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-resource/caption_shioriresource/)
- **検索語**: SHIORI
- **対応状況**: ❌ 未実装(誤検出)

## 突合結果

ヒットしたのは一般的な語「SHIORI」の無関係な出現。該当の仕様に対応する処理は確認できない。

## 実装箇所

- `src-tauri/build.rs:4` `// 32bit SHIORI ホスト (tauri_build が bundle resources を検証する前に用意する)`
- `src-tauri/build.rs:43` `"cargo:warning=shiori-host32 のビルドに失敗: `rustup target add i686-pc-windows-msvc` を`
- `src-tauri/shiori-host/src/main.rs:1` `//! 32bit SHIORI ホスト`
- `src-tauri/shiori-host/src/main.rs:150` `let resp = b"SHIORI/3.0 200 OK\r\n\r\n";`
- `src-tauri/shiori-host/src/main.rs:251` `// テスト内で 64bit ミニマル SHIORI DLL を一時生成して load_and_run を検証する`
