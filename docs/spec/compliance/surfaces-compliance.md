# サーフィス規格対応仕様 (Surfaces & Collision Compliance)

Nanai Android Mascot における「サーフィス定義（`surfaces.txt`）」、画像合成、および当たり判定（Collision）規格への個別対応仕様です。

## 1. 概要と対応度

- **規格**: surfaces.txt (SSP 2.x 互換仕様), PNA / アルファPNG
- **対応度**: **85%**
- **主要実装ファイル**:
  - `src/js/surface.js`: HTML5 Canvas 2D による合成・拡大縮小・当たり判定
  - `src/js/interaction.js`: タッチ/クリック座標変換および部位判定
  - `src-tauri/src/lib.rs`: 画像ファイル・`surfaces.txt` のエンコード自動判別読込

---

## 2. 合成・定義対応詳細

| 項目 / 構文 | 対象仕様 | 対応状況 | 動作仕様・実装詳細 |
| :--- | :--- | :---: | :--- |
| **ベース画像描画** | `surface0.png` 等の基準描画 | ✅ 対応済 | 透明度（アルファチャンネル）を維持した Canvas 2D 描画 |
| **差分合成 (element)** | `element[ID],overlay/replace,file,x,y` | ✅ 対応済 | 表情差分パーツ（目・口・眉等）の座標指定レイヤー合成 |
| **当たり判定 (collision)** | `collision[ID],X1,Y1,X2,Y2,Name` | ✅ 対応済 | 矩形判定領域のパース、表示倍率を逆算した座標変換、部位名取得 |
| **円形/楕円判定 (collisionex)** | `collisionex[ID],Name,circle/rect` | ⚠️ 部分対応 | 矩形近似および代表的判定形式の解釈 |
| **アニメーション (animation)** | `animation[ID].interval` 等 | 🚧 開発中 | パラパラアニメーション・瞬き・口パク定義の再生基盤 |
| **着せ替え (bind)** | `bind` オプションによる着脱 | 🚧 開発中 | メニューUIからのパーツトグル合成 |
| **PNA 透過マスク** | 24bit BMP + 8bit グレースケールマスク | ⚠️ 部分対応 | アルファ付き PNG 形式を第一推奨とし、PNAは透過変換対応 |

---

## 3. レンダリング & タッチ座標系

- **Canvas 2D 最適化**: ピクセル等倍レンダリングとシェル倍率（50%〜200%）のリアルタイム拡縮。
- **ポインタ透過制御**: 透明ピクセル領域の透過（Windows: クリックスルー、Android: 背景操作への配慮）。
- **座標変換**: シェル倍率 $S$ および CSS 配置オフセットを逆算し、元画像解像度 $(X, Y)$ での当たり判定判定を正確に実行。
