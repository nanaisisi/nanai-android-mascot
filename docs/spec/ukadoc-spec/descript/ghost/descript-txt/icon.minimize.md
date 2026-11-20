# icon.minimize,ファイル名

- **規格**: [icon.minimize.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/icon.minimize.md)
- **検索語**: icon.minimize
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/tray.rs` においてゴーストの `descript.txt` 内の `icon.minimize` キー（最小化/トレイアイコン）をパースし、`icon` キーとのフォールバック構造を含めてシステムトレイアイコンへ反映する実装が完全に行われている。

## 実装箇所

- `src-tauri/src/tray/updater.rs:29` `.and_then(|m| m.get("icon.minimize").or_else(|| m.get("icon")))`
- `src-tauri/src/tray/updater.rs:60` `"🟢 トレイアイコン & ツールチップ更新 (icon.minimize.md 準拠): ghost={}, icon={:?}",`
