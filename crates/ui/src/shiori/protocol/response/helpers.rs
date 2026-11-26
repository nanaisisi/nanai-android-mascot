//! SHIORI/3.0 レスポンスヘッダパース・テキストフォーマット補助関数

pub(crate) fn key_str_prefix(key: &str) -> Option<String> {
    let key = key.strip_prefix("X-SSTP-PassThru-")?;
    Some(key.to_string())
}

pub(crate) fn is_header_key(key: &str) -> bool {
    !key.is_empty()
        && key
            .chars()
            .all(|c| c.is_ascii_alphanumeric() || c == '-' || c == '_')
}

#[allow(non_camel_case_types)]
pub(crate) struct Write_multiline_headerParams<'a> {
    pub out: &'a mut String,
    pub name: &'a str,
    pub value: &'a str,
}

pub(crate) fn write_multiline_header(params: Write_multiline_headerParams<'_>) {
    let Write_multiline_headerParams { out, name, value } = params;
    let mut lines = value.split('\n');
    let first = lines.next().unwrap_or("");
    out.push_str(&format!("{}: {}\r\n", name, first));
    for line in lines {
        out.push_str(line);
        out.push_str("\r\n");
    }
}
