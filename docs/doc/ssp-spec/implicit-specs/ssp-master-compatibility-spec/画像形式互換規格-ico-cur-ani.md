# 画像形式互換規格（ICO / CUR / ANI）

SSP 全域で扱われる Windows アイコン・カーソル形式（`.ico` / `.cur`）およびアニメーションカーソル形式（`.ani`）の互換仕様を定める。

## 1. 対応形式と基本ルール

| 形式 | 拡張子 | 対象範囲 | 仕様 |
| --- | --- | --- | --- |
| ICO / CUR | `.ico` / `.cur` | SSP全域 | Windows アイコン・カーソル形式。アルファ（透明）対応。複数のサイズを含むときは最大のものを使います。 |
| ANI | `.ani` | SSP全域 | Windows のアニメーションカーソル。アニメーション・透過対応で、再生順と待ち時間にも従います。 |

## 2. デコード仕様

### 2.1 ICO / CUR（`.ico` / `.cur`）

1. **コンテナ解析**: `ICONDIR`（`reserved = 0`, `type = 1 (ICO) | 2 (CUR)`）および `ICONDIRENTRY` 配列を解析する。
2. **最大サイズ選択**: 複数エントリが含まれる場合、面積（`width * height`、0 は 256 として扱う）が最大のエントリを選択する。面積が同一の場合はビット深度（`bit_count`）が大きいものを優先する。
3. **イメージ本体デコード**:
   - PNG 埋め込みエントリ（`\x89PNG\r\n\x1a\n`）は PNG としてデコードする。
   - DIB（`BITMAPINFOHEADER`）エントリは BMP / ICO としてデコードし、32bpp RGBA / パレット / 1bit AND マスクの透過を保持する。
4. **ホットスポット**: `.cur` の場合は `ICONDIRENTRY` の `xHotSpot` / `yHotSpot` を保持し、CSS カーソル適用時に `url(...) x y, auto` として使用する。

### 2.2 ANI（`.ani`）

1. **RIFF `ACON` コンテナ解析**: `RIFF` ヘッダおよびフォームタイプ `ACON` を検証する。
2. **チャンク解析**:
   - `anih`: `ANIHEADER`（`nFrames`, `nSteps`, `iDispRate`（既定待ち時間・1/60 秒単位）, `fl` フラグ等）を読み取る。
   - `rate`（任意）: ステップごとの待ち時間配列（`DWORD`、1/60 秒 = jiffies 単位）。省略時は全ステップで `iDispRate`（0 の場合は既定 1 jiffy）を使用する。
   - `seq `（任意）: ステップごとのフレームインデックス配列（`DWORD`）。省略時は `0, 1, ..., nSteps - 1` の連番を使用する。
   - `LIST` (`fram`): 子チャンク `icon` を順に読み取り、各フレームを ICO / CUR ルール（最大サイズ選択・透過・ホットスポット抽出）でデコードする。
3. **アニメーション出力**:
   - 画像表示（サーフェス・バルーン・サムネイル）向けには、`seq ` と `rate` に従って展開したフレーム列を APNG（`data:image/png;base64,...`、遅延は `delay_num = jiffies, delay_den = 60`）としてエンコードする。
   - カーソル表示（`mousecursor.*`・`*.cursor`・ゴーストカーソル）向けには、フレームごとの PNG Data URL・ホットスポット・待ち時間（ミリ秒 = `jiffies * 1000 / 60`）を返し、再生順と待ち時間に従って CSS `cursor` を更新する。

## 3. SSP 全域での適用箇所

- **サーフェス画像 (`load_surface_image`)**: `.ico` / `.cur` / `.ani` をファイル候補に含め、透過付き ICO/CUR/ANI には左上 1px クロマキー処理を適用しない。
- **バルーン画像 (`load_balloon_image`)**: `.ico` / `.cur` / `.ani` を拡張子候補に含め、アルファ透過・ANI アニメーションを維持した Data URL を返す。
- **バルーン・シェルカーソル (`mousecursor.*` / `*.cursor` / `applyGhostCursor`)**: `.cur` のホットスポットおよび `.ani` の再生順・待ち時間アニメーションに対応する。
- **トレイアイコン・アセット探索 (`tray/updater.rs`, `ghost/scan/assets.rs`)**: 複数サイズ ICO の最大サイズ選択、`.ani` のカーソル探索・サムネイル読込に対応する。
