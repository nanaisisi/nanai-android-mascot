# マーカーアイコン設定 (`clickwaitmarker`, `onlinemarker`, `sstpmarker`)

- **対応状況**: ✅ 実装済

クリック待ちマーカー、ネットワーク接続中マーカー、SSTP受信マーカーの位置・画像ファイル指定。


## 実装箇所

- `crates/ui/src/shiori/protocol/request.rs:104` `"x-sstp-passthru-markersend" => {}`
- `crates/ui/src/shiori/protocol/response/parse/core.rs:73` `"markersend" => res.marker_send = Some(value.to_string()),`
- `crates/ui/src/shiori/protocol/response/parse/core.rs:74` `"x-sstp-passthru-markersend" => {}`
- `crates/ui/src/shiori/tests/request_tests.rs:132` `let text = "GET SHIORI/3.0\r\nID: OnEvent\r\nReference2: val2\r\nReference0: val`
- `crates/ui/src/shiori/tests/request_tests.rs:146` `assert!(!req.passthru.contains_key("markersend"));`
