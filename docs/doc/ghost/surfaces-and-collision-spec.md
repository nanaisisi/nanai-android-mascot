# surfaces.txt アニメーション合成 & 当たり判定（Collision）仕様書

- **言及規格の元ドキュメント・権利者・ライセンス**:
  - **SHIORI 仕様 / 各種サブシステム**:
    - **SHIORI/3.0 規格**: [ukadoc-spec: shiori3](https://ukatech.shillest.net/ukadoc-spec/spec/shiori3/) - © UKADOC project (CC BY 4.0)
    - **里々 (SATORI)**: [ukatech/satori-docs](https://ukatech.shillest.net/satori-docs/) - © Kusigahama Yagi / SEIBIHAN (BSD 2-Clause License)
    - **YAYA**: [YAYA-shiori/yaya-docs](https://yaya-shiori.github.io/yaya-docs/) - (The Unlicense / Public Domain)
    - **華和梨 (KAWARI)**: [ukatech/kawari-docs](https://ukatech.shillest.net/kawari-docs/) - © KAWARI Development Team (BSD 2-Clause License)
  - **SSP 拡張仕様 / メニュー規格**: [ukatech/ukadoc-ssp](https://github.com/ukatech/ukadoc-ssp) / [SSP BUG-SLIK-PRACTICE](http://ssp.shillest.net/) - © UKADOC project (CC BY 4.0) / © PONapook 氏
  - **伺か標準仕様 / ゴースト / シェル**: [ukatech/ukadoc-spec (UKADOC project)](https://ukatech.shillest.net/ukadoc-spec/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)
  - **surfaces.txt / アニメーション合成 / 当たり判定**: [ukadoc-spec: surfaces.txt](https://ukatech.shillest.net/ukadoc-spec/spec/surfaces/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)

本仕様書は、**nanai-android-mascot** におけるゴーストのシェル定義ファイル（`surfaces.txt`）の解析、複数画像のレイヤー合成・アニメーション再生、およびタッチ・マウスクリック時の部位判定（Collision）の仕様を定義します。

---

## 1. 処理アーキテクチャの全体像

本仕様は、公式仕様書 **[ukatech/ukadoc-spec: surfaces.txt 仕様](https://ssp.shillest.net/ukadoc/manual/descript_surfaces.html)** および **[ukatech/ukadoc-ssp: Collision 拡張仕様](https://ssp.shillest.net/ukadoc/manual/spec_shiori3.html)** に準拠しています。従来の静的な `<img>` 表示から、HTML5 `<canvas>` または CSS スプライト合成レイヤーによる描画エンジンへと移行します。

```mermaid
flowchart TD
    A["surfaces.txt 解析"] --> B["サーフィス定義ストア<br>(Elements, Collisions, Animations)"]
    B --> C["描画パイプライン (Canvas/Layer)"]
    C --> D["アニメーションタイマー<br>(sometimes, rarely, bind, runonce)"]
    D --> E["画面描画 (Base + Overlays)"]
    
    F["ユーザーのタップ / クリック座標 (X, Y)"] --> G["Collision 判定エンジン"]
    B --> G
    G --> H["特定部位の OnMouseClick / OnMouseMove 発火<br>(例: Reference4 = 'head')"]
```

---

## 2. サーフィス要素（Elements）の合成仕様

### 2.1 定義書式

```text
surface0
{
  element0,base,surface0.png,0,0
  element1,overlay,surface_face_smile.png,20,30
}
```

### 2.2 合成モード仕様

| 合成モード        | 描画動作                                                       |
| :---------------- | :------------------------------------------------------------- |
| `base`            | 下地レイヤー。キャンバスをクリアし、指定座標にベース画像を描画 |
| `overlay` / `add` | 現在のキャンバスの上に、透明部分を保ったまま上乗せ合成         |
| `replace`         | 現在の描画内容を指定領域のみ差し替え                           |
| `overlayfast`     | アルファブレンドなしの高速上乗せ                               |

---

## 3. アニメーション仕様（まばたき・口パク・着せ替え）

### 3.1 インターバル周期（Interval）

`animation[ID].interval` で定義される発火タイミング：

| インターバル | 発火タイミング                      | 用途                                   |
| :----------- | :---------------------------------- | :------------------------------------- |
| `sometimes`  | 約 2〜4 秒に 1 回（確率的）         | まばたき（瞬き）                       |
| `rarely`     | 約 8〜10 秒に 1 回（稀）            | あくび、ため息、服の揺れ               |
| `always`     | ループ終了後、即座に再開            | 呼吸、常時動く尻尾や装飾               |
| `runonce`    | サーフィス切り替え時に 1 回だけ再生 | 驚き、ポーズ遷移アクション             |
| `bind`       | 着せ替え・装飾パーツ用              | ユーザーが着せ替え ON にした時のみ合成 |

### 3.2 パターン（コマ割り）仕様

```text
animation0.pattern0,overlay,100,50,0,0   // 50ms 待機
animation0.pattern1,overlay,101,100,0,0  // 100ms 待機
animation0.pattern2,overlay,-1,0,0,0     // -1 でアニメーション終了・元のサーフィスに戻る
```

---

## 4. 当たり判定（Collision / CollisionEx）仕様

### 4.1 定義書式

`mock_nanai` で採用されている `collisionex` および標準 `collision` の解釈：

```text
// 書式: collisionex[ID],[部位名称],[形状:rect|polygon],[座標(x1,y1,x2,y2)]
collisionex0,head,rect,34,20,157,72
collisionex1,bust,rect,63,159,122,198
collisionex2,skirt,rect,24,301,163,383
```

### 4.2 タッチ判定と SHIORI イベントへのマッピング

ユーザーがマスコットの座標 `(canvasX, canvasY)` をタップ／スワイプした際：

1. **矩形判定（rect）**:
   - `x1 <= canvasX && canvasX <= x2 && y1 <= canvasY && canvasY <= y2`
2. **優先順位**:
   - 複数の判定領域が重なっている場合、ID の大きい定義（より手前に定義されたもの）を優先。
   - どの当たり判定にも入っていない場合は「部位なし（未定義領域）」として処理。
3. **SHIORI リクエスト生成**:

   ```http
   GET SHIORI/3.0
   ID: OnMouseClick
   Reference0: 34       // クリックX座標
   Reference1: 52       // クリックY座標
   Reference2: 0        // マウスホイール
   Reference3: 0        // キャラクタ番号 (0: sakura)
   Reference4: head     // 判定部位識別子 ("head", "bust", "skirt" 等)
   Reference5: 0        // 左クリック
   ```

---

## 5. モバイル（Android）最適化要件

1. **スケーリング対応**:
   - シェル倍率（50%〜200%）が変更されても、CSS サイズから元のテクスチャ座標へ逆変換して当たり判定を計算：
     $$\text{canvasX} = \text{touchX} \times \frac{\text{元の画像幅}}{\text{表示幅}}$$
2. **撫で判定（Stroke）**:
   - 同一の Collision 部位内で指を動かした移動距離（ピクセル数）を積算し、規定値（例: 40px）を超えた時点で `OnMouseMove` を撫でイベントとして発行。
