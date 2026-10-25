/**
 * デフォルト対話・イベント応答定義（外部設定・辞書データ）
 */
export const DefaultResponses = {
  OnBoot: "\\0\\s0Worker版SHIORIコアが起動しました。\\e",
  OnClose: "\\0\\s0またね、お疲れ様。\\e",
  OnSecondChange: "",
  OnMinuteChange: "",
  OnWindowStateMinimize: "\\0\\s0ちょっと隠れるね。また呼んでね。\\e",
  OnWindowStateRestore: "\\0\\s0戻ってきたよ！\\e",
  OnBIFFBegin: "\\0\\s0新着メールを確認中だよ…\\e",
  OnBIFFComplete: "\\0\\s0確認完了！新着メールは特にないみたい。\\e",
  OnRandomTalk: [
    "\\0\\s0ふぅ、今日もいい天気だね。\\e",
    "\\0\\s0何か気になることでもある？\\e",
    "\\0\\s0デスクトップをトコトコ歩いてるよ。\\e"
  ],
  OnMouseClick: {
    Head: "\\0\\s0なでなでしてくれたの？ えへへ。\\e",
    Bust: "\\0\\s0わっ、くすぐったいよ！\\e",
    Default: "\\0\\s0呼んだ？\\e"
  }
};
