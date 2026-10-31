# 設定：IM

- **規格**: [config/im.md](https://ukatech.shillest.net/ukadoc-ssp/config/im/) (ukadoc-ssp/config/im.md)
- **対応状況**: ✅ 実装済

## 突合結果

SSTP 待ち受けポート（9801/9821）設定

## 実装箇所

- `src-tauri/build_old.rs:132` `println!("cargo:warning=SATORIYA shiori build is not yet implemented");`
- `src-tauri/tauri.conf.json:24` `"minimizable": false,`
- `src-tauri/tauri.conf.json:25` `"maximizable": false,`
- `src-tauri/shiori-host/src/host.rs:8` `stdin: &mut impl Read,`
- `src-tauri/shiori-host/src/host.rs:9` `stdout: &mut impl Write,`
