# CSSサイズ設計・レスポンシブスケーリング仕様書

## 1. 概要

本ドキュメントは、Nanai Android Mascot におけるCSSサイズ設計・スケーリング方針および単位規約を定義します。
スマートフォン、タブレット、PC（デスクトップ）など多様な解像度・アスペクト比・DPI環境、ならびにOSアクセシビリティ（フォントサイズ拡大）において、UIの視認性とレイアウト整合性を両立することを目的としています。

---

## 2. 単位使い分け規約 (Sizing Guidelines)

| 単位・記法 | 主な用途 | 採用理由・メリット |
| :--- | :--- | :--- |
| `rem` | フォントサイズ、パディング、マージン、ボタン寸法、角丸、シャドウ | ルートフォントサイズ（端末・ブラウザ基準）に連動し、OSのアクセシビリティ拡大設定に追従するため。 |
| `clamp(min, preferred, max)` | キャラクター枠、バルーン最大幅、モーダルダイアログ幅・高さ | 小型端末での極端な縮小・大画面での過剰な肥大化を防ぎつつ、画面サイズに応じて柔軟にスケールさせるため。 |
| `vmin` | マスコット表示枠（`.ghost-display`）の基準幅 | 端末の縦向き（Portrait）と横向き（Landscape）のどちらでも、画面短辺に比例して常に適切なプロポーションを保つため。 |
| `vw` / `vh` | モーダル・バルーンの画面追従マージン、上下位置調整 | 画面全体の表示領域に対する割合で安全にオフセットを確保するため。 |
| `em` | メディアクエリのブレークポイント（例: `@media (max-width: 48em)`） | ユーザーがブラウザ・OSの基準文字サイズを変更した際にも、意図通りの比率でレスポンシブ切り替えを行うため。 |
| `px` (限定使用) | 極細境界線（`border: 1px solid`、`height: 1px`）、a11y非表示（`1px`） | サブピクセルレンダリング時の線の消失・滲み防止、および定型アクセシビリティ仕様準拠のため。 |

---

## 3. 主要コンポーネントのサイズ定義

### 3.1 マスコット表示コンテナ (`mascot.css`)

```css
/* メインキャラクター (sakura / 0番手) */
.ghost-display {
  width: clamp(8.75rem, 35vmin, 16.25rem);
  aspect-ratio: 1 / 2;
  height: auto;
}

/* サブキャラクター (kero / 1番手) */
.ghost-display.kero-display {
  width: clamp(6.25rem, 25vmin, 11.25rem);
  aspect-ratio: 1 / 2;
  height: auto;
}
```

- **比率の維持**: アスペクト比を `1 / 2` に固定し、画像やキャンバスが歪むのを防止。
- **画面適応**: `vmin`（短辺）を基準にすることで、回転時にも画面外への突き抜けを防止。

### 3.2 バルーン (吹き出し)

```css
.balloon-display {
  top: clamp(2rem, 8vh, 3.5rem);
}

.balloon {
  padding: 0.875rem 1.125rem;
  max-width: clamp(12.5rem, 80vw, 22.5rem);
}
```

- 小型端末では画面幅の80%（`80vw`）で柔軟に折り返し、大画面でも `22.5rem`（約360px相当）までに制限して読みやすさを維持。

### 3.3 コンテキストメニュー & サブメニュー (`context-menu.css`)

```css
.menu-container {
  padding: 0.25rem 0;
  width: clamp(10rem, 45vw, 15rem);
}

.submenu-container {
  min-width: clamp(9.375rem, 40vw, 13.125rem);
  max-height: calc(100vh - 2.5rem);
}
```

- 片手操作時にも誤タップしにくい余白（`0.5rem 0.875rem`）を確保。

### 3.4 モーダルダイアログ & iframe (`menu-modal.css`)

```css
.menu-iframe-container {
  width: clamp(15rem, 80vw, 28.75rem);
}

.menu-iframe-container iframe {
  width: 100%;
  height: clamp(20rem, 70vh, 36.25rem);
}

.modal {
  border-radius: 0.75rem;
  max-width: clamp(17.5rem, 90vw, 37.5rem);
  max-height: 85vh;
}
```

---

## 4. テーマ設計トークンとの連動 (`balloon-theme.css`)

デザインシステムのトークン（CSS変数）も `rem` に統一されています。

- `--balloon-font-size`: `0.8125rem` (13px相当) 〜 `0.875rem` (14px相当)
- `--balloon-border-radius`: `0.25rem` (アイボリー) 〜 `1.25rem` (コミック)
- `--balloon-box-shadow`: 相対距離とぼかし量（`0.125rem` 〜 `0.5rem`）

---

## 5. 開発時の禁止・推奨ルール

1. **幅・高さ・マージン・文字サイズへの固定 `px` 直接指定は禁止**
   - 必ず `rem` または `clamp()`、`%` を使用する。
2. **`!important` の使用禁止**
   - 詳細度（Specificity）の適正管理とメンテナンス性確保のため、スタイル上書きに `!important` を用いない。
3. **ブレークポイントは `em` を使用**
   - `@media (max-width: 48em)`（768px相当）のように記述する。
