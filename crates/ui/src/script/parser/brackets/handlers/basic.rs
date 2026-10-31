use super::super::super::SakuraCommand;
use super::super::utils::{read_bracketed, read_digit, CharsIter};

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
    let parts: Vec<&str> = content.split(',').map(|s| s.trim()).collect();
    if parts.len() >= 3 && parts[0] == "temp" {
        let label = parts[1].to_string();
        let id = parts[2].to_string();
        let args = if parts.len() > 3 {
            parts[3..].iter().map(|s| s.to_string()).collect()
        } else {
            Vec::new()
        };
        return Some((label, id, args));
    }
    let label = parts.first().copied().unwrap_or("").to_string();
    let id = parts.get(1).copied().unwrap_or("").to_string();
    let args = if parts.len() > 2 {
        parts[2..].iter().map(|s| s.to_string()).collect()
    } else {
        Vec::new()
    };
    Some((label, id, args))
}
