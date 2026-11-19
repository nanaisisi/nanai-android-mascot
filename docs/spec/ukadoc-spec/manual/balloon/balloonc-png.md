# `balloonc*.png`

- **規格**: [balloon.md](../../../../ukadoc-spec/manual/balloon.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/balloon/))
- **検索語**: balloonc0.png
- **対応状況**: ❌ 未実装

## 突合結果

`docs/ukadoc-spec/manual/balloon.md` で定義されるバルーン入力ウィンドウ画像 `balloonc*.png`（`balloonc0.png`: Send、`balloonc1.png`: Communicate、`balloonc2.png`: Teach、`balloonc3.png`: Input、`balloonc4.png`: Address Bar、`balloonc5.png`: Textarea）は未実装。`loadBalloonSkinImages` (`ui/ts/ghost/balloon-window/theme.ts:260-263`) 内に `"balloonc0.png"` のプリロード呼び出しだけがあるが戻り値は使用されておらず、`balloonc1.png`〜`balloonc5.png` の読み込みおよび各入力ボックス (`ui/ts/ghost/command-handler/inputbox.ts`, `communicatebox.ts`, `teachbox.ts`) への背景スキン画像適用は未実装である。

## 実装箇所

- `ui/ts/ghost/balloon-window/theme.ts:260` `invoke("load_balloon_image", {`
- `ui/ts/ghost/balloon-window/theme.ts:262` `file: "balloonc0.png",`
- `ui/ts/ghost/command-handler/inputbox.ts:55` `const form = document.createElement("div");`
- `ui/ts/ghost/command-handler/communicatebox.ts:44` `form.className = "balloon-inputbox-form balloon-communicatebox-form";`
- `ui/ts/ghost/command-handler/teachbox.ts:35` `form.className = "balloon-inputbox-form";`
