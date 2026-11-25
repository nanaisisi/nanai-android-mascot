# Phase E: SSP 拡張機能（`ukadoc-ssp/functions`）仕分け・実装方針

本ドキュメントは、[spec-implementation-and-assurance-plan.md](../design/planning/spec-implementation-and-assurance-plan.md) の Phase E に基づき、[ukadoc-ssp/functions](../../spec/ukadoc-ssp/functions/README.md) 配下の拡張機能群について「実装対象」「代替仕様」「非対象（対象外）」の境界を確定する。

## 1. 機能カテゴリ別仕分け表

| カテゴリ | 分類 | 優先度 | 方針・備考 |
| :--- | :--- | :--- | :--- |
| `explorer` | 実装対象 | P1 | ゴースト/シェル/バルーン一覧・切替・詳細確認の統合エクスプローラとして実装 |
| `option` | 実装対象 | P1 | 設定 UI（表示・音声・開発者設定・接続設定）の垂直スライスで段階実装 |
| `shortcut` | 実装対象 | P1 | `Ctrl+Shift+F10` / `F12` / `D` / `Ctrl+L` 等の既存ショートカットと統合 |
| `windowmode` | 実装対象 | P2 | デスクトップではウィンドウモード切替、Android では単一オーバーレイへ適応 |
| `speech-synthesis` | 代替仕様 | P2 | OS ネイティブ TTS（Web Speech API / Android TextToSpeech）へ委譲 |
| `speech-recognition` | 代替仕様 | P3 | OS ネイティブ音声認識（Android SpeechRecognizer 等）へ任意連携 |
| `calendar` | 非対象 | - | モバイル/デスクトップ常駐マスコットコア範囲外のため対象外 |
| `archiveviewer` | 非対象 | - | `.nar` / `.zip` 導入処理のみ対応し、専用ビューア UI は対象外 |
| `pictureviewer` | 非対象 | - | OS 標準ビューアまたはサーフェステスト機能で代替 |
| `sspim` | 非対象 | - | SSP 固有メッセンジャー機能のため対象外 |
| `other` | 個別判定 | P2〜対象外 | 開発者パレット・スクリプトログ等のデバッグ支援のみ実装対象 |

## 2. Phase E 垂直スライス実装順

1. **開発者パレット・スクリプトログ**: 当たり判定可視化、サーフェステスト、SHIORI/さくらスクリプトログ確認。
2. **設定 UI・ショートカット**: `option` / `shortcut` の主要項目を UI から操作・永続化。
3. **エクスプローラ・ウィンドウモード**: ゴースト/シェル/バルーン切替 UI とウィンドウ状態管理。
