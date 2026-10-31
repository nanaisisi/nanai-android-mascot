# keroname

- **規格**: [keroname.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/general-property/keroname/)
- **検索語**: keroname
- **対応状況**: ❌ 検出なし

## 突合結果

実装コード内に「keroname」を確認。

## 実装箇所

- `src-tauri/src/shiori/fmo.rs:13` `pub keroname: String,`
- `src-tauri/src/shiori/fmo.rs:34` `content.push_str(&format!("{}.keroname\x01{}\r\n", prefix, rec.keroname));`
- `src-tauri/src/shiori/fmo.rs:68` `keroname: "Kero".to_string(),`
- `ui/js/ghost/shiori-notify.js:11` `* - installedghostname / installedsakuraname / installedkeroname`
- `ui/js/ghost/shiori-notify.js:66` `await this.sendShioriNotify("installedkeroname", keroNames);`
