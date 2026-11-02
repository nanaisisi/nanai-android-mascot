//! 描画メソッド・アニメーションインターバルの型

use serde::{Deserialize, Serialize};

/// `element[N]` / `animation[N].pattern[K]` の第1パラメータ（描画メソッド）
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum DrawMethod {
    /// `base`：下地として描画する
    Base,
    /// `overlay`：現在の絵の上に重ねる
    Overlay,
    /// `overlayfast`（`fast`）: 下の同一領域を消して重ねる
    OverlayFast,
    /// `interpolate`：下の絵と同一色の部分を透過して重ねる
    Interpolate,
    /// `replace`：既存要素を差し替える
    Replace,
    /// `add`：着せ替え用パーツの追加（overlay 相当）
    Add,
    /// `bind`：着せ替えパーツのトグル
    Bind,
    /// `asis`：透過処理を行わずそのまま描画
    AsIs,
    /// `auto`：画像フォーマットに応じて自動判定
    Auto,
    /// `move`：表示位置の移動
    Move,
    /// `insert`：アニメーションパターン挿入
    Insert,
    /// `start`：指定IDのアニメーションを開始
    Start(Option<u32>),
    /// `stop`：指定IDのアニメーションを停止
    Stop(Option<u32>),
    /// `alternativestart`：指定ID群の中からランダムに1つ開始
    AlternativeStart(Vec<u32>),
    /// `alternativestop`：指定ID群の中からランダムに1つ停止
    AlternativeStop(Vec<u32>),
    /// `parallelstart`：指定ID群のすべてのアニメーションを開始
    ParallelStart(Vec<u32>),
    /// `parallelstop`：指定ID群のすべてのアニメーションを停止
    ParallelStop(Vec<u32>),
    /// `reduce`：ベースレイヤと新規レイヤの不透明度（アルファ）を乗算合成
    Reduce,
    /// `blend-xxx`：各種アルファブレンド合成（例: `blend-multiply`）
    Blend(String),
    /// その他の拡張メソッド（`import` 等）
    Custom(String),
}

fn parse_id_list_inner(s: &str) -> Vec<u32> {
    let trimmed = s.trim().trim_start_matches(',').trim();
    let trimmed = trimmed.trim_matches(|c| c == '(' || c == ')' || c == '[' || c == ']');
    trimmed
        .split(|c| c == ',' || c == '.' || c == ' ' || c == '+')
        .filter_map(|p| p.trim().parse::<u32>().ok())
        .collect()
}

impl DrawMethod {
    /// 文字列から描画メソッドを構築する（大文字小文字は無視）
    pub fn parse(method: &str) -> Self {
        let m = method.trim();
        let lower = m.to_lowercase();
        match lower.as_str() {
            "base" => Self::Base,
            "overlay" => Self::Overlay,
            "overlayfast" | "fast" | "overlay-fast" => Self::OverlayFast,
            "interpolate" => Self::Interpolate,
            "replace" => Self::Replace,
            "add" => Self::Add,
            "bind" => Self::Bind,
            "asis" => Self::AsIs,
            "auto" => Self::Auto,
            "move" => Self::Move,
            "insert" => Self::Insert,
            "reduce" => Self::Reduce,
            "overlaymultiply" => Self::Blend("multiply-fast".to_string()),
            "overlayscreen" => Self::Blend("screen-fast".to_string()),
            s if s.starts_with("blend-") => Self::Blend(s.trim_start_matches("blend-").to_string()),
            s if s.starts_with("start") => {
                let rest = s.trim_start_matches("start").trim();
                let ids = parse_id_list_inner(rest);
                Self::Start(ids.first().copied())
            }
            s if s.starts_with("stop") => {
                let rest = s.trim_start_matches("stop").trim();
                let ids = parse_id_list_inner(rest);
                Self::Stop(ids.first().copied())
            }
            s if s.starts_with("alternativestart") => {
                let rest = s.trim_start_matches("alternativestart").trim();
                Self::AlternativeStart(parse_id_list_inner(rest))
            }
            s if s.starts_with("alternativestop") => {
                let rest = s.trim_start_matches("alternativestop").trim();
                Self::AlternativeStop(parse_id_list_inner(rest))
            }
            s if s.starts_with("parallelstart") => {
                let rest = s.trim_start_matches("parallelstart").trim();
                Self::ParallelStart(parse_id_list_inner(rest))
            }
            s if s.starts_with("parallelstop") => {
                let rest = s.trim_start_matches("parallelstop").trim();
                Self::ParallelStop(parse_id_list_inner(rest))
            }
            other => Self::Custom(other.to_string()),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_interval_parse_standard_variants() {
        assert_eq!(Interval::parse("always"), Interval::Always);
        assert_eq!(Interval::parse("sometimes"), Interval::Sometimes);
        assert_eq!(Interval::parse("rarely"), Interval::Rarely);
        assert_eq!(Interval::parse("never"), Interval::Never);
        assert_eq!(Interval::parse("runonce"), Interval::RunOnce);
        assert_eq!(Interval::parse("bind"), Interval::Bind);
        assert_eq!(Interval::parse("talk"), Interval::Talk);
        assert_eq!(Interval::parse("starttalk"), Interval::StartTalk);
        assert_eq!(Interval::parse("endtalk"), Interval::EndTalk);
        assert_eq!(Interval::parse(r"\e"), Interval::YenE);
        assert_eq!(Interval::parse("/e"), Interval::YenE);
    }

    #[test]
    fn test_interval_parse_parametric_random_and_periodic() {
        assert_eq!(Interval::parse("random,3"), Interval::Random(3));
        assert_eq!(Interval::parse("random,0"), Interval::Random(0));
        assert_eq!(Interval::parse("periodic,1000"), Interval::Periodic(1000));
        assert_eq!(Interval::parse("periodic,0"), Interval::Periodic(0));

        // Spacing around comma and values
        assert_eq!(Interval::parse("  random , 25  "), Interval::Random(25));
        assert_eq!(Interval::parse("periodic , 500 "), Interval::Periodic(500));

        // Fallbacks for missing or invalid numeric parameters
        assert_eq!(Interval::parse("random"), Interval::Random(10));
        assert_eq!(Interval::parse("random,"), Interval::Random(10));
        assert_eq!(Interval::parse("random,not_a_number"), Interval::Random(10));
        assert_eq!(Interval::parse("random,-5"), Interval::Random(10));
        assert_eq!(Interval::parse("random,3.14"), Interval::Random(10));

        assert_eq!(Interval::parse("periodic"), Interval::Periodic(1000));
        assert_eq!(Interval::parse("periodic,"), Interval::Periodic(1000));
        assert_eq!(
            Interval::parse("periodic,invalid"),
            Interval::Periodic(1000)
        );
        assert_eq!(Interval::parse("periodic,-100"), Interval::Periodic(1000));
        assert_eq!(Interval::parse("periodic,100.5"), Interval::Periodic(1000));
    }

    #[test]
    fn test_interval_parse_edge_cases_and_casing() {
        // Case-insensitivity
        assert_eq!(Interval::parse("ALWAYS"), Interval::Always);
        assert_eq!(Interval::parse("SomeTimes"), Interval::Sometimes);
        assert_eq!(Interval::parse("RaReLy"), Interval::Rarely);
        assert_eq!(Interval::parse("RunOnce"), Interval::RunOnce);
        assert_eq!(Interval::parse("NEVER"), Interval::Never);
        assert_eq!(Interval::parse("BIND"), Interval::Bind);
        assert_eq!(Interval::parse("TALK"), Interval::Talk);
        assert_eq!(Interval::parse("StartTalk"), Interval::StartTalk);
        assert_eq!(Interval::parse("EndTalk"), Interval::EndTalk);
        assert_eq!(Interval::parse(r"\E"), Interval::YenE);
        assert_eq!(Interval::parse("/E"), Interval::YenE);
        assert_eq!(Interval::parse("RANDOM,7"), Interval::Random(7));
        assert_eq!(Interval::parse("PERIODIC,250"), Interval::Periodic(250));

        // Non-parametric keywords with trailing comma/param are still matched by head
        assert_eq!(Interval::parse("always,ignored"), Interval::Always);
        assert_eq!(Interval::parse("runonce,123"), Interval::RunOnce);
        assert_eq!(Interval::parse(r"\e,extra"), Interval::YenE);

        // Empty and whitespace-only
        assert_eq!(Interval::parse(""), Interval::Custom("".to_string()));
        assert_eq!(Interval::parse("   "), Interval::Custom("".to_string()));

        // Unknown or custom strings
        assert_eq!(
            Interval::parse("custom_action"),
            Interval::Custom("custom_action".to_string())
        );
        assert_eq!(
            Interval::parse("custom_action,param"),
            Interval::Custom("custom_action".to_string())
        );
    }

    #[test]
    fn test_interval_serde_roundtrip() {
        let cases = vec![
            Interval::Always,
            Interval::Sometimes,
            Interval::Rarely,
            Interval::Random(42),
            Interval::Periodic(2500),
            Interval::RunOnce,
            Interval::Never,
            Interval::Bind,
            Interval::Talk,
            Interval::StartTalk,
            Interval::EndTalk,
            Interval::YenE,
            Interval::Custom("my_interval".to_string()),
        ];

        for interval in cases {
            let json = serde_json::to_string(&interval).expect("serialization should succeed");
            let deserialized: Interval =
                serde_json::from_str(&json).expect("deserialization should succeed");
            assert_eq!(interval, deserialized);
        }
    }

    #[test]
    fn test_draw_method_parse_and_serde() {
        assert_eq!(DrawMethod::parse("base"), DrawMethod::Base);
        assert_eq!(DrawMethod::parse("OVERLAY"), DrawMethod::Overlay);
        assert_eq!(DrawMethod::parse("fast"), DrawMethod::OverlayFast);
        assert_eq!(DrawMethod::parse("overlayfast"), DrawMethod::OverlayFast);
        assert_eq!(DrawMethod::parse("overlay-fast"), DrawMethod::OverlayFast);
        assert_eq!(DrawMethod::parse("interpolate"), DrawMethod::Interpolate);
        assert_eq!(DrawMethod::parse("replace"), DrawMethod::Replace);
        assert_eq!(DrawMethod::parse("add"), DrawMethod::Add);
        assert_eq!(DrawMethod::parse("bind"), DrawMethod::Bind);
        assert_eq!(DrawMethod::parse("asis"), DrawMethod::AsIs);
        assert_eq!(DrawMethod::parse("auto"), DrawMethod::Auto);
        assert_eq!(DrawMethod::parse("move"), DrawMethod::Move);
        assert_eq!(DrawMethod::parse("insert"), DrawMethod::Insert);
        assert_eq!(DrawMethod::parse("reduce"), DrawMethod::Reduce);
        assert_eq!(
            DrawMethod::parse("overlaymultiply"),
            DrawMethod::Blend("multiply-fast".to_string())
        );
        assert_eq!(
            DrawMethod::parse("overlayscreen"),
            DrawMethod::Blend("screen-fast".to_string())
        );
        assert_eq!(
            DrawMethod::parse("blend-multiply"),
            DrawMethod::Blend("multiply".to_string())
        );
        assert_eq!(DrawMethod::parse("start,1"), DrawMethod::Start(Some(1)));
        assert_eq!(DrawMethod::parse("stop,2"), DrawMethod::Stop(Some(2)));
        assert_eq!(
            DrawMethod::parse("alternativestart,(1,2)"),
            DrawMethod::AlternativeStart(vec![1, 2])
        );
        assert_eq!(
            DrawMethod::parse("alternativestop,[1.2]"),
            DrawMethod::AlternativeStop(vec![1, 2])
        );
        assert_eq!(
            DrawMethod::parse("parallelstart,(3,4)"),
            DrawMethod::ParallelStart(vec![3, 4])
        );
        assert_eq!(
            DrawMethod::parse("parallelstop,[3.4]"),
            DrawMethod::ParallelStop(vec![3, 4])
        );
        assert_eq!(
            DrawMethod::parse("custom_val"),
            DrawMethod::Custom("custom_val".to_string())
        );

        let cases = vec![
            DrawMethod::Base,
            DrawMethod::Overlay,
            DrawMethod::OverlayFast,
            DrawMethod::Interpolate,
            DrawMethod::Replace,
            DrawMethod::Add,
            DrawMethod::Bind,
            DrawMethod::AsIs,
            DrawMethod::Auto,
            DrawMethod::Move,
            DrawMethod::Insert,
            DrawMethod::Start(Some(1)),
            DrawMethod::Stop(Some(2)),
            DrawMethod::AlternativeStart(vec![1, 2]),
            DrawMethod::AlternativeStop(vec![1, 2]),
            DrawMethod::ParallelStart(vec![3, 4]),
            DrawMethod::ParallelStop(vec![3, 4]),
            DrawMethod::Reduce,
            DrawMethod::Blend("screen".to_string()),
            DrawMethod::Custom("custom_mode".to_string()),
        ];

        for dm in cases {
            let json = serde_json::to_string(&dm).expect("serialization should succeed");
            let deserialized: DrawMethod =
                serde_json::from_str(&json).expect("deserialization should succeed");
            assert_eq!(dm, deserialized);
        }
    }
}

/// `animation[N].interval` の種別（ukadoc: h-animationinterval 系）
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum Interval {
    /// `always`：常時ループ
    Always,
    /// `sometimes`：短い乱数周期で発火（約数秒に1回程度）
    Sometimes,
    /// `rarely`：まれに発火（より長い乱数周期）
    Rarely,
    /// `random,N`：約N秒に1回の割合で発火
    Random(u32),
    /// `periodic,N`：一定周期（Nミリ秒）ごとに発火
    Periodic(u32),
    /// `runonce`：サーフィス切替時に必ず1回だけ実行
    RunOnce,
    /// `never`：自動発火しない（SHIORI からの強制実行用）
    Never,
    /// `bind`：着せ替えパーツ装着時に発火
    Bind,
    /// `talk`：発話中ループ
    Talk,
    /// `starttalk`：発話開始時に1回
    StartTalk,
    /// `endtalk`：発話終了時に1回
    EndTalk,
    /// `\e`（yen-e）：さくらスクリプト `\e` 到達時に強制実行
    YenE,
    /// その他の拡張種別
    Custom(String),
}

impl Interval {
    /// `random,3` / `periodic,1000` のような値を解析する（大文字小文字は無視）
    pub fn parse(value: &str) -> Self {
        let v = value.trim();
        let lower = v.to_lowercase();
        let (head, param) = if let Some((h, p)) = lower.split_once(',') {
            (h.trim(), Some(p.trim().to_string()))
        } else {
            (lower.as_str(), None)
        };
        match head {
            "always" => Self::Always,
            "sometimes" => Self::Sometimes,
            "rarely" => Self::Rarely,
            "never" => Self::Never,
            "runonce" => Self::RunOnce,
            "bind" => Self::Bind,
            "talk" => Self::Talk,
            "starttalk" => Self::StartTalk,
            "endtalk" => Self::EndTalk,
            "\\e" | "/e" => Self::YenE,
            "random" => Self::Random(param.and_then(|p| p.parse().ok()).unwrap_or(10)),
            "periodic" => Self::Periodic(param.and_then(|p| p.parse().ok()).unwrap_or(1000)),
            other => Self::Custom(other.to_string()),
        }
    }
}
