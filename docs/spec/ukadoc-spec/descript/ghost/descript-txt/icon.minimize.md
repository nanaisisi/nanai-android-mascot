# icon.minimize,ファイル名

- **規格**: [icon.minimize.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/icon.minimize.md)
- **検索語**: icon.minimize
- **対応状況**: ✅ 実装済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `icon.minimize` キーをパース・参照する実装が行われている。

## 実装箇所

- `src-tauri/src/tray.rs:89` `.and_then(|m| m.get("icon.minimize").or_else(|| m.get("icon")))`
- `src-tauri/src/tray.rs:120` `"🟢 トレイアイコン & ツールチップ更新 (icon.minimize.md 準拠): ghost={}, icon={:?}",`
