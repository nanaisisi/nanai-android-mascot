- **言及規格の元ドキュメント・権利者・ライセンス**:
  - **伺か標準仕様 / ゴースト / シェル**: [ukatech/ukadoc-spec (UKADOC project)](https://ukatech.shillest.net/ukadoc-spec/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)
  - **さくらスクリプト (Sakura Script)**: [ukadoc-spec: さくらスクリプト](https://ukatech.shillest.net/ukadoc-spec/spec/sakura-script/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)
  - **surfaces.txt / アニメーション合成 / 当たり判定**: [ukadoc-spec: surfaces.txt](https://ukatech.shillest.net/ukadoc-spec/spec/surfaces/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)
  - **SHIORI/3.0 規格**: [ukatech/shiori3](https://ukatech.shillest.net/ukadoc-spec/spec/shiori3/) - © UKADOC project (CC BY 4.0)
  - **SSP 拡張仕様**: [ukatech/ukadoc-ssp](https://github.com/ukatech/ukadoc-ssp) - © UKADOC project (CC BY 4.0)

> **AI 関与について**: このドキュメントは AI アシスタントの支援により作成されました。

# 実装・変更ガイドライン (Implementation & Modification Guidelines)

本ドキュメントは、nanai-android-mascot における規格実装の進め方、コマンドによるモジュールサイズ検出・分割によるサイズ抑制方針、および実機テスト（Windows / Android）の手順・観点を体系的にまとめた開発・保守ガイドです。

---

## 1. 規格実装の進め方

本プロジェクトでは、伺か（UKAGAKA）および関連仕様（UKADOC / SSP 仕様）に準拠した互換レイヤーを構築しています。

### 1.1 仕様参照の原則

- **仕様準拠**: 新規機能追加や振る舞い修正時は、[UKADOC 規格群](../../docs/spec/ukadoc/SUMMARY.md) を一次情報として参照します。
- **レイヤー責務の分離**:
  - **Rust 層 (`src-tauri/`)**: VFS、文字コード（Shift_JIS / UTF-8）判別・変換、ファイル I/O、低レイヤー OS ウィンドウ透過・DPI 制御。
  - **JavaScript コア層 (`ui/js/`)**: さくらスクリプト解析・再生、サーフィス描画・アニメーション合成、SHIORI プロトコル制御、UI 状態管理。
  - **プラットフォーム固有層 (`ui/windows/`, `src-tauri/gen/android/`)**: デスクトップ特有機能（トレイ、コンテキストメニュー）および Android 常駐・オーバーレイ機能。

### 1.2 変更時のチェックリスト

1. 規格ドキュメント（さくらスクリプトタグ、サーフィス記述子、SHIORI イベント名等）との整合性確認。
2. Windows と Android 両環境で動作可能な API 設計（プラットフォーム依存コードを直接 UI コア層に混入させない）。
3. 既存のゴースト資産（Shift_JIS 記述、大文字小文字の混在パス等）に対する互換性の維持。

---

## 2. モジュールサイズの検出と抑制（ファイル肥大化防止）

UI 層（フロントエンド）は Vanilla JavaScript で実装されており、単一ファイルが肥大化すると保守性低下やコード理解のコスト増につながります。

### 2.1 モジュールサイズ検出コマンド

PowerShell または Nushell、Bash 等を用いてリポジトリ内の `.js` ファイルサイズを監視します。

#### PowerShell での実行例 (Top 10 ファイル抽出)

```powershell
git ls-files | Select-String "\.js$" | ForEach-Object { Get-Item $_ } | Sort-Object Length -Descending | Select-Object -First 10 | Format-Table Name, Length, FullName
```

#### Nushell での実行例

```nu
git ls-files | lines | where ($in | str ends-with ".js") | each { |it| ls $it } | flatten | sort-by size --reverse | first 10
```

#### Bash での実行例

```bash
git ls-files "*.js" | xargs wc -c | sort -nr | head -n 11
```

### 2.2 ファイル分割・抑制の基準と方針

- **目安閾値**: 1 ファイルあたり **10KB (おおよそ 300〜400行)** を目安として上限を意識する。
- **責務ごとの分割方針**:
  - **パーサーと実行エンジンの分離**: 例: `sakura-parser.js`（構文解析・AST/トークン化）と `sakura-script.js`（ウェイト・タイピング制御）。
  - **UI テンプレートとイベントハンドラの分離**: 例: `doc-templates.js`（HTML マークアップ生成）と `modal-ghost-handlers.js`（DOM 操作・イベント監視）。
  - **描画合成とインタラクションの分離**: 例: `surface.js`（Canvas 合成描画）と `interaction.js`（マウス/タッチドラッグ・当たり判定）。
- **共通モジュール化**: 複数箇所で重複するユーティリティ関数は `ui/js/core/` や独立したヘルパーへ抽出する。

---

## 3. 実機テスト手順と検証観点 (Windows & Android)

### 3.1 Windows 環境での実機テスト

#### ビルド & 起動コマンド

```powershell
cargo tauri dev
```

#### 主な検証観点

1. **ウィンドウ透過 & クリック透過**:
   - キャラクター外郭の透過部分をクリックした際、背面のウィンドウへ入力が正常に抜けるか。
2. **DPI スケール変更耐性**:
   - ディスプレイ解像度やスケーリング（100%, 125%, 150%, 200%）変更時、およびマルチモニタ間移動時に座標ズレやクラッシュが発生しないか。
3. **右クリック階層メニュー & モーダル**:
   - `menu-iframe.html` による階層メニューの表示、ゴースト切替、設定モーダルの開閉がスムーズに行えるか。
4. **さくらスクリプト再生 & バルーン表示**:
   - テキストタイピング、ウェイトタグ（`\w[1-9]`）、サーフィス変更（`\s[0]`）、バブル（吹き出し）追従の確認。

---

### 3.2 Android 環境での実機テスト

#### ビルド & 起動コマンド

```powershell
# デバイス/エミュレータ接続確認
adb devices

# Tauri Android デバッグ実行
cargo tauri android dev
```

#### 主な検証観点

1. **画面オーバーレイ表示 (`SYSTEM_ALERT_WINDOW`)**:
   - 他アプリ起動時にも最前面にキャラクターがオーバーレイ表示され、背面アプリのタッチ操作を妨げない（透過領域のタッチスルー）か。
2. **タッチ & ジェスチャー操作**:
   - キャラクター上のタップ、ドラッグ、スワイプ、長押し等のタッチイベント追従性。
3. **画面回転・解像度変化**:
   - 縦向き・横向き切替時のリサイズ処理および画面端スナップの挙動。
4. **省電力・メモリ消費**:
   - バックグラウンド待機時やアイドル状態での不要なループ・タイマー動作が停止し、バッテリー消費が抑えられているか。
5. **文字コード・ファイルパス互換性**:
   - Android（Linux ファイルシステム）の大文字小文字厳格判定において、ゴーストファイルのロード漏れが発生しないか。
