# バルーン仕様 100%カバー対応表（ファイルツリー完全対応）

- **規格**: [manual/balloon.md](https://github.com/ukatech/ukadoc-spec/blob/main/manual/balloon.md)
- **判定基準**: `docs/ukadoc-spec/manual/balloon.md` のファイルツリーに記載されている全ファイル・設定項目の実装および読込対応

## 対応表一覧

| ukadoc-spec 項目 / ファイル階層 | 当リポジトリの監査ファイル (`manual/balloon/`) | 対応状況 | 実装ソースコード (Rust / JS) |
| :--- | :--- | :---: | :--- |
| **`descript.txt`** (基本プロパティ) | [descript-txt.md](descript-txt.md) | ✅ 実装済 | [`balloon.rs`](../../../../src-tauri/src/commands/shell/balloon.rs), [`balloon-window.js`](../../../../ui/js/ghost/balloon-window.js), [`font.js`](../../../../ui/js/core/actions/balloon-descript/font.js) |
| **`*s.txt`** (サーフィス別設定) | [surface-options.md](surface-options.md) | ✅ 実装済 | [`balloon.rs`](../../../../src-tauri/src/commands/shell/balloon.rs) (`balloon_manifest`) |
| **`readme.txt`** (説明書) | [readme-txt.md](readme-txt.md) | ✅ 実装済 | [`balloon.rs`](../../../../src-tauri/src/commands/shell/balloon.rs) (`get_balloon_readme`) |
| **`balloons*.png`** (さくら背景) | [balloons-png.md](balloons-png.md) | ✅ 実装済 | [`balloon.rs`](../../../../src-tauri/src/commands/shell/balloon.rs), [`balloon-window.js`](../../../../ui/js/ghost/balloon-window.js) |
| **`balloons*.pna`** (さくらPNA) | [balloons-pna.md](balloons-pna.md) | ✅ 実装済 | [`surface-compositor.js`](../../../../ui/js/surface/surface-compositor.js), [`balloon-window.js`](../../../../ui/js/ghost/balloon-window.js) |
| **`balloonk*.png`** (相方背景) | [balloonk-png.md](balloonk-png.md) | ✅ 実装済 | [`balloon.rs`](../../../../src-tauri/src/commands/shell/balloon.rs), [`balloon-window.js`](../../../../ui/js/ghost/balloon-window.js) |
| **`balloonk*.pna`** (相方PNA) | [balloonk-pna.md](balloonk-pna.md) | ✅ 実装済 | [`surface-compositor.js`](../../../../ui/js/surface/surface-compositor.js), [`balloon-window.js`](../../../../ui/js/ghost/balloon-window.js) |
| **`balloonp*.png/.pna`** (マルチスコープ) | [balloonp.md](balloonp.md) | ✅ 実装済 | [`balloon.rs`](../../../../src-tauri/src/commands/shell/balloon.rs), [`balloon-window.js`](../../../../ui/js/ghost/balloon-window.js) |
| **`balloonc*.png/.pna`** (選択肢・入力) | [balloonc.md](balloonc.md) | ✅ 実装済 | [`balloon.rs`](../../../../src-tauri/src/commands/shell/balloon.rs), [`balloon-window.js`](../../../../ui/js/ghost/balloon-window.js) |
| **`online*.png`** (通信中アニメ) | [online-png.md](online-png.md) | ✅ 実装済 | [`balloon.rs`](../../../../src-tauri/src/commands/shell/balloon.rs), [`balloon-window.js`](../../../../ui/js/ghost/balloon-window.js) |
| **`arrow*.png`** (スクロール矢印) | [arrow-png.md](arrow-png.md) | ✅ 実装済 | [`balloon.rs`](../../../../src-tauri/src/commands/shell/balloon.rs), [`balloon-window.js`](../../../../ui/js/ghost/balloon-window.js) |
| **`arrows*.png / arrowk* / arrowp*`** (拡張矢印) | [arrows-png.md](arrows-png.md) | ✅ 実装済 | [`balloon.rs`](../../../../src-tauri/src/commands/shell/balloon.rs), [`balloon-window.js`](../../../../ui/js/ghost/balloon-window.js) |
| **`sstp.png`** (SSTPメッセージ) | [sstp-png.md](sstp-png.md) | ✅ 実装済 | [`balloon.rs`](../../../../src-tauri/src/commands/shell/balloon.rs), [`balloon-window.js`](../../../../ui/js/ghost/balloon-window.js) |
| **`thumbnail.png`** (サムネイル) | [thumbnail-png.md](thumbnail-png.md) | ✅ 実装済 | [`balloon.rs`](../../../../src-tauri/src/commands/shell/balloon.rs) (`scan_balloons`) |
| **`ok_down / cancel_down / mode_down`** (SSPボタン) | [ssp-buttons.md](ssp-buttons.md) | ✅ 実装済 | [`balloon.rs`](../../../../src-tauri/src/commands/shell/balloon.rs) |
| **`sstp_new*`** (新SSTP受信画像) | [sstp-new.md](sstp-new.md) | ✅ 実装済 | [`balloon.rs`](../../../../src-tauri/src/commands/shell/balloon.rs) |
| **`marker*`** (各種マーカー) | [marker-ssp.md](marker-ssp.md) | ✅ 実装済 | [`balloon.rs`](../../../../src-tauri/src/commands/shell/balloon.rs) |
| **`clickwait*`** (クリック待ち) | [clickwait-ssp.md](clickwait-ssp.md) | ✅ 実装済 | [`balloon.rs`](../../../../src-tauri/src/commands/shell/balloon.rs) |
| **`SSP 専用画像`** (拡張アセット) | [ssp-assets.md](ssp-assets.md) | ✅ 実装済 | [`balloon.rs`](../../../../src-tauri/src/commands/shell/balloon.rs) |
| **`FMO 連携`** (`balloon0`, `balloon1`) | [balloon-fmo.md](balloon-fmo.md) | ✅ 実装済 | [`fmo.rs`](../../../../src-tauri/src/fmo.rs) |
| **`9-slice 描画`** (`border-image`) | [balloon-9slice.md](balloon-9slice.md) | ✅ 実装済 | [`balloon-window.js`](../../../../ui/js/ghost/balloon-window.js) |
| **`validrect`** (有効テキスト領域) | [validrect.md](validrect.md) | ✅ 実装済 | [`balloon-window.js`](../../../../ui/js/ghost/balloon-window.js) |
| **`wordwrappoint.x`** (折り返し位置) | [wordwrappoint.md](wordwrappoint.md) | ✅ 実装済 | [`balloon-window.js`](../../../../ui/js/ghost/balloon-window.js) |
| **`dpi`** (推奨DPI設定) | [dpi.md](dpi.md) | ✅ 実装済 | [`balloon-window.js`](../../../../ui/js/ghost/balloon-window.js) |
| **`anchor.*`** (アンカー設定) | [anchor.md](anchor.md) | ✅ 実装済 | [`font.js`](../../../../ui/js/core/actions/balloon-descript/font.js) |
| **`cursor.*`** (選択肢カーソル) | [cursor.md](cursor.md) | ✅ 実装済 | [`font.js`](../../../../ui/js/core/actions/balloon-descript/font.js) |
| **`number.font.*`** (数値フォント) | [number-font.md](number-font.md) | ✅ 実装済 | [`font.js`](../../../../ui/js/core/actions/balloon-descript/font.js) |
| **`sstpmessage.font.*`** (SSTPフォント) | [sstp-message.md](sstp-message.md) | ✅ 実装済 | [`font.js`](../../../../ui/js/core/actions/balloon-descript/font.js) |
| **`disable.font`** (無効フォント) | [disable-font.md](disable-font.md) | ✅ 実装済 | [`font.js`](../../../../ui/js/core/actions/balloon-descript/font.js) |
| **`mousecursor.*`** (カーソル定義) | [mousecursor.md](mousecursor.md) | ✅ 実装済 | [`font.js`](../../../../ui/js/core/actions/balloon-descript/font.js) |
| **`communicatebox.*`** (入力欄) | [communicatebox.md](communicatebox.md) | ✅ 実装済 | [`font.js`](../../../../ui/js/core/actions/balloon-descript/font.js) |
| **`origin.*`** (原点オフセット) | [origin.md](origin.md) | ✅ 実装済 | [`font.js`](../../../../ui/js/core/actions/balloon-descript/font.js) |
| **`marker.*`** (各種マーカー) | [markers.md](markers.md) | ✅ 実装済 | [`font.js`](../../../../ui/js/core/actions/balloon-descript/font.js) |
| **拡張オプション** (`overlay_outside` 等) | [advanced-options.md](advanced-options.md) | ✅ 実装済 | [`font.js`](../../../../ui/js/core/actions/balloon-descript/font.js) |
