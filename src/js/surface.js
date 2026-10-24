/**
 * Mascot Nanai - surfaces.txt パーサー & 当たり判定（Collision）マネージャー
 */

export class SurfaceManager {
  constructor(app) {
    this.app = app;
    // mock_nanai の代表的な collision 定義（surfaces.txt に基づく）
    // collisionex0,head,rect,34,20,157,72
    // collisionex1,bust,rect,63,159,122,198
    // collisionex2,skirt,rect,24,301,163,383
    this.collisions = {
      default: [
        { id: 0, name: "head", shape: "rect", x1: 34, y1: 20, x2: 157, y2: 72 },
        { id: 1, name: "bust", shape: "rect", x1: 63, y1: 159, x2: 122, y2: 198 },
        { id: 2, name: "skirt", shape: "rect", x1: 24, y1: 301, x2: 163, y2: 383 },
      ],
    };
    // ベース画像の元解像度 (mock_nanai surface0.png: 200x400 想定)
    this.baseWidth = 200;
    this.baseHeight = 400;
  }

  /**
   * surfaces.txt のテキスト内容をパースして当たり判定を登録
   */
  parseSurfacesTxt(text) {
    const lines = text.split(/\r?\n/);
    let currentSurfaces = ["default"];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("//")) return;

      // surface[ID] ブロック開始
      const surfaceMatch = trimmed.match(/^surface([\d,\-]+)/);
      if (surfaceMatch) {
        currentSurfaces = this.expandSurfaceRange(surfaceMatch[1]);
        currentSurfaces.forEach((s) => {
          if (!this.collisions[s]) this.collisions[s] = [];
        });
        return;
      }

      // collisionex[ID],[name],[shape],[coords...]
      if (trimmed.startsWith("collisionex") || trimmed.startsWith("collision")) {
        const parts = trimmed.split(",");
        if (parts.length >= 6) {
          const name = parts[1].trim().toLowerCase();
          const shape = parts[2].trim().toLowerCase();
          const x1 = parseInt(parts[3], 10);
          const y1 = parseInt(parts[4], 10);
          const x2 = parseInt(parts[5], 10);
          const y2 = parseInt(parts[6], 10);

          currentSurfaces.forEach((s) => {
            if (!this.collisions[s]) this.collisions[s] = [];
            this.collisions[s].push({ name, shape, x1, y1, x2, y2 });
          });
        }
      }
    });
  }

  expandSurfaceRange(rangeStr) {
    const res = [];
    rangeStr.split(",").forEach((part) => {
      if (part.includes("-")) {
        const [start, end] = part.split("-").map((v) => parseInt(v, 10));
        for (let i = start; i <= end; i++) res.push(String(i));
      } else {
        res.push(part.trim());
      }
    });
    return res;
  }

  /**
   * マウス・タッチ座標から当たり部位（head, bust等）を判定
   */
  detectCollision(clickX, clickY, targetRect, surfaceId = "default") {
    // 表示要素内での相対座標 (0.0 〜 1.0)
    const relX = (clickX - targetRect.left) / targetRect.width;
    const relY = (clickY - targetRect.top) / targetRect.height;

    // 元のテクスチャ解像度（200x400）座標系へ逆変換
    const canvasX = Math.round(relX * this.baseWidth);
    const canvasY = Math.round(relY * this.baseHeight);

    console.log(`🔍 タップ座標: (${clickX}, ${clickY}) -> テクスチャ座標: (${canvasX}, ${canvasY})`);

    const colList = this.collisions[surfaceId] || this.collisions["default"] || [];

    // 定義の逆順（手前のもの優先）で判定
    for (let i = colList.length - 1; i >= 0; i--) {
      const col = colList[i];
      if (
        canvasX >= col.x1 &&
        canvasX <= col.x2 &&
        canvasY >= col.y1 &&
        canvasY <= col.y2
      ) {
        return {
          name: col.name,
          canvasX,
          canvasY,
        };
      }
    }

    return {
      name: "",
      canvasX,
      canvasY,
    };
  }
}
