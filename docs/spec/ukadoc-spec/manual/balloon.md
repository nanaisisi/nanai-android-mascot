# バルーン (manual/balloon.md)

- **規格**: [manual/balloon.md](https://github.com/ukatech/ukadoc-spec/blob/main/manual/balloon.md)
- **対応状況**: ✅ 対応済 (実ファイルハンドリング実装済)

## 実ファイルハンドリング突合結果

- **descript.txt & 構成ファイル**: `balloon_descript_map` および `Descript::parse` により `descript.txt` の各種プロパティ（文字色、フォント、余白 `validrect`、折り返し `wordwrappoint.x` 等）をパースし、`applyFontProperties` を通じて完全反映。
- **背景画像 (`balloons0.png`, `balloonk0.png`, `balloonp*`, `balloonc*`, `arrow*`, `sstp`, `online*`, `markers.png`, `markerk.png`, `marker.png`)**: `load_balloon_image` コマンドにより VFS 経由で実ファイルを読み込み、CSS 9-slice (`border-image`) として動的描画。
- **PNA マスクとオプション (`*.pna`, `*s.txt`)**: アーカイブ内の PNA アルファチャンネルマスク（`processChromaKey` 連携）およびサーフィス別個別設定ファイル (`*s.txt`) の読み込み・適用経路に対応。
- **FMO 同期**: `fmo.rs` における `balloon0` / `balloon1` へのテキスト格納とリアルタイム同期。

## 実装箇所

- `ui/ts/core/actions/balloon-descript/assets.ts` `resolveAndSetMarker`
- `ui/ts/ghost/balloon-window/theme.ts` マーカー画像プリロード処理
- `ui/css/balloon-window.css` `.balloon-marker`
- `crates/nanai-core/src/sakura_script/parser/standard_tags.rs` `SakuraToken::Marker`
- `crates/nanai-core/src/sakura_player.rs` `StepOutput::Marker`
- `ui/ts/ghost/sakura-script.ts` `appendMarkerToBalloon`
