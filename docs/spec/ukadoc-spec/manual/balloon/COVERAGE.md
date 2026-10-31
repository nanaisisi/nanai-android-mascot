# バルーン仕様 100%カバー対応表（ファイルツリー完全同期）

- **規格参照元**: [`docs/ukadoc-spec/manual/balloon.md`](../../../../ukadoc-spec/manual/balloon.md)
- **判定基準**: `docs/ukadoc-spec/manual/balloon.md` のファイルツリー（全35項目）に記載されているすべてのファイル・設定項目の実装および対応状況

## 対応表一覧

| ファイルツリー項目 (`manual/balloon.md`) | 当リポジトリの監査ファイル (`manual/balloon/`) | 対応状況 | 実装ソースコード (Rust / JS) |
| :--- | :--- | :---: | :--- |
| **`descript.txt`** | [descript-txt.md](descript-txt.md) | ✅ 実装済 | [`balloon.rs`](../../../../src-tauri/src/commands/shell/balloon.rs), [`balloon-window.js`](../../../../ui/js/ghost/balloon-window.js), [`font.js`](../../../../ui/js/core/actions/balloon-descript/font.js) |
| **`readme.txt`** | [readme-txt.md](readme-txt.md) | ✅ 実装済 | [`balloon.rs`](../../../../src-tauri/src/commands/shell/balloon.rs) (`get_balloon_readme`) |
| **`balloons*.png`** | [balloons-png.md](balloons-png.md) | ✅ 実装済 | [`balloon.rs`](../../../../src-tauri/src/commands/shell/balloon.rs), [`balloon-window.js`](../../../../ui/js/ghost/balloon-window.js) |
| **`balloons*.pna`** | [balloons-pna.md](balloons-pna.md) | ✅ 実装済 | [`surface-compositor.js`](../../../../ui/js/surface/surface-compositor.js), [`balloon-window.js`](../../../../ui/js/ghost/balloon-window.js) |
| **`balloons*s.txt`** | [surface-options.md](surface-options.md) | ✅ 実装済 | [`balloon.rs`](../../../../src-tauri/src/commands/shell/balloon.rs) (`balloon_manifest`) |
| **`balloonk*.png`** | [balloonk-png.md](balloonk-png.md) | ✅ 実装済 | [`balloon.rs`](../../../../src-tauri/src/commands/shell/balloon.rs), [`balloon-window.js`](../../../../ui/js/ghost/balloon-window.js) |
| **`balloonk*.pna`** | [balloonk-pna.md](balloonk-pna.md) | ✅ 実装済 | [`surface-compositor.js`](../../../../ui/js/surface/surface-compositor.js), [`balloon-window.js`](../../../../ui/js/ghost/balloon-window.js) |
| **`balloonk*s.txt`** | [surface-options.md](surface-options.md) | ✅ 実装済 | [`balloon.rs`](../../../../src-tauri/src/commands/shell/balloon.rs) (`balloon_manifest`) |
| **`balloonp*def*.png`** | [balloonp.md](balloonp.md) | ✅ 実装済 | [`balloon.rs`](../../../../src-tauri/src/commands/shell/balloon.rs), [`balloon-window.js`](../../../../ui/js/ghost/balloon-window.js) |
| **`balloonp*def*.pna`** | [balloonp.md](balloonp.md) | ✅ 実装済 | [`surface-compositor.js`](../../../../ui/js/surface/surface-compositor.js), [`balloon-window.js`](../../../../ui/js/ghost/balloon-window.js) |
| **`balloonp*def*s.txt`** | [surface-options.md](surface-options.md) | ✅ 実装済 | [`balloon.rs`](../../../../src-tauri/src/commands/shell/balloon.rs) (`balloon_manifest`) |
| **`balloonc*.png`** | [balloonc.md](balloonc.md) | ✅ 実装済 | [`balloon.rs`](../../../../src-tauri/src/commands/shell/balloon.rs), [`balloon-window.js`](../../../../ui/js/ghost/balloon-window.js) |
| **`balloonc*.pna`** | [balloonc.md](balloonc.md) | ✅ 実装済 | [`surface-compositor.js`](../../../../ui/js/surface/surface-compositor.js), [`balloon-window.js`](../../../../ui/js/ghost/balloon-window.js) |
| **`balloonc*s.txt`** | [surface-options.md](surface-options.md) | ✅ 実装済 | [`balloon.rs`](../../../../src-tauri/src/commands/shell/balloon.rs) (`balloon_manifest`) |
| **`online*.png`** | [online-png.md](online-png.md) | ✅ 実装済 | [`balloon.rs`](../../../../src-tauri/src/commands/shell/balloon.rs), [`balloon-window.js`](../../../../ui/js/ghost/balloon-window.js) |
| **`sstp.png`** | [sstp-png.md](sstp-png.md) | ✅ 実装済 | [`balloon.rs`](../../../../src-tauri/src/commands/shell/balloon.rs), [`balloon-window.js`](../../../../ui/js/ghost/balloon-window.js) |
| **`arrow0.png / arrow1.png`** | [arrow-png.md](arrow-png.md) | ✅ 実装済 | [`balloon.rs`](../../../../src-tauri/src/commands/shell/balloon.rs), [`balloon-window.js`](../../../../ui/js/ghost/balloon-window.js) |
| **`arrows*.png`** | [arrows-png.md](arrows-png.md) | ✅ 実装済 | [`balloon.rs`](../../../../src-tauri/src/commands/shell/balloon.rs), [`balloon-window.js`](../../../../ui/js/ghost/balloon-window.js) |
| **`arrowk*.png`** | [arrows-png.md](arrows-png.md) | ✅ 実装済 | [`balloon.rs`](../../../../src-tauri/src/commands/shell/balloon.rs), [`balloon-window.js`](../../../../ui/js/ghost/balloon-window.js) |
| **`arrowp*def*.png`** | [arrows-png.md](arrows-png.md) | ✅ 実装済 | [`balloon.rs`](../../../../src-tauri/src/commands/shell/balloon.rs), [`balloon-window.js`](../../../../ui/js/ghost/balloon-window.js) |
| **`thumbnail.png`** | [thumbnail-png.md](thumbnail-png.md) | ✅ 実装済 | [`balloon.rs`](../../../../src-tauri/src/commands/shell/balloon.rs) (`scan_balloons`) |
| **`ok_down.png/ok_up.png`** | [ssp-buttons.md](ssp-buttons.md) | ✅ 実装済 | [`balloon.rs`](../../../../src-tauri/src/commands/shell/balloon.rs) |
| **`cancel_down.png/cancel_up.png`** | [ssp-buttons.md](ssp-buttons.md) | ✅ 実装済 | [`balloon.rs`](../../../../src-tauri/src/commands/shell/balloon.rs) |
| **`mode_down.png/mode_up.png`** | [ssp-buttons.md](ssp-buttons.md) | ✅ 実装済 | [`balloon.rs`](../../../../src-tauri/src/commands/shell/balloon.rs) |
| **`sstp_new.png`** | [sstp-new.md](sstp-new.md) | ✅ 実装済 | [`balloon.rs`](../../../../src-tauri/src/commands/shell/balloon.rs) |
| **`sstp_newk.png`** | [sstp-new.md](sstp-new.md) | ✅ 実装済 | [`balloon.rs`](../../../../src-tauri/src/commands/shell/balloon.rs) |
| **`sstp_newp*def.png`** | [sstp-new.md](sstp-new.md) | ✅ 実装済 | [`balloon.rs`](../../../../src-tauri/src/commands/shell/balloon.rs) |
| **`marker.png`** | [marker-ssp.md](marker-ssp.md) | ✅ 実装済 | [`balloon.rs`](../../../../src-tauri/src/commands/shell/balloon.rs) |
| **`markers.png`** | [marker-ssp.md](marker-ssp.md) | ✅ 実装済 | [`balloon.rs`](../../../../src-tauri/src/commands/shell/balloon.rs) |
| **`markerk.png`** | [marker-ssp.md](marker-ssp.md) | ✅ 実装済 | [`balloon.rs`](../../../../src-tauri/src/commands/shell/balloon.rs) |
| **`markerp*def.png`** | [marker-ssp.md](marker-ssp.md) | ✅ 実装済 | [`balloon.rs`](../../../../src-tauri/src/commands/shell/balloon.rs) |
| **`clickwait.png`** | [clickwait-ssp.md](clickwait-ssp.md) | ✅ 実装済 | [`balloon.rs`](../../../../src-tauri/src/commands/shell/balloon.rs) |
| **`clickwaits.png`** | [clickwait-ssp.md](clickwait-ssp.md) | ✅ 実装済 | [`balloon.rs`](../../../../src-tauri/src/commands/shell/balloon.rs) |
| **`clickwaitk.png`** | [clickwait-ssp.md](clickwait-ssp.md) | ✅ 実装済 | [`balloon.rs`](../../../../src-tauri/src/commands/shell/balloon.rs) |
| **`clickwaitp*def.png`** | [clickwait-ssp.md](clickwait-ssp.md) | ✅ 実装済 | [`balloon.rs`](../../../../src-tauri/src/commands/shell/balloon.rs) |
