//! さくらスクリプト (Sakura Script) 高速パーサー
//! UKADOC (SSP仕様) 準拠のトークナイザー / AST 生成モジュール

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
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
    Choice { title: String, id: String },
    /// アンカー (\_a[id]title\_a)
    Anchor { id: String, text: String },
    /// フォント設定 (\f[bold,true], \f[height,12] 等)
    Font { name: String, value: String },
    /// スクリプト終了 (\e)
    Halt,
}

/// さくらスクリプト文字列をトークン配列へ高速パース
pub fn parse_sakura_script(script: &str) -> Vec<SakuraToken> {
    let mut tokens = Vec::new();
    let mut chars = script.chars().peekable();
    let mut text_buf = String::new();

    while let Some(&ch) = chars.peek() {
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
                            let parts: Vec<&str> = arg.split(',').collect();
                            let title = parts.first().copied().unwrap_or("").to_string();
                            let id = parts.get(1).copied().unwrap_or("").to_string();
                            tokens.push(SakuraToken::Choice { title, id });
                        }
                    }
                    'f' => {
                        chars.next();
                        if let Some(arg) = parse_bracket_arg(&mut chars) {
                            let parts: Vec<&str> = arg.split(',').collect();
                            let name = parts.first().copied().unwrap_or("").to_string();
                            let value = parts.get(1).copied().unwrap_or("").to_string();
                            tokens.push(SakuraToken::Font { name, value });
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
                                    tokens.push(SakuraToken::Wait(ms));
                                }
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

fn parse_bracket_arg<I: Iterator<Item = char>>(
    chars: &mut std::iter::Peekable<I>,
) -> Option<String> {
    if chars.peek() == Some(&'[') {
        chars.next(); // consume '['
        let mut arg = String::new();
        while let Some(&ch) = chars.peek() {
            if ch == ']' {
                chars.next(); // consume ']'
                return Some(arg);
            }
            arg.push(chars.next().unwrap());
        }
        Some(arg)
    } else {
        None
    }
}

// WASM C-ABI Export
/// # Safety
/// `ptr` must be a valid pointer to bytes of length `len`.
#[unsafe(no_mangle)]
pub unsafe extern "C" fn wasm_parse_sakura_script(ptr: *const u8, len: usize) -> *mut SakuraToken {
    if ptr.is_null() || len == 0 {
        return std::ptr::null_mut();
    }
    let slice = unsafe { std::slice::from_raw_parts(ptr, len) };
    if let Ok(script) = std::str::from_utf8(slice) {
        let tokens = parse_sakura_script(script);
        let boxed = Box::new(tokens);
        Box::into_raw(boxed) as *mut SakuraToken
    } else {
        std::ptr::null_mut()
    }
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
                id: "id1".to_string()
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
}
