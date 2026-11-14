# バルーン仕様 100%カバー対応表

- **規格**: [ukadoc-spec/manual/balloon.md](https://github.com/ukatech/ukadoc-spec/blob/main/manual/balloon.md)
- **判定基準**: このリポジトリで確認できるバルーンの読込・描画・プロパティ適用処理

## 対応表一覧

| ukadoc-spec 項目 / ファイル階層 | 当リポジトリの監査ファイル (`manual/balloon/`) | 対応状況 | 実装ソースコード (Rust / JS) |
| :--- | :--- | :---: | :--- |
| **`descript.txt`** (基本プロパティ) | [descript-txt.md](docs/spec/ukadoc-spec/manual/balloon/descript-txt.md) | ✅ 実装済 | [`balloon.rs`](src-tauri/src/commands/shell/balloon.rs), [`balloon-window.js`](ui/js/ghost/balloon-window.js), [`font.js`](ui/js/core/actions/balloon-descript/font.js) |
| **`*s.txt`** (サーフィス別設定) | [surface-options.md](docs/spec/ukadoc-spec/manual/balloon/surface-options.md) | ✅ 実装済 | [`balloon.rs`](src-tauri/src/commands/shell/balloon.rs) (`balloon_manifest`) |
| **`readme.txt`** (説明書) | [readme-txt.md](docs/spec/ukadoc-spec/manual/balloon/readme-txt.md) | ✅ 実装済 | [`balloon.rs`](src-tauri/src/commands/shell/balloon.rs) (`get_balloon_readme`) |
| **`balloons*.png`** (さくら背景) | [balloons-png.md](docs/spec/ukadoc-spec/manual/balloon/balloons-png.md) | ✅ 実装済 | [`balloon.rs`](src-tauri/src/commands/shell/balloon.rs), [`balloon-window.js`](ui/js/ghost/balloon-window.js) |
| **`balloons*.pna`** (さくらPNA) | [balloons-pna.md](docs/spec/ukadoc-spec/manual/balloon/balloons-pna.md) | ✅ 実装済 | [`surface-compositor.js`](ui/js/surface/surface-compositor.js), [`balloon-window.js`](ui/js/ghost/balloon-window.js) |
| **`balloonk*.png`** (相方背景) | [balloonk-png.md](docs/spec/ukadoc-spec/manual/balloon/balloonk-png.md) | ✅ 実装済 | [`balloon.rs`](src-tauri/src/commands/shell/balloon.rs), [`balloon-window.js`](ui/js/ghost/balloon-window.js) |
| **`balloonk*.pna`** (相方PNA) | [balloonk-pna.md](docs/spec/ukadoc-spec/manual/balloon/balloonk-pna.md) | ✅ 実装済 | [`surface-compositor.js`](ui/js/surface/surface-compositor.js), [`balloon-window.js`](ui/js/ghost/balloon-window.js) |
| **`balloonp*.png/.pna`** (マルチスコープ) | [balloonp.md](docs/spec/ukadoc-spec/manual/balloon/balloonp.md) | ✅ 実装済 | [`balloon.rs`](src-tauri/src/commands/shell/balloon.rs), [`balloon-window.js`](ui/js/ghost/balloon-window.js) |
| **`balloonc*.png/.pna`** (選択肢・入力) | [balloonc.md](docs/spec/ukadoc-spec/manual/balloon/balloonc.md) | ✅ 実装済 | [`balloon.rs`](src-tauri/src/commands/shell/balloon.rs), [`balloon-window.js`](ui/js/ghost/balloon-window.js) |
| **`online*.png`** (通信中アニメ) | [online-png.md](docs/spec/ukadoc-spec/manual/balloon/online-png.md) | ✅ 実装済 | [`balloon.rs`](src-tauri/src/commands/shell/balloon.rs), [`balloon-window.js`](ui/js/ghost/balloon-window.js) |
| **`arrow*.png`** (スクロール矢印) | [arrow-png.md](docs/spec/ukadoc-spec/manual/balloon/arrow-png.md) | ✅ 実装済 | [`balloon.rs`](src-tauri/src/commands/shell/balloon.rs), [`balloon-window.js`](ui/js/ghost/balloon-window.js) |
| **`sstp.png`** (SSTPメッセージ) | [sstp-png.md](docs/spec/ukadoc-spec/manual/balloon/sstp-png.md) | ✅ 実装済 | [`balloon.rs`](src-tauri/src/commands/shell/balloon.rs), [`balloon-window.js`](ui/js/ghost/balloon-window.js) |
| **`thumbnail.png`** (サムネイル) | [thumbnail-png.md](docs/spec/ukadoc-spec/manual/balloon/thumbnail-png.md) | ✅ 実装済 | [`balloon.rs`](src-tauri/src/commands/shell/balloon.rs) (`scan_balloons`) |
| **`SSP 専用画像`** (拡張アセット) | [ssp-assets.md](docs/spec/ukadoc-spec/manual/balloon/ssp-assets.md) | ✅ 実装済 | [`balloon.rs`](src-tauri/src/commands/shell/balloon.rs) |
| **`FMO 連携`** (`balloon0`, `balloon1`) | [balloon-fmo.md](docs/spec/ukadoc-spec/manual/balloon/balloon-fmo.md) | ✅ 実装済 | [`fmo.rs`](src-tauri/src/fmo.rs) |
| **`9-slice 描画`** (`border-image`) | [balloon-9slice.md](docs/spec/ukadoc-spec/manual/balloon/balloon-9slice.md) | ✅ 実装済 | [`balloon-window.js`](ui/js/ghost/balloon-window.js) |
| **`validrect`** (有効テキスト領域) | [validrect.md](docs/spec/ukadoc-spec/manual/balloon/validrect.md) | ✅ 実装済 | [`balloon-window.js`](ui/js/ghost/balloon-window.js) |
| **`wordwrappoint.x`** (折り返し位置) | [wordwrappoint.md](docs/spec/ukadoc-spec/manual/balloon/wordwrappoint.md) | ✅ 実装済 | [`balloon-window.js`](ui/js/ghost/balloon-window.js) |
| **`dpi`** (推奨DPI設定) | [dpi.md](docs/spec/ukadoc-spec/manual/balloon/dpi.md) | ✅ 実装済 | [`balloon-window.js`](ui/js/ghost/balloon-window.js) |
| **`anchor.*`** (アンカー設定) | [anchor.md](docs/spec/ukadoc-spec/manual/balloon/anchor.md) | ✅ 実装済 | [`font.js`](ui/js/core/actions/balloon-descript/font.js) |
| **`cursor.*`** (選択肢カーソル) | [cursor.md](docs/spec/ukadoc-spec/manual/balloon/cursor.md) | ✅ 実装済 | [`font.js`](ui/js/core/actions/balloon-descript/font.js) |
| **`number.font.*`** (数値フォント) | [number-font.md](docs/spec/ukadoc-spec/manual/balloon/number-font.md) | ✅ 実装済 | [`font.js`](ui/js/core/actions/balloon-descript/font.js) |
| **`sstpmessage.font.*`** (SSTPフォント) | [sstp-message.md](docs/spec/ukadoc-spec/manual/balloon/sstp-message.md) | ✅ 実装済 | [`font.js`](ui/js/core/actions/balloon-descript/font.js) |
| **`disable.font`** (無効フォント) | [disable-font.md](docs/spec/ukadoc-spec/manual/balloon/disable-font.md) | ✅ 実装済 | [`font.js`](ui/js/core/actions/balloon-descript/font.js) |
| **`mousecursor.*`** (カーソル定義) | [mousecursor.md](docs/spec/ukadoc-spec/manual/balloon/mousecursor.md) | ✅ 実装済 | [`font.js`](ui/js/core/actions/balloon-descript/font.js) |
| **`communicatebox.*`** (入力欄) | [communicatebox.md](docs/spec/ukadoc-spec/manual/balloon/communicatebox.md) | ✅ 実装済 | [`font.js`](ui/js/core/actions/balloon-descript/font.js) |
| **`origin.*`** (原点オフセット) | [origin.md](docs/spec/ukadoc-spec/manual/balloon/origin.md) | ✅ 実装済 | [`font.js`](ui/js/core/actions/balloon-descript/font.js) |
| **`marker.*`** (各種マーカー) | [markers.md](docs/spec/ukadoc-spec/manual/balloon/markers.md) | ✅ 実装済 | [`font.js`](ui/js/core/actions/balloon-descript/font.js) |
| **拡張オプション** (`overlay_outside` 等) | [advanced-options.md](docs/spec/ukadoc-spec/manual/balloon/advanced-options.md) | ✅ 実装済 | [`font.js`](ui/js/core/actions/balloon-descript/font.js) |
