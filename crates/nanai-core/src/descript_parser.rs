//! descript.txt (UKADOC / SSP 仕様準拠) 高速パーサー & プロパティ辞書エンジン

use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct DescriptManifest {
	pub properties: BTreeMap<String, String>,
}

impl DescriptManifest {
	pub fn get(&self, key: &str) -> Option<&str> {
		self.properties.get(&key.to_lowercase()).map(|s| s.as_str())
	}
}

/// descript.txt テキスト文字列を構造化辞書へパース
pub fn parse_descript_text(content: &str) -> DescriptManifest {
	let mut properties = BTreeMap::new();

	for line in content.lines() {
		let line = line.trim();
		// コメント行 (#, //) または空行をスキップ
		if line.is_empty() || line.starts_with('#') || line.starts_with("//") {
			continue;
		}

		if let Some((key, val)) = line.split_once(',') {
			let k = key.trim().to_lowercase();
			let v = val.trim().to_string();
			properties.insert(k, v);
		} else if let Some((key, val)) = line.split_once('=') {
			let k = key.trim().to_lowercase();
			let v = val.trim().to_string();
			properties.insert(k, v);
		}
	}

	DescriptManifest { properties }
}

// WASM C-ABI Export
/// # Safety
/// `ptr` must be a valid pointer to bytes of length `len`.
#[unsafe(no_mangle)]
pub unsafe extern "C" fn wasm_parse_descript_json(ptr: *const u8, len: usize) -> u64 {
	if ptr.is_null() || len == 0 {
		return 0;
	}
	let slice = unsafe { std::slice::from_raw_parts(ptr, len) };
	if let Ok(content) = std::str::from_utf8(slice) {
		let manifest = parse_descript_text(content);
		if let Ok(json) = serde_json::to_string(&manifest) {
			let bytes = json.into_bytes();
			let len = bytes.len();
			let ptr = crate::wasm_alloc(len);
			unsafe {
				std::ptr::copy_nonoverlapping(bytes.as_ptr(), ptr, len);
			}
			return ((ptr as u64) << 32) | (len as u64);
		}
	}
	0
}

#[cfg(test)]
mod tests {
	use super::*;

	#[test]
	fn test_parse_descript_text_basic() {
		let content = "type,ghost\nname,Emily\ncraftman,Nanai\n# comment\nshiori,yaya.dll\n";
		let manifest = parse_descript_text(content);

		assert_eq!(manifest.get("type"), Some("ghost"));
		assert_eq!(manifest.get("name"), Some("Emily"));
		assert_eq!(manifest.get("craftman"), Some("Nanai"));
		assert_eq!(manifest.get("shiori"), Some("yaya.dll"));
	}

	#[test]
	fn test_parse_descript_text_equals() {
		let content = "charset=UTF-8\nmenu.background.bitmap=menu_bg.png\n";
		let manifest = parse_descript_text(content);

		assert_eq!(manifest.get("charset"), Some("UTF-8"));
		assert_eq!(
			manifest.get("menu.background.bitmap"),
			Some("menu_bg.png")
		);
	}
}
