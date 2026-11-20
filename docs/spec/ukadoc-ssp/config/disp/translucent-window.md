# 半透明ウィンドウ

- **規格**: [disp.md](../../../../ukadoc-ssp/config/disp.md) ([公式版](https://ukatech.shillest.net/ukadoc-ssp/config/disp/))
- **検索語**: disp, opacity, translucent
- **対応状況**: ✅ 実装済

## 突合結果

半透明ウィンドウ設定（透明度・クリックスルー等）は未実装。


## 実装箇所

- `ui/ts/surface/ghost-surface-dom.ts:175` `img.style.opacity = "1";`
- `ui/css/balloon-window.css:211` `opacity: 0.8;`
- `tests/app-update/mock/dom/css-style/properties/m-r.ts:46` `opacity: "",`
- `ui/ts/surface/ghost-surface-dom.ts:193` `placeholder.style.opacity = "1";`
- `ui/css/balloon-window.css:311` `opacity: 0.75;`
- `ui/ts/surface/ghost-surface-dom.ts:200` `style="width: 100%; height: 100%; object-fit: contain; pointer-events: auto; vis`
