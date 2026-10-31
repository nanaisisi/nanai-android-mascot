# 本アプリケーション（nanai-android-mascot）における活用方針

### 起動時処理ウィンドウ（スプラッシュ／初期ロード画面）への適用

- **目的**: ゴースト起動中および初期サーフィス構築の待機中に、白画面や空の描画枠ではなく対象シェルのサムネイルを表示し、体感速度向上と表示崩れ防止を図る。
- **検出優先度**:
  1. `shell/<current_shell>/thumbnail.png`
  2. `shell/<current_shell>/thumbnail.jpg`
  3. `shell/<current_shell>/thumbnail.pnr`
- **フォールバック**:
  - 上記が存在しない場合は、ゴースト側の `thumbnail.png` を検索し、それも無い場合は共通のローディングスピナーまたはプレースホルダアイコンを表示する。
