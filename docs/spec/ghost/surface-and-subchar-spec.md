# サブキャラクター対応および表情差分・サーフェス描画システム仕様書

- **言及規格の元ドキュメント・権利者・ライセンス**:
  - **SSP 拡張仕様 / メニュー規格**: [ukatech/ukadoc-ssp](https://github.com/ukatech/ukadoc-ssp) / [SSP BUG-SLIK-PRACTICE](http://ssp.shillest.net/) - © UKADOC project (CC BY 4.0) / © PONapook 氏
  - **さくらスクリプト (Sakura Script)**: [ukadoc-spec: さくらスクリプト](https://ukatech.shillest.net/ukadoc-spec/spec/sakura-script/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)
  - **伺か標準仕様 / ゴースト / シェル**: [ukatech/ukadoc-spec (UKADOC project)](https://ukatech.shillest.net/ukadoc-spec/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)
  - **surfaces.txt / アニメーション合成 / 当たり判定**: [ukadoc-spec: surfaces.txt](https://ukatech.shillest.net/ukadoc-spec/spec/surfaces/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)

## 1. 概要 (Overview)

本ドキュメントは、伺か（SSP/UKADOC標準仕様）におけるサブキャラクター（スコープ1: kero / \p[1]）の表示・非表示連動制御、および表情差分・サーフェス切り替え（`\s[ID]`）の描画システム改善仕様を定義するものです。

---

## 2. サブキャラクター（kero / scope 1）対応仕様

### 2.1 スコープ制御ルール

伺かの標準スコープ仕様に準拠します：

- `\0` または `\h` または `\p[0]`: メインキャラクター（sakura / scope 0）
- `\1` または `\u` または `\p[1]`: サブキャラクター（kero / scope 1）
- `\p[n]`: スコープ $n$（将来的拡張用）

### 2.2 スロット表示・非表示連動

- **自動表示トリガー**:
  - さくらスクリプト内で `\1`、`\u`、または `\p[1]` が指定され発話やサーフェス変更が行われた場合、`#kero-slot` を可視化（`display: flex`）。
- **非表示・消去トリガー**:
  - `\s[-1]`（サーフェス消去）が指定された場合、対象スコープのスロットを非表示（`display: none`）に設定。
- **ゴースト初期化時**:
  - ゴースト読み込み時、kero 側のサーフェスファイル（`surface10.png` 等）が存在する場合、またはスクリプトで指示された場合にスロットを表示。未定義・初期状態では非表示を維持。

---

## 3. 表情差分・サーフェス描画システム仕様

### 3.1 サーフェス指定パーサーの拡張

- `\s[ID]`: 任意数値ID（負数 `-1` を含む）のサーフェス指定に対応。
- `\s0` 〜 `\s9`: 1桁の省略形記法に対応。
- `\s[-1]`: キャラクター非表示化（スロット隠し）。

### 3.2 描画キャッシュとクロマキー（緑透過）高速化

- **透過済み画像キャッシュ**:
  - `SurfaceManager` 内に `chromaKeyCache` (Map) を導入。
  - 同一サーフェス画像の初回ロード時にクロマキー（純緑 `#00FF00` / 左上ピクセル色）透過処理を実施し、以降の表情切り替えではキャッシュ済み DataURL を即時適用することでちらつき（Flicker）を防止。
- **フォールバック処理**:
  - 要求されたサーフェスID（例: `surface1`）が存在しない場合、ベースサーフェス（scope 0: `surface0`、scope 1: `surface10`）へフォールバック。

---

## 4. アーキテクチャと影響ファイル

| ファイルパス | 役割・変更内容 |
| :--- | :--- |
| `docs/spec/surface-and-subchar-spec.md` | 本仕様書（永続ドキュメント・相対パス表記） |
| `src/js/sakura-script.js` | `\s[-1]` や `\p[n]` スコープ切替・スロット連動処理の拡充 |
| `src/js/ghost.js` | スコープ別のサーフェス更新・スロット表示/非表示制御 |
| `src/js/surface.js` | クロマキー画像のキャッシュ機構追加による表情切り替え高速化 |
