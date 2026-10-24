/**
 * Mascot Nanai - SHIORI 3.0 プロトコルパーサー & ビルダー
 * SHIORI/3.0 リクエストおよびレスポンスの生成・解釈
 */

export class ShioriProtocol {
  /**
   * SHIORI/3.0 GET リクエスト文字列を生成
   * @param {string} id - イベントID (例: "OnBoot", "OnMouseClick")
   * @param {Array<string>} references - Reference0〜Reference7
   * @param {string} sender - 送信元ベースウェア名
   * @returns {string} SHIORI/3.0 リクエスト
   */
  static buildRequest(id, references = [], sender = "MascotNanai") {
    let req = `GET SHIORI/3.0\r\n`;
    req += `Sender: ${sender}\r\n`;
    req += `ID: ${id}\r\n`;
    req += `Charset: UTF-8\r\n`;

    references.forEach((ref, index) => {
      if (ref !== undefined && ref !== null) {
        req += `Reference${index}: ${ref}\r\n`;
      }
    });

    req += `\r\n`;
    return req;
  }

  /**
   * SHIORI/3.0 レスポンス文字列をパース
   * @param {string} responseText - SHIORIからの生レスポンス文字列
   * @returns {{ status: number, statusText: string, value: string, headers: Object }}
   */
  static parseResponse(responseText) {
    if (!responseText) {
      return { status: 204, statusText: "No Content", value: "", headers: {} };
    }

    const lines = responseText.split(/\r?\n/);
    if (lines.length === 0) {
      return { status: 500, statusText: "Empty Response", value: "", headers: {} };
    }

    // ステータス行 (例: "SHIORI/3.0 200 OK")
    const statusLine = lines[0].trim();
    const statusMatch = statusLine.match(/^SHIORI\/3\.0\s+(\d+)\s*(.*)$/i);

    const status = statusMatch ? parseInt(statusMatch[1], 10) : 200;
    const statusText = statusMatch ? statusMatch[2].trim() : "OK";

    const headers = {};
    let value = "";

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;

      const colonIdx = line.indexOf(":");
      if (colonIdx !== -1) {
        const key = line.substring(0, colonIdx).trim();
        const val = line.substring(colonIdx + 1).trim();
        headers[key.toLowerCase()] = val;

        if (key.toLowerCase() === "value") {
          value = val;
        }
      }
    }

    return {
      status,
      statusText,
      value,
      headers,
    };
  }
}
