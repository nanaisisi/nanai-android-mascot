# バルーン (manual/balloon.md)

- **規格**: [manual/balloon.md](https://github.com/ukatech/ukadoc-spec/blob/main/manual/balloon.md)
- **対応状況**: ✅ 対応済 (実ファイルハンドリング実装済)

## 実ファイルハンドリング突合結果

- **descript.txt & 構成ファイル**: `balloon_descript_map` および `Descript::parse` により `descript.txt` の各種プロパティ（文字色、フォント、余白等）をパース。
- **背景画像 (`balloons0.png`, `balloonk0.png`, `balloonp*`)**: `load_balloon_image` コマンドにより VFS 経由で実ファイルを Base64 ストリームとして読み込み、CSS 9-slice (`border-image`) として描画。
- **PNA マスクとオプション (`*.pna`, `*s.txt`)**: アーカイブ内の PNA アルファチャンネルマスクおよび個別設定ファイル (`*s.txt`) の読み込み・適用経路に対応。


## 実装箇所

- `src-tauri/src/fmo.rs:13` `pub balloon0: String,`
- `src-tauri/src/fmo.rs:14` `pub balloon1: String,`
- `src-tauri/src/fmo.rs:43` `balloon0: "".to_string(),`
- `src-tauri/src/fmo.rs:44` `balloon1: "".to_string(),`
- `src-tauri/src/lib.rs:101` `commands::shell::scan_balloons,`
