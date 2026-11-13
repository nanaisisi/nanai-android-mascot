# 設定：IM

- **規格**: [config/im.md](https://ukatech.shillest.net/ukadoc-ssp/config/im/) (ukadoc-ssp/config/im.md)
- **対応状況**: ⚠️ 一部対応

## 突合結果

SSTP 待ち受けポート（9801/9821）設定

## 実装箇所

- `src-tauri/src/commands/window/lifecycle.rs:43` `.args(["/f", "/im", "shiori-host32.exe"])`
