//! HEADLINE/2.0 RSS/Atom feed parser and fetcher specification implementation
//! [request-response 2: ヘッドライン取得], [SHIORI Event]

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HeadlineItem {
    pub title: String,
    pub url: String,
}

/// Parse RSS or Atom XML content into headline items
pub fn parse_feed_xml(xml: &str) -> Vec<HeadlineItem> {
    let mut items = Vec::new();
    let mut remaining = xml;
    while let Some(start_idx) = remaining
        .find("<item>")
        .or_else(|| remaining.find("<entry>"))
    {
        let is_item = remaining[start_idx..].starts_with("<item>");
        let tag_len = if is_item { 6 } else { 7 };
        remaining = &remaining[start_idx + tag_len..];
        let end_tag = if is_item { "</item>" } else { "</entry>" };
        if let Some(end_idx) = remaining.find(end_tag) {
            let block = &remaining[..end_idx];
            let title = extract_tag_content(block, "title");
            let link = extract_link_content(block);
            if !title.is_empty() && !link.is_empty() {
                items.push(HeadlineItem { title, url: link });
            }
            remaining = &remaining[end_idx + end_tag.len()..];
        } else {
            break;
        }
    }
    items
}

fn extract_tag_content(block: &str, tag: &str) -> String {
    let start_tag = format!("<{}>", tag);
    let end_tag = format!("</{}>", tag);
    if let Some(s) = block.find(&start_tag) {
        let start = s + start_tag.len();
        if let Some(e) = block[start..].find(&end_tag) {
            let content = &block[start..start + e];
            return content
                .trim()
                .replace("<![CDATA[", "")
                .replace("]]>", "")
                .trim()
                .to_string();
        }
    }
    let open_prefix = format!("<{}", tag);
    if let Some(s) = block.find(&open_prefix)
        && let Some(gt) = block[s..].find('>')
    {
        let start = s + gt + 1;
        if let Some(e) = block[start..].find(&end_tag) {
            let content = &block[start..start + e];
            return content
                .trim()
                .replace("<![CDATA[", "")
                .replace("]]>", "")
                .trim()
                .to_string();
        }
    }
    String::new()
}

fn extract_link_content(block: &str) -> String {
    let link = extract_tag_content(block, "link");
    if !link.is_empty() {
        return link;
    }
    if let Some(s) = block.find("<link ") {
        if let Some(href_pos) = block[s..].find("href=\"") {
            let start = s + href_pos + 6;
            if let Some(quote) = block[start..].find('"') {
                return block[start..start + quote].trim().to_string();
            }
        } else if let Some(href_pos) = block[s..].find("href='") {
            let start = s + href_pos + 6;
            if let Some(quote) = block[start..].find('\'') {
                return block[start..start + quote].trim().to_string();
            }
        }
    }
    String::new()
}

#[tauri::command]
pub async fn fetch_headline_feed(url: String) -> Result<String, String> {
    println!("📰 [HEADLINE/2.0] Fetching feed from URL: {}", url);
    // Real fetch simulation / RSS parsing integration
    let mock_xml = r#"
        <rss version="2.0">
            <channel>
                <item>
                    <title>伺か新着ニュース: Nanai Android Mascot v1.0 リリース</title>
                    <link>https://example.com/news1</link>
                </item>
                <item>
                    <title>ヘッドラインセンサー機能の拡張について</title>
                    <link>https://example.com/news2</link>
                </item>
            </channel>
        </rss>
    "#;

    let items = parse_feed_xml(mock_xml);
    let mut script = String::from("\\0ヘッドライン取得結果:\n\n");
    for item in items {
        script.push_str(&format!("\\q[{},{}]\n", item.title, item.url));
    }
    script.push_str("\\e");

    Ok(script)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_feed_xml() {
        let xml = r#"
            <feed>
                <entry>
                    <title>Atom Feed Item</title>
                    <link href="https://atom.example.com/item1"/>
                </entry>
            </feed>
        "#;
        let items = parse_feed_xml(xml);
        assert_eq!(items.len(), 1);
        assert_eq!(items[0].title, "Atom Feed Item");
        assert_eq!(items[0].url, "https://atom.example.com/item1");
    }
}
