use super::super::utils::{CharsIter, read_bracketed, read_digit, split_bracket_args};

pub(crate) fn handle_target_p(chars: &mut CharsIter<'_>) -> Option<u8> {
    if let Some(bracketed) = read_bracketed(chars) {
        bracketed.trim().parse().ok()
    } else {
        read_digit(chars).map(|d| d as u8)
    }
}

pub(crate) fn handle_surface(chars: &mut CharsIter<'_>) -> Option<u32> {
    if let Some(num) = read_bracketed(chars) {
        num.parse().ok()
    } else {
        read_digit(chars)
    }
}

pub(crate) fn handle_wait_short(chars: &mut CharsIter<'_>) -> Option<u32> {
    read_digit(chars).map(|d| d * 50)
}

pub(crate) fn handle_newline(chars: &mut CharsIter<'_>) -> Option<bool> {
    let arg = read_bracketed(chars);
    if let Some(s) = arg.as_deref() {
        if s.eq_ignore_ascii_case("half") {
            return Some(true);
        }
        if let Ok(pct) = s.parse::<u32>() {
            return Some(pct <= 50);
        }
    }
    Some(false)
}

pub(crate) fn handle_animation(chars: &mut CharsIter<'_>) -> Option<(u32, bool)> {
    let content = match read_bracketed(chars) {
        Some(c) => c,
        None => {
            return read_digit(chars).map(|d| (d, false));
        }
    };
    let mut parts = content.split(',');
    let id_raw = parts.next().unwrap_or("").trim();
    if id_raw.is_empty() {
        return None;
    }
    let id: u32 = id_raw.parse().ok()?;
    let wait = parts.next().is_some_and(|p| p.trim() == "wait");
    Some((id, wait))
}

pub(crate) fn handle_balloon(chars: &mut CharsIter<'_>) -> Option<i32> {
    if let Some(num) = read_bracketed(chars) {
        num.trim().parse().ok()
    } else {
        read_digit(chars).map(|d| d as i32)
    }
}

pub(crate) fn handle_font(chars: &mut CharsIter<'_>) -> Option<(String, Option<String>)> {
    let content = read_bracketed(chars)?;
    let mut parts = content.splitn(2, ',');
    let tag = parts.next().unwrap_or("").trim().to_string();
    let param = parts.next().map(|p| p.trim().to_string());
    Some((tag, param))
}

pub(crate) fn handle_choice(chars: &mut CharsIter<'_>) -> Option<(String, String, Vec<String>)> {
    let content = read_bracketed(chars)?;
    let parts = split_bracket_args(&content);
    if parts.len() >= 3 && parts[0] == "temp" {
        let label = parts[1].clone();
        let id = parts[2].clone();
        let args = if parts.len() > 3 {
            parts[3..].to_vec()
        } else {
            Vec::new()
        };
        return Some((label, id, args));
    }
    let label = parts.first().cloned().unwrap_or_default();
    let id = parts.get(1).cloned().unwrap_or_default();
    let args = if parts.len() > 2 {
        parts[2..].to_vec()
    } else {
        Vec::new()
    };
    Some((label, id, args))
}

pub(crate) fn handle_postmessage(chars: &mut CharsIter<'_>) -> Option<(String, String, String)> {
    let content = read_bracketed(chars)?;
    let parts = split_bracket_args(&content);
    let umsg = parts.first().cloned().unwrap_or_default();
    let wparam = parts.get(1).cloned().unwrap_or_default();
    let lparam = parts.get(2).cloned().unwrap_or_default();
    Some((umsg, wparam, lparam))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_basic_handlers_edge_cases() {
        let mut chars = "invalid".chars().peekable();
        assert_eq!(handle_target_p(&mut chars), None);

        let mut chars = "[abc]".chars().peekable();
        assert_eq!(handle_surface(&mut chars), None);

        let mut chars = "[half]".chars().peekable();
        assert_eq!(handle_newline(&mut chars), Some(true));

        let mut chars = "[30]".chars().peekable();
        assert_eq!(handle_newline(&mut chars), Some(true));

        let mut chars = "[80]".chars().peekable();
        assert_eq!(handle_newline(&mut chars), Some(false));

        let mut chars = "[invalid]".chars().peekable();
        assert_eq!(handle_newline(&mut chars), Some(false));

        let mut chars = "3".chars().peekable();
        assert_eq!(handle_newline(&mut chars), Some(false));

        let mut chars = "".chars().peekable();
        assert_eq!(handle_animation(&mut chars), None);

        let mut chars = "[]".chars().peekable();
        assert_eq!(handle_animation(&mut chars), None);

        let mut chars = "[ , wait]".chars().peekable();
        assert_eq!(handle_animation(&mut chars), None);

        let mut chars = "[abc]".chars().peekable();
        assert_eq!(handle_animation(&mut chars), None);

        let mut chars = "[10, wait]".chars().peekable();
        assert_eq!(handle_animation(&mut chars), Some((10, true)));

        let mut chars = "5".chars().peekable();
        assert_eq!(handle_animation(&mut chars), Some((5, false)));

        let mut chars = "[invalid]".chars().peekable();
        assert_eq!(handle_balloon(&mut chars), None);

        let mut chars = "no_brackets".chars().peekable();
        assert_eq!(handle_font(&mut chars), None);

        let mut chars = "[Arial, 12]".chars().peekable();
        assert_eq!(
            handle_font(&mut chars),
            Some(("Arial".to_string(), Some("12".to_string())))
        );

        let mut chars = "no_brackets".chars().peekable();
        assert_eq!(handle_choice(&mut chars), None);

        let mut chars = "[temp, Label, ID, arg1, arg2]".chars().peekable();
        let (label, id, args) = handle_choice(&mut chars).unwrap();
        assert_eq!(label, "Label");
        assert_eq!(id, "ID");
        assert_eq!(args, vec!["arg1", "arg2"]);

        let mut chars = "[Label, ID]".chars().peekable();
        let (label, id, args) = handle_choice(&mut chars).unwrap();
        assert_eq!(label, "Label");
        assert_eq!(id, "ID");
        assert!(args.is_empty());

        let mut chars = "[Label, ID, arg1]".chars().peekable();
        let (_, _, args) = handle_choice(&mut chars).unwrap();
        assert_eq!(args, vec!["arg1"]);

        let mut chars = "no_brackets".chars().peekable();
        assert_eq!(handle_postmessage(&mut chars), None);

        let mut chars = "[msg, w, l]".chars().peekable();
        assert_eq!(
            handle_postmessage(&mut chars),
            Some(("msg".to_string(), "w".to_string(), "l".to_string()))
        );
    }
}
