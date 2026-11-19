//! ゴーストルート直下の付属ファイル（.narignore 系 / readme / terms / thumbnail）の読込。

use std::path::{Path, PathBuf};

/// `.narignore` 等のパターンファイル。`#` / `//` 行はコメント。
#[derive(Debug, Default, Clone)]
pub struct PatternSet {
    patterns: Vec<String>,
}

fn glob_match(p: &[char], t: &[char]) -> bool {
    match p.first() {
        None => t.is_empty(),
        Some('*') => (0..=t.len()).any(|i| glob_match(&p[1..], &t[i..])),
        Some('?') => !t.is_empty() && glob_match(&p[1..], &t[1..]),
        Some(c) => t.first() == Some(c) && glob_match(&p[1..], &t[1..]),
    }
}

fn glob(pattern: &str, text: &str) -> bool {
    let p: Vec<char> = pattern.to_lowercase().chars().collect();
    let t: Vec<char> = text.to_lowercase().chars().collect();
    glob_match(&p, &t)
}

impl PatternSet {
    pub fn parse(content: &str) -> Self {
        let patterns = content
            .lines()
            .map(|l| l.trim().replace('\\', "/"))
            .filter(|l| !l.is_empty() && !l.starts_with('#') && !l.starts_with("//"))
            .map(|l| {
                l.trim_start_matches("./")
                    .trim_start_matches('/')
                    .to_string()
            })
            .collect();
        Self { patterns }
    }

    pub fn load(path: &Path) -> Option<Self> {
        std::fs::read_to_string(path).ok().map(|c| Self::parse(&c))
    }

    pub fn is_empty(&self) -> bool {
        self.patterns.is_empty()
    }

    /// `rel` はルートからの `/` 区切り相対パス。ディレクトリパターン（末尾 `/`）は配下も対象。
    pub fn matches(&self, rel: &str) -> bool {
        let rel = rel.trim_end_matches('/');
        self.patterns.iter().any(|pat| {
            let dir_only = pat.ends_with('/');
            let pat = pat.trim_end_matches('/');
            let segs: Vec<&str> = rel.split('/').collect();
            if pat.contains('/') {
                (1..=segs.len()).any(|n| {
                    (n < segs.len() || !dir_only || true) && glob(pat, &segs[..n].join("/"))
                })
            } else {
                segs.iter()
                    .enumerate()
                    .any(|(i, s)| glob(pat, s) && (!dir_only || i + 1 < segs.len()))
            }
        })
    }
}

/// NAR/更新ファイル作成時のフィルタ（ignore + include）。
#[derive(Debug, Default, Clone)]
pub struct IncludeFilter {
    ignore: Option<PatternSet>,
    include: Option<PatternSet>,
}

impl IncludeFilter {
    pub fn load_nar(root: &Path) -> Self {
        Self {
            ignore: PatternSet::load(&root.join(".narignore")),
            include: PatternSet::load(&root.join(".narinclude")),
        }
    }

    pub fn load_update(root: &Path) -> Self {
        Self {
            ignore: PatternSet::load(&root.join(".updateignore")),
            include: PatternSet::load(&root.join(".updateinclude")),
        }
    }

    /// 除外すべきなら true。include 指定がある場合は一致しないものを除外。
    pub fn excludes(&self, rel: &str) -> bool {
        if let Some(inc) = &self.include
            && !inc.is_empty()
            && !inc.matches(rel)
        {
            return true;
        }
        self.ignore.as_ref().is_some_and(|ig| ig.matches(rel))
    }
}

fn find_ci(dir: &Path, names: &[&str]) -> Option<PathBuf> {
    let entries = std::fs::read_dir(dir).ok()?;
    let files: Vec<(String, PathBuf)> = entries
        .flatten()
        .filter(|e| e.path().is_file())
        .map(|e| (e.file_name().to_string_lossy().to_lowercase(), e.path()))
        .collect();
    names
        .iter()
        .find_map(|n| files.iter().find(|(f, _)| f == n).map(|(_, p)| p.clone()))
}

/// `readme.txt` 優先、無ければ `readme.md`。
pub fn find_ghost_readme(ghost_dir: &Path) -> Option<PathBuf> {
    find_ci(ghost_dir, &["readme.txt", "readme.md"])
}

/// `terms.txt` 優先、無ければ `terms.md`。
pub fn find_ghost_terms(ghost_dir: &Path) -> Option<PathBuf> {
    find_ci(ghost_dir, &["terms.txt", "terms.md"])
}

pub fn read_ghost_terms(ghost_dir: &Path) -> Option<String> {
    std::fs::read_to_string(find_ghost_terms(ghost_dir)?).ok()
}

/// `thumbnail.png` / `thumbnail.jpg` / `thumbnail.pnr`（左上1px透過用）の順に探す。
pub fn find_ghost_thumbnail(ghost_dir: &Path) -> Option<PathBuf> {
    find_ci(
        ghost_dir,
        &[
            "thumbnail.png",
            "thumbnail.jpg",
            "thumbnail.jpeg",
            "thumbnail.pnr",
        ],
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn patterns_match() {
        let p = PatternSet::parse("# c\n*.bak\nprofile/\nshell/master/x.png\n");
        assert!(p.matches("a/b.BAK"));
        assert!(p.matches("profile/x.txt"));
        assert!(!p.matches("profile"));
        assert!(p.matches("shell/master/x.png"));
        assert!(!p.matches("shell/master/y.png"));
    }

    #[test]
    fn include_filter_and_files() {
        let d = std::env::temp_dir().join(format!("nam_pf_{}", std::process::id()));
        std::fs::create_dir_all(&d).unwrap();
        std::fs::write(d.join(".narinclude"), "ghost/\n").unwrap();
        std::fs::write(d.join(".narignore"), "*.tmp\n").unwrap();
        std::fs::write(d.join("README.md"), "r").unwrap();
        std::fs::write(d.join("Terms.txt"), "t").unwrap();
        std::fs::write(d.join("thumbnail.pnr"), "p").unwrap();
        let f = IncludeFilter::load_nar(&d);
        assert!(!f.excludes("ghost/a.dll"));
        assert!(f.excludes("ghost/a.tmp"));
        assert!(f.excludes("other.txt"));
        assert!(find_ghost_readme(&d).is_some());
        assert_eq!(read_ghost_terms(&d).as_deref(), Some("t"));
        assert!(find_ghost_thumbnail(&d).is_some());
        std::fs::remove_dir_all(&d).ok();
    }
}
