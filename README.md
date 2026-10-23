# Mascot Nanai (Android)

Android 向け伺か（ゴースト）互換デスクトップマスコットアプリケーションです。Kotlin と Jetpack Compose でネイティブ実装されており、画面上で浮遊するマスコットキャラクター「なない (Nanai)」とのふれあい、吹き出しバルーン会話、SHIORI 3.0 プロトコルイベント連携を提供します。

## 🌟 主な機能

- 👻 **インタラクティブマスコット表示**:
  - 画面上をふわふわ浮遊するマスコット少女「なない」
  - タップによるリアクション（跳ねるスプリングアニメーションと表情変化）
  - ドラッグ＆ドロップによる自由な画面上の位置移動と「位置リセット」機能
  - サーフェス表情切り替え: 素（Normal）、照れ（Blushing）、驚き（Surprised）、不安（Anxious）、笑顔、ウインク、大喜び、相棒（てすとくん）など計14種
- 💭 **バルーン（吹き出し）表示システム**:
  - なないの標準バルーン（Nanai Std）、グラスモーフィズム、コミックポップ、ミッドナイト（Dark）など多彩なテーマ
  - バルーン倍率（70%〜150%）およびフォント拡大縮小対応
- 🎭 **ゴースト管理**:
  - ゴーストの切り替え（`mock_nanai`, `test_ghost`）
  - ゴースト詳細情報の閲覧とサーフェス表情一覧パレット
- 🔍 **ファイルスキャンと検出**:
  - ゴーストディレクトリ（`assets/ghost`）の走査、辞書ファイル、サーフェス定義、SHIORI DLLの検出
- 🧪 **SHIORI 3.0 テスト機能**:
  - `OnBoot`, `OnMouseClick`, `OnTalk`, `OnSecondChange` などの SHIORI イベント手動送信
  - 任意のメッセージ送信テストとリクエスト／レスポンス生ログのリアルタイム表示
- ⚙️ **設定機能**:
  - 自動ゴースト読み込み、定時トーク有効化、トーク頻度（15秒／30秒／60秒／タップ時のみ）
  - ゴーストサイズ（小／中／大／特大）、シェル倍率（60%〜160%）、バルーン倍率
  - 背景テーマ（透過デスクトップ風、コージールーム、パステルスカイ、ミッドナイト）
  - ダークモード、最前面表示、デバッグレベル切り替え
- 🐛 **デバッグ情報 & リアルタイムログ**:
  - システム情報表示、イベント種別バッジ（INFO, SHIORI, DEBUG, WARN, ERROR）付きログコンソール
  - ログクリアおよびクリップボードへのエクスポート
- ❓ **ヘルプ & ガイド**:
  - 操作方法、Ukagaka / SHIORI 3.0 仕様解説、ライセンス案内

## 🛠️ 技術スタック

- **言語**: Kotlin
- **UI フレームワーク**: Jetpack Compose (Material Design 3)
- **ビルドシステム**: Gradle (Kotlin DSL) / AGP
- **アーキテクチャ**: Clean MVVM (Model-View-ViewModel) + StateFlow / Coroutines
- **画像・アセット**: Android Vector & Drawable Resources, Adaptive Icons

## 📱 ビルド方法

```bash
# デバッグAPKのビルド
gradle assembleDebug

# ビルド成果物
app/build/outputs/apk/debug/app-debug.apk
```

## 📜 ライセンス

このソフトウェアは **Apache-2.0** および **MIT** のデュアルライセンスの下で提供されています。
詳細は `LICENSE-APACHE` および `LICENSE-MIT` をご覧ください。
