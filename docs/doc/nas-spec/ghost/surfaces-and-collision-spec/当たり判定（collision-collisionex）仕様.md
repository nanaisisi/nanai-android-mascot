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

### 4.3 当たり判定オーバーレイ表示仕様と拡張レジストリ

開発者向け当たり判定表示（開発用パレット「当たり判定を表示」および `\![enter,collisionmode]` / `\![enter,collisionmode,rect]`）は、Web 単一画面と Tauri マルチキャラクターウィンドウの双方で共通レジストリ（`ui/ts/surface/collision-overlay-renderer.ts`）を通じて描画します。

1. **半透明塗りの廃止（ワイヤーフレーム描画）**:
   - 各判定領域・ウィンドウ境界・基準点の内部塗りつぶし（半透明の配色）は行わず、不透明色の枠線およびラベル文字のみを描画します。
   - 部位判定定義が空のサーフィスでも、表示が有効な間はウィンドウ系の外枠境界を描画します。
2. **表示レイヤー構成（登録順・拡張可能）**:

| レイヤー ID | 描画対象 | 既定線色 | 備考 |
| :--- | :--- | :--- | :--- |
| `window-bounds` | ウインドウ／サーフィス全体外枠 | `#0078d7` | キャラクター倍率に追従したウィンドウ境界 |
| `icon-rect` | `icon.rect` 定義領域 | `#00897b` | タスクアイコン等の切り出し矩形 |
| `surface-points` | `point.*` 基準点座標 | `#d81b60` | `center` / `basepos` / `kinoko.center` / `osuwaripos` 等 |
| `part-collisions` | 部位当たり判定一覧 | `#ff0000` | `collision` / `collisionex` および `animation*.collision*` |

3. **形状・レイヤーの仕様追随レジストリ**:
   - **形状レジストリ（`registerCollisionShapeSpec`）**: `rect`（別名 `box`）、`circle`、`ellipse`（中心半径形式・外接矩形形式の両方）、`polygon`、`region`（SSP 2.5.19+）を宣言的に登録し、新たな `collisionex` 形状追加時は描画・正規化処理をレジストリ登録のみで拡張できます。
   - **レイヤーレジストリ（`registerCollisionOverlayLayer`）**: ウインドウ系・サーフィス系の新規領域（カスタム座標・境界定義等）を追加する際も、呼び出し側（`surface-collision.ts` / `character.ts`）の描画分岐を増やさずレイヤー登録で追随できます。
   - **表示モード**: `mode: "full"` は枠線＋名称ラベル、`mode: "rect"` は枠線のみ（`\![enter,collisionmode,rect]` 相当）を描画します。

---
