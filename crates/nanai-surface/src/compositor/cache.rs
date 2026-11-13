//! LRU Image Cache for Composite Surface Framebuffers
//!
//! Controls memory footprint by maintaining an upper limit (e.g., 20 MB default)
//! and releasing outdated composed surface images under memory pressure (e.g., onTrimMemory).

use std::collections::{HashMap, VecDeque};
use std::sync::Mutex;

use super::framebuffer::SurfaceFrameBuffer;

/// LRU Cache Manager for Surface Framebuffers
pub struct SurfaceLruCache {
    max_bytes: usize,
    current_bytes: usize,
    map: HashMap<String, SurfaceFrameBuffer>,
    order: VecDeque<String>,
}

impl SurfaceLruCache {
    /// Create a new cache with a maximum capacity in bytes (default 20MB)
    pub fn new(max_bytes: usize) -> Self {
        Self {
            max_bytes,
            current_bytes: 0,
            map: HashMap::new(),
            order: VecDeque::new(),
        }
    }

    /// Insert or update a framebuffer in cache
    pub fn insert(&mut self, key: &str, fb: SurfaceFrameBuffer) {
        let size = fb.data.len();

        if let Some(old) = self.map.insert(key.to_string(), fb) {
            self.current_bytes = self.current_bytes.saturating_sub(old.data.len());
        } else {
            self.order.push_back(key.to_string());
        }
        self.current_bytes += size;

        self.evict_if_needed();
    }

    /// Retrieve a framebuffer from cache (updates LRU order)
    pub fn get(&mut self, key: &str) -> Option<&SurfaceFrameBuffer> {
        if self.map.contains_key(key) {
            self.order.retain(|k| k != key);
            self.order.push_back(key.to_string());
            self.map.get(key)
        } else {
            None
        }
    }

    /// Evict oldest entries until current size is below max_bytes
    fn evict_if_needed(&mut self) {
        while self.current_bytes > self.max_bytes && !self.order.is_empty() {
            if let Some(oldest_key) = self.order.pop_front()
                && let Some(removed) = self.map.remove(&oldest_key) {
                    self.current_bytes = self.current_bytes.saturating_sub(removed.data.len());
                }
        }
    }

    /// Clear all cached framebuffers (e.g., on `onTrimMemory` or ghost unload)
    pub fn clear(&mut self) {
        self.map.clear();
        self.order.clear();
        self.current_bytes = 0;
    }

    /// Get current total memory used by cached framebuffers (bytes)
    pub fn current_bytes(&self) -> usize {
        self.current_bytes
    }

    /// Get current number of items
    pub fn len(&self) -> usize {
        self.map.len()
    }

    pub fn is_empty(&self) -> bool {
        self.map.is_empty()
    }
}

/// Global thread-safe LRU Surface Cache (Default: 20 MB capacity)
pub static GLOBAL_SURFACE_CACHE: std::sync::LazyLock<Mutex<SurfaceLruCache>> =
    std::sync::LazyLock::new(|| Mutex::new(SurfaceLruCache::new(20 * 1024 * 1024)));

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_surface_lru_cache_eviction() {
        // Cache max 1000 bytes
        let mut cache = SurfaceLruCache::new(1000);
        let fb1 = SurfaceFrameBuffer::new(10, 10); // 10*10*4 = 400 bytes
        let fb2 = SurfaceFrameBuffer::new(10, 10); // 400 bytes
        let fb3 = SurfaceFrameBuffer::new(10, 10); // 400 bytes -> Total 1200 > 1000 => fb1 evicted

        cache.insert("surface_0", fb1);
        cache.insert("surface_1", fb2);
        assert_eq!(cache.len(), 2);
        assert_eq!(cache.current_bytes(), 800);

        cache.insert("surface_2", fb3);
        assert_eq!(cache.len(), 2);
        assert_eq!(cache.current_bytes(), 800);

        // surface_0 should be evicted
        assert!(cache.get("surface_0").is_none());
        assert!(cache.get("surface_1").is_some());
        assert!(cache.get("surface_2").is_some());

        // Clear cache
        cache.clear();
        assert_eq!(cache.len(), 0);
        assert_eq!(cache.current_bytes(), 0);
    }
}
