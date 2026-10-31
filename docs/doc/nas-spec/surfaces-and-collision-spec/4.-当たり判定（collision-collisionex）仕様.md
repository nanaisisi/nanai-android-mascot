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
