//! さくらスクリプト (Sakura Script) 高速パーサー
//! UKADOC (SSP仕様) 準拠のトークナイザー / AST 生成モジュール

use serde::{Deserialize, Serialize};
use tsify::Tsify;
use wasm_bindgen::prelude::*;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
#[serde(tag = "type", content = "value")]
pub enum SakuraToken {
    /// テキスト文字列
    Text(String),
    /// スコープ変更 (\0, \1, \p[N])
    Scope(u32),
    /// サーフィス変更 (\s[N])
    Surface(i32),
    /// バルーン指定 (\b[N])
    Balloon(i32),
    /// アニメーション再生 (\i[N])
    Animation(i32),
    /// 改行 (\n, \n[half])
    Newline,
    /// 画面クリア (\c)
    Clear,
    /// ウエイト (\w1 ~ \w9, \_w[ms])
    Wait(u32),
    /// 選択肢 (\q[title,id])
    Choice {
        title: String,
        id: String,
        args: Vec<String>,
    },
    /// アンカー (\_a[id]title\_a)
    Anchor { id: String, text: String },
    /// フォント設定 (\f[bold,true], \f[color,r,g,b], \f[height,12] 等 - UKADOC仕様準拠)
    Font { property: String, args: Vec<String> },
    /// 同期モード (\_s)
    Sync(bool),
    /// クイックモード (\_q)
    Quick(bool),
    /// 選択肢スコープ開始 (\__q[id,args...])
    ChoiceScopeBegin { id: String, args: Vec<String> },
    /// 選択肢スコープ終了 (\__q)
    ChoiceScopeEnd,
    /// オートラップ無効化 (\_n)
    NoAutoWrap,
    /// Rawモード切替 (\_?, \_!)
    RawToggle { active: bool, delimiter: String },
    /// 拡張コマンド (\![...])
    Command { command: String, args: Vec<String> },
    /// スクリプト終了 (\e)
    Halt,
}

/// さくらスクリプト文字列をトークン配列へ高速パース
pub fn parse_sakura_script(script: &str) -> Vec<SakuraToken> {
    let mut tokens = Vec::new();
    let mut chars = script.chars().peekable();
    let mut text_buf = String::new();
    let mut raw_mode_delimiter: Option<String> = None;

    while let Some(&ch) = chars.peek() {
        if let Some(ref delim) = raw_mode_delimiter {
            let delim_str = format!("\\{}", delim);
            let remaining: String = chars.clone().collect();
            if remaining.starts_with(&delim_str) {
                if !text_buf.is_empty() {
                    tokens.push(SakuraToken::Text(std::mem::take(&mut text_buf)));
                }
                for _ in 0..delim_str.chars().count() {
                    chars.next();
                }
                tokens.push(SakuraToken::RawToggle {
                    active: false,
                    delimiter: delim.clone(),
                });
                raw_mode_delimiter = None;
            } else {
                text_buf.push(chars.next().unwrap());
            }
            continue;
        }

        if ch == '\\' {
            chars.next(); // consume '\'
            if !text_buf.is_empty() {
                tokens.push(SakuraToken::Text(std::mem::take(&mut text_buf)));
            }

            if let Some(&next_ch) = chars.peek() {
                match next_ch {
                    '\\' | '%' => {
                        let escaped = chars.next().unwrap();
                        text_buf.push(escaped);
                    }
                    '&' => {
                        chars.next();
                        if let Some(arg) = parse_bracket_arg(&mut chars) {
                            match arg.trim().to_lowercase().as_str() {
                                "amp" => text_buf.push('&'),
                                "lt" => text_buf.push('<'),
                                "gt" => text_buf.push('>'),
                                "quot" => text_buf.push('"'),
                                "apos" => text_buf.push('\''),
                                "nbsp" => text_buf.push(' '),
                                _ => {
                                    text_buf.push_str("&[");
                                    text_buf.push_str(&arg);
                                    text_buf.push(']');
                                }
                            }
                        }
                    }
                    '0' => {
                        chars.next();
                        tokens.push(SakuraToken::Scope(0));
                    }
                    '1' => {
                        chars.next();
                        tokens.push(SakuraToken::Scope(1));
                    }
                    'n' => {
                        chars.next();
                        tokens.push(SakuraToken::Newline);
                    }
                    'c' => {
                        chars.next();
                        tokens.push(SakuraToken::Clear);
                    }
                    'e' => {
                        chars.next();
                        tokens.push(SakuraToken::Halt);
                    }
                    's' => {
                        chars.next();
                        if let Some(arg) = parse_bracket_arg(&mut chars) {
                            if let Ok(id) = arg.parse::<i32>() {
                                tokens.push(SakuraToken::Surface(id));
                            }
                        } else if let Some(&digit) = chars.peek()
                            && digit.is_ascii_digit()
                        {
                            chars.next();
                            tokens.push(SakuraToken::Surface((digit as u8 - b'0') as i32));
                        }
                    }
                    'b' => {
                        chars.next();
                        if let Some(arg) = parse_bracket_arg(&mut chars) {
                            if let Ok(id) = arg.parse::<i32>() {
                                tokens.push(SakuraToken::Balloon(id));
                            }
                        } else if let Some(&digit) = chars.peek()
                            && digit.is_ascii_digit()
                        {
                            chars.next();
                            tokens.push(SakuraToken::Balloon((digit as u8 - b'0') as i32));
                        }
                    }
                    'i' => {
                        chars.next();
                        if let Some(arg) = parse_bracket_arg(&mut chars)
                            && let Ok(id) = arg.parse::<i32>()
                        {
                            tokens.push(SakuraToken::Animation(id));
                        }
                    }
                    'w' => {
                        chars.next();
                        if let Some(&digit) = chars.peek()
                            && digit.is_ascii_digit()
                        {
                            chars.next();
                            let wait_ms = ((digit as u8 - b'0') as u32) * 50;
                            tokens.push(SakuraToken::Wait(wait_ms));
                        }
                    }
                    'p' => {
                        chars.next();
                        if let Some(arg) = parse_bracket_arg(&mut chars)
                            && let Ok(scope) = arg.parse::<u32>()
                        {
                            tokens.push(SakuraToken::Scope(scope));
                        }
                    }
                    'q' => {
                        chars.next();
                        if let Some(arg) = parse_bracket_arg(&mut chars) {
                            let parts = split_bracket_args(&arg);
                            if parts.first().map(|s| s.as_str()) == Some("temp") {
                                let title = parts.get(1).cloned().unwrap_or_default();
                                let id = parts.get(2).cloned().unwrap_or_default();
                                let args = if parts.len() > 3 {
                                    parts[3..].to_vec()
                                } else {
                                    vec![]
                                };
                                tokens.push(SakuraToken::Choice { title, id, args });
                            } else {
                                let title = parts.first().cloned().unwrap_or_default();
                                let id = parts.get(1).cloned().unwrap_or_default();
                                let args = parts.into_iter().skip(2).collect();
                                tokens.push(SakuraToken::Choice { title, id, args });
                            }
                        }
                    }
                    'f' => {
                        chars.next();
                        if let Some(arg) = parse_bracket_arg(&mut chars) {
                            let parts = split_bracket_args(&arg);
                            let property = parts.first().cloned().unwrap_or_default();
                            let args = parts.into_iter().skip(1).collect();
                            tokens.push(SakuraToken::Font { property, args });
                        } else {
                            tokens.push(SakuraToken::Font {
                                property: "default".to_string(),
                                args: vec![],
                            });
                        }
                    }
                    '!' => {
                        chars.next();
                        if let Some(arg) = parse_bracket_arg(&mut chars) {
                            let args = split_bracket_args(&arg);
                            let command = args.first().cloned().unwrap_or_default();
                            tokens.push(SakuraToken::Command { command, args });
                        }
                    }
                    '_' => {
                        chars.next(); // consume '_'
                        if let Some(&tag_ch) = chars.peek() {
                            if tag_ch == 'w' {
                                chars.next();
                                if let Some(arg) = parse_bracket_arg(&mut chars)
                                    && let Ok(ms) = arg.parse::<u32>()
                                {
                                    if !text_buf.is_empty() {
                                        tokens
                                            .push(SakuraToken::Text(std::mem::take(&mut text_buf)));
                                    }
                                    tokens.push(SakuraToken::Wait(ms));
                                }
                            } else if tag_ch == '_' {
                                chars.next();
                                if chars.peek() == Some(&'q') {
                                    chars.next();
                                    if !text_buf.is_empty() {
                                        tokens
                                            .push(SakuraToken::Text(std::mem::take(&mut text_buf)));
                                    }
                                    if let Some(arg) = parse_bracket_arg(&mut chars) {
                                        let args: Vec<String> =
                                            arg.split(',').map(|s| s.trim().to_string()).collect();
                                        let id = args.first().cloned().unwrap_or_default();
                                        tokens.push(SakuraToken::ChoiceScopeBegin { id, args });
                                    } else {
                                        tokens.push(SakuraToken::ChoiceScopeEnd);
                                    }
                                } else {
                                    text_buf.push('\\');
                                    text_buf.push('_');
                                    text_buf.push('_');
                                }
                            } else if tag_ch == 'u' {
                                chars.next();
                                if let Some(arg) = parse_bracket_arg(&mut chars) {
                                    let raw = arg.trim();
                                    let code = if raw.starts_with("0x") || raw.starts_with("0X") {
                                        u32::from_str_radix(&raw[2..], 16)
                                    } else {
                                        raw.parse::<u32>()
                                    };
                                    if let Ok(c) = code
                                        && let Some(ch) = char::from_u32(c)
                                    {
                                        text_buf.push(ch);
                                    }
                                }
                            } else if tag_ch == 'm' {
                                chars.next();
                                if let Some(arg) = parse_bracket_arg(&mut chars) {
                                    let raw = arg.trim();
                                    let code = if raw.starts_with("0x") || raw.starts_with("0X") {
                                        u32::from_str_radix(&raw[2..], 16)
                                    } else {
                                        raw.parse::<u32>()
                                    };
                                    if let Ok(c) = code
                                        && c <= 0xff
                                        && let Some(ch) = char::from_u32(c)
                                    {
                                        text_buf.push(ch);
                                    }
                                }
                            } else if tag_ch == 's' {
                                chars.next();
                                tokens.push(SakuraToken::Sync(true));
                            } else if tag_ch == 'q' {
                                chars.next();
                                tokens.push(SakuraToken::Quick(true));
                            } else if tag_ch == 'n' {
                                chars.next();
                                tokens.push(SakuraToken::NoAutoWrap);
                            } else if tag_ch == '?' || tag_ch == '!' {
                                chars.next();
                                let delim = format!("_{}", tag_ch);
                                tokens.push(SakuraToken::RawToggle {
                                    active: true,
                                    delimiter: delim.clone(),
                                });
                                raw_mode_delimiter = Some(delim);
                            } else if tag_ch == 'a' {
                                chars.next(); // consume 'a'
                                if let Some(arg) = parse_bracket_arg(&mut chars) {
                                    let mut anchor_text = String::new();
                                    while let Some(&a_ch) = chars.peek() {
                                        if a_ch == '\\' {
                                            chars.next();
                                            if chars.peek() == Some(&'_') {
                                                chars.next();
                                                if chars.peek() == Some(&'a') {
                                                    chars.next();
                                                    break;
                                                }
                                                anchor_text.push('\\');
                                                anchor_text.push('_');
                                            } else {
                                                anchor_text.push('\\');
                                            }
                                        } else {
                                            anchor_text.push(chars.next().unwrap());
                                        }
                                    }
                                    tokens.push(SakuraToken::Anchor {
                                        id: arg,
                                        text: anchor_text,
                                    });
                                }
                            } else {
                                text_buf.push('\\');
                                text_buf.push('_');
                            }
                        }
                    }
                    _ => {
                        text_buf.push('\\');
                    }
                }
            } else {
                text_buf.push('\\');
            }
        } else {
            text_buf.push(chars.next().unwrap());
        }
    }

    if !text_buf.is_empty() {
        tokens.push(SakuraToken::Text(text_buf));
    }

    tokens
}

fn split_bracket_args(arg: &str) -> Vec<String> {
    let mut args = Vec::new();
    let mut current = String::new();
    let mut in_quote = false;
    let mut chars = arg.chars().peekable();

    while let Some(c) = chars.next() {
        if c == '"' {
            if in_quote && chars.peek() == Some(&'"') {
                current.push('"');
                chars.next();
            } else {
                in_quote = !in_quote;
            }
        } else if c == ',' && !in_quote {
            args.push(current.trim().to_string());
            current.clear();
        } else {
            current.push(c);
        }
    }
    args.push(current.trim().to_string());
    args
}

fn parse_bracket_arg<I: Iterator<Item = char>>(
    chars: &mut std::iter::Peekable<I>,
) -> Option<String> {
    if chars.peek() == Some(&'[') {
        chars.next(); // consume '['
        let mut arg = String::new();
        let mut in_quote = false;

        while let Some(&ch) = chars.peek() {
            if ch == '\\' {
                chars.next(); // consume '\'
                if let Some(&escaped) = chars.peek() {
                    if escaped == ']' || escaped == '\\' {
                        arg.push(chars.next().unwrap());
                    } else {
                        arg.push('\\');
                    }
                }
            } else if ch == '"' {
                in_quote = !in_quote;
                arg.push(chars.next().unwrap());
            } else if ch == ']' && !in_quote {
                chars.next(); // consume ']'
                return Some(arg);
            } else {
                arg.push(chars.next().unwrap());
            }
        }
        Some(arg)
    } else {
        None
    }
}

#[wasm_bindgen]
pub fn wasm_parse_sakura_script(script: &str) -> Result<JsValue, JsValue> {
    let tokens = parse_sakura_script(script);
    Ok(serde_wasm_bindgen::to_value(&tokens)?)
}

/// 実行時環境変数コンテキスト (UKADOC仕様: さくらスクリプト 環境変数)
#[derive(Debug, Clone, Serialize, Deserialize, Tsify)]
pub struct SakuraEnvContext {
    pub username: String,
    pub selfname: String,
    pub keroname: String,
    pub year: u32,
    pub month: u32,
    pub day: u32,
    pub hour: u32,
    pub minute: u32,
    pub second: u32,
    pub system_os: String,
    pub system_version: String,
}

impl Default for SakuraEnvContext {
    fn default() -> Self {
        Self {
            username: "User".to_string(),
            selfname: "Sakura".to_string(),
            keroname: "Kero".to_string(),
            year: 2026,
            month: 10,
            day: 24,
            hour: 12,
            minute: 0,
            second: 0,
            system_os: "Android".to_string(),
            system_version: "1.0.0".to_string(),
        }
    }
}

/// さくらスクリプト内の環境変数 (%username, %selfname, %keroname, %system.os 等) を展開
pub fn expand_sakura_environment_variables(script: &str, ctx: &SakuraEnvContext) -> String {
    let mut result = script.to_string();
    result = result.replace("%username", &ctx.username);
    result = result.replace("%user", &ctx.username);
    result = result.replace("%selfname[0]", &ctx.selfname);
    result = result.replace("%selfname[1]", &ctx.keroname);
    result = result.replace("%selfname", &ctx.selfname);
    result = result.replace("%keroname", &ctx.keroname);
    result = result.replace("%year", &ctx.year.to_string());
    result = result.replace("%month", &ctx.month.to_string());
    result = result.replace("%day", &ctx.day.to_string());
    result = result.replace("%hour", &ctx.hour.to_string());
    result = result.replace("%minute", &ctx.minute.to_string());
    result = result.replace("%second", &ctx.second.to_string());
    result = result.replace("%system.os", &ctx.system_os);
    result = result.replace("%system.version", &ctx.system_version);
    result
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_sakura_script_basic() {
        let script = "\\0\\s[0]こんにちは\\n\\1\\s[10]よろしくね\\e";
        let tokens = parse_sakura_script(script);

        assert_eq!(tokens[0], SakuraToken::Scope(0));
        assert_eq!(tokens[1], SakuraToken::Surface(0));
        assert_eq!(tokens[2], SakuraToken::Text("こんにちは".to_string()));
        assert_eq!(tokens[3], SakuraToken::Newline);
        assert_eq!(tokens[4], SakuraToken::Scope(1));
        assert_eq!(tokens[5], SakuraToken::Surface(10));
        assert_eq!(tokens[6], SakuraToken::Text("よろしくね".to_string()));
        assert_eq!(tokens[7], SakuraToken::Halt);
    }

    #[test]
    fn test_parse_sakura_script_extended() {
        let script = "\\q[選択肢,id1]\\_a[anchor_id]リンク文字\\_a\\b[0]\\i[10]";
        let tokens = parse_sakura_script(script);

        assert_eq!(
            tokens[0],
            SakuraToken::Choice {
                title: "選択肢".to_string(),
                id: "id1".to_string(),
                args: vec![]
            }
        );
        assert_eq!(
            tokens[1],
            SakuraToken::Anchor {
                id: "anchor_id".to_string(),
                text: "リンク文字".to_string()
            }
        );
        assert_eq!(tokens[2], SakuraToken::Balloon(0));
        assert_eq!(tokens[3], SakuraToken::Animation(10));
    }

    #[test]
    fn test_expand_sakura_environment_variables() {
        let ctx = SakuraEnvContext {
            username: "Master".to_string(),
            selfname: "Emily".to_string(),
            keroname: "Kero".to_string(),
            system_os: "Android".to_string(),
            system_version: "1.0.0".to_string(),
            ..Default::default()
        };
        let script = "こんにちは %username さん。私は %selfname です。OSは %system.os (%system.version) です。";
        let expanded = expand_sakura_environment_variables(script, &ctx);
        assert_eq!(
            expanded,
            "こんにちは Master さん。私は Emily です。OSは Android (1.0.0) です。"
        );
    }

    #[test]
    fn test_parse_sakura_script_font_multi_args() {
        let script = "\\f[color,255,128,0]赤文字\\f[default]";
        let tokens = parse_sakura_script(script);

        assert_eq!(
            tokens[0],
            SakuraToken::Font {
                property: "color".to_string(),
                args: vec!["255".to_string(), "128".to_string(), "0".to_string()]
            }
        );
        assert_eq!(tokens[1], SakuraToken::Text("赤文字".to_string()));
        assert_eq!(
            tokens[2],
            SakuraToken::Font {
                property: "default".to_string(),
                args: vec![]
            }
        );
    }

    #[test]
    fn test_parse_sakura_script_cycle6_extensions() {
        // \_u[0x41] -> A, \_m[66] -> B, \&[amp] -> &
        let script = "\\_u[0x41]\\_m[66]\\&[amp]";
        let tokens = parse_sakura_script(script);
        assert_eq!(tokens[0], SakuraToken::Text("A".to_string()));
        assert_eq!(tokens[1], SakuraToken::Text("B".to_string()));
        assert_eq!(tokens[2], SakuraToken::Text("&".to_string()));

        // \__q
        let script_q = "\\__q[OnChoice,arg1]Choice text\\__q";
        let tokens_q = parse_sakura_script(script_q);
        assert_eq!(
            tokens_q[0],
            SakuraToken::ChoiceScopeBegin {
                id: "OnChoice".to_string(),
                args: vec!["OnChoice".to_string(), "arg1".to_string()]
            }
        );
        assert_eq!(tokens_q[1], SakuraToken::Text("Choice text".to_string()));
        assert_eq!(tokens_q[2], SakuraToken::ChoiceScopeEnd);
    }
}
