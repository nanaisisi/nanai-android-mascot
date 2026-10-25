// スプラッシュ画面の制御
const loadingTexts = [
  "起動中...",
  "YAYA Shioriを読み込み中...",
  "ゴーストデータを準備中...",
  "デスクトップ環境を初期化中...",
  "完了",
];

let currentTextIndex = 0;
const loadingTextElement = document.getElementById("loading-text");

function updateLoadingText() {
  if (currentTextIndex < loadingTexts.length) {
    if (loadingTextElement) {
      loadingTextElement.textContent = loadingTexts[currentTextIndex];
    }
    currentTextIndex++;

    // 次のテキスト更新までの時間を調整
    const delay = currentTextIndex === loadingTexts.length ? 500 : 600;
    setTimeout(updateLoadingText, delay);
  } else {
    // スプラッシュ完了後の処理
    setTimeout(() => {
      if (loadingTextElement) {
        loadingTextElement.textContent =
          "スプラッシュ完了 - 手動で閉じてください";
      }
    }, 200);
  }
}

// 初期化開始
setTimeout(updateLoadingText, 800);

// 将来的なTauri APIとの連携準備
if (typeof globalThis.__TAURI__ !== "undefined") {
  console.log("Tauri環境で実行中");
}
