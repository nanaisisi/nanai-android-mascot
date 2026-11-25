# バルーン規格対応仕様 (Balloon Compliance)

- **言及規格の元ドキュメント・権利者・ライセンス**:
  - **SSP 拡張仕様 / メニュー規格**: [ukatech/ukadoc-ssp](https://github.com/ukatech/ukadoc-ssp) / [SSP BUG-SLIK-PRACTICE](http://ssp.shillest.net/) - © UKADOC project (CC BY 4.0) / © PONapook 氏
  - **さくらスクリプト (Sakura Script)**: [ukadoc-spec: さくらスクリプト](https://ukatech.shillest.net/ukadoc-spec/spec/sakura-script/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)
  - **バルーン仕様 (Balloon)**: [ukadoc-spec: balloon](https://ukatech.shillest.net/ukadoc-spec/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)
  - **伺か標準仕様 / ゴースト / シェル**: [ukatech/ukadoc-spec (UKADOC project)](https://ukatech.shillest.net/ukadoc-spec/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)

Nanai Android Mascot における「バルーン（吹き出し）スキン規格（`balloon/descript.txt`）」および表示制御への個別対応仕様です。

## 1. 概要と対応度

- **規格**: 伺か/SSP バルーン仕様、Modern Web CSS/Theme
- **対応度**: **85%**
- **主要実装ファイル**:
  - `../../../ui/css/balloon-theme.css`: バルーン配置、スキンCSSカスタムプロパティ（emily4, ivory, pixel, comic, dark）
  - `../../../ui/ts/core/app-actions.ts`: `descript.txt`（フォント名/色/サイズ/選択肢色/有効矩形/折り返し/原点）の動的バインド、バルーンテーマ・倍率変更
  - `../../../ui/ts/ghost/sakura-script.ts`: `\0` / `\1` スコープ別バルーンへの送出制御、文字送り
  - `../../../src-tauri/src/commands/install/mod.rs`: バルーン NAR アーカイブ（`type,balloon`）の解凍・自動導入

---

## 2. 仕様対応詳細

| 項目 / 規格                       | 対象仕様                                               | 対応状況  | 動作仕様・実装詳細                                                                                                      |
| :-------------------------------- | :----------------------------------------------------- | :-------: | :---------------------------------------------------------------------------------------------------------------------- |
| **独立バルーン表示**              | `\0` (メイン) / `\1` (サブ)                            | ✅ 対応済 | 各キャラの頭上・横位置へ独立した吹き出しコンテナを動的配置                                                              |
| **バルーンテーマ着せ替え**        | プリセットテーマ切替                                   | ✅ 対応済 | モダン（デフォルト）、アイボリー、ドット絵、コミック、ダーク、emily4 の動的切り替え                                     |
| **バルーン倍率変更**              | 80% / 100% / 120% / 150%                               | ✅ 対応済 | メニューから文字・吹き出しサイズのリアルタイム拡縮                                                                      |
| **文字送り・自動スクロール**      | テキストキューイング                                   | ✅ 対応済 | 指定ウェイトに応じた文字送り、あふれ時のスムーズなスクロール                                                            |
| **選択肢レンダリング**            | `\q` ボタン生成                                        | ✅ 対応済 | タッチ・クリック操作しやすいボタン形式でのインライン描画                                                                |
| **`descript.txt` 属性・座標解釈** | `font.*`, `origin.x/y`, `validrect`, `wordwrappoint.x` | ✅ 対応済 | フォント名/色/サイズ/選択肢ハイライト色、有効矩形パディング、折り返し幅、原点オフセットを CSS 変数および DOM へ動的反映 |
| **バルーンアーカイブ導入**        | 追加バルーン導入                                       | ✅ 対応済 | `.nar` (install.txt `type,balloon`) の解凍・`assets/balloon/{name}/` への自動仕分け配置完備                             |

---

## 3. モバイル向け適応

- **画面端・はみ出し自動補正**: 画面端にキャラクターが移動した際、バルーンが画面外へ見切れないよう自動で左右反転・位置補正。
- **タップによるスキップ**: バルーン領域タップで表示中テキストを一括全文表示。

---

## 4. バルーン画像アセット・オプション設定規約

ベースウェアおよび同梱バルーン（[assets/balloon/nam](../../../assets/balloon/nam/) 等）で扱う画像ファイルとオプション定義ファイルの用途・解決規約です。

- **実装箇所**:
  - `../../../src-tauri/src/commands/shell/balloon/image.rs`: 画像探索・フォールバック・`.pna` 合成
  - `../../../src-tauri/src/commands/shell/balloon/manifest.rs`: スコープ・`balloon_id`・入力ボックス別の設定ファイル解決
  - `../../../ui/css/balloon-window.css`: `arrow0` / `arrow1` および `online` マーカーの CSS 変数展開

### 4.1 画像ファイル名と用途

| ファイル名（拡張子除く） | 対象 / 用途 | 備考・フォールバック |
| :--- | :--- | :--- |
| `balloons0` / `balloons1` | 本体（`\0`）通常バルーン（左右向き） | `balloons0` 不在時は `balloons` へフォールバック |
| `balloons2` / `balloons3` | 本体（`\0`）大きめ・縦長バルーン（`\b[2]` 用） | 選択肢一覧や長文向け |
| `balloonk0` / `balloonk1` | 相方（`\1`）通常バルーン（左右向き） | `balloonk0` 不在時は `balloonk` へフォールバック |
| `balloonk2` / `balloonk3` | 相方（`\1`）大きめ・縦長バルーン（`\b[2]` 用） | 選択肢一覧や長文向け |
| `balloonc0` 〜 `balloonc5` | 入力ボックス（`inputbox` 等）・コミュニケート枠 | `is_input_box` 時に使用、`balloonc0` 不在時は `balloonc` へフォールバック |
| `balloonp*` | 3人目以降（`\p[2]`〜）用バルーン | 不在時は `balloonk` / `balloons` 系へフォールバック |
| `arrow0` / `arrow1` | スクロール矢印（`arrow0`=上、`arrow1`=下） | `--balloon-arrow0-image` / `--balloon-arrow1-image` で使用 |
| `online` / `online0` 〜 `online3` | オンラインマーカー | `.online-marker`（`--balloon-online-image`）で使用 |
| `sstp` | SSTP 受信時マーカー | 標準バルーン構成ファイル |

### 4.2 対応拡張子・透過（`.pna`）とオプション設定解決

- **拡張子探索順**: 指定パスのファイルが存在しない場合、同一ステムで `png` / `bmp` / `jpg` / `jpeg` / `gif` / `svg`（大文字拡張子含む）の順に探索します。
- **`.pna` アルファ合成**: 画像ファイルと同名・同階層の `.pna`（または `.PNA`）が存在する場合、ルマ値をアルファチャンネルとして合成し PNG Data URL として返します。
- **オプション設定ファイル解決**: `descript.txt` を基準に、`is_input_box` 時は `balloonc<id>s.txt` → `balloonc0s.txt` → `ballooncs.txt`、通常時はスコープ（`balloons` / `balloonk` / `balloonp<scope>def<id>s.txt`）および `balloon_id`（`2` の場合は `*2s.txt` / `*ss.txt`）に応じて段階的にマージします。
