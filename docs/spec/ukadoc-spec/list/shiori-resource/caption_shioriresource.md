# SHIORI Resource

- **規格**: [caption_shioriresource.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-resource/caption_shioriresource/)
- **検索語**: SHIORI
- **対応状況**: ❌ 未実装(誤検出)

## 突合結果

ヒットしたのは一般的な語「SHIORI」の無関係な出現。該当の仕様に対応する処理は確認できない。

## 実装箇所

- `src-tauri/build.rs:4` `// 32bit SHIORI ホスト (tauri_build が bundle resources を検証する前に用意する)`
- `src-tauri/build.rs:43` `"cargo:warning=shiori-host32 のビルドに失敗: `rustup target add i686-pc-windows-msvc` を`
- `src-tauri/src/commands/window/lifecycle.rs:7` `Ok("SHIORI統合テスト成功!".to_string())`
- `src-tauri/src/commands/shiori/protocol.rs:26` `/// そのまま SHIORI DLL へ渡す。`
- `src-tauri/src/commands/shiori/protocol.rs:39` `// デフォルト/メインのネイティブSHIORIエンジンへ委譲`
