//! ブラケット引数パース用内部ヘルパー

pub fn split_bracket_args(arg: &str) -> Vec<String> {
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

pub fn parse_bracket_arg<I: Iterator<Item = char>>(
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
