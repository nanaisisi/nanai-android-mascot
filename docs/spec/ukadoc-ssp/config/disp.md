# 設定：表示

- **規格**: [config/disp.md](https://ukatech.shillest.net/ukadoc-ssp/config/disp/) (ukadoc-ssp/config/disp.md)
- **対応状況**: ✅ 実装済

## 突合結果

シェル倍率、バルーン倍率、フォント指定、クリックスルー

## 実装箇所

- `src-tauri/build.rs:87` `build.flag(format!("--sysroot={}", sysroot.display()));`
- `src-tauri/src/commands/ext.rs:116` `// [readme,ファイル名], [readme.charset,文字コード], [charset,文字コード], [alwaysdisplay,数値], `
- `src-tauri/src/commands/ext.rs:120` `let _always_disp = map.get("alwaysdisplay");`
- `src-tauri/src/commands/install/archive.rs:237` `.map_err(|e| format!("Failed to extract '{}': {}", out_path.display(), e))?;`
- `src-tauri/src/commands/install/archive.rs:239` `.map_err(|e| format!("Failed writing file '{}': {}", out_path.display(), e))?;`
