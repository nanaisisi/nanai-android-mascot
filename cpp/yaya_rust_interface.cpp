/*
 * YAYA SHIORI Rust Integration Implementation
 * 
 * YAYAのC++コードをRustから呼び出すためのC言語インターフェイス実装
 */

#include "yaya_rust_interface.h"

#if defined(WIN32) || defined(_WIN32_WCE)
    #include <windows.h>
    #ifndef PATH_MAX
        #define PATH_MAX 260
    #endif
#elif defined(ANDROID)
    #ifndef PATH_MAX
        #define PATH_MAX 4096
    #endif
    #include <limits.h>
#else
    #include <limits.h>
#endif

#include <cstring>
#include <cstdlib>

#include "aya5.h"

// YAYAの初期化状態管理
static bool g_yaya_initialized = false;
static char g_ghost_directory[PATH_MAX] = {0};

// C言語インターフェイス実装

extern "C" {

int yaya_initialize() {
    if (g_yaya_initialized) {
        return 1; // 既に初期化済み
    }
    
    g_yaya_initialized = true;
    return 1;
}

int yaya_finalize() {
    if (!g_yaya_initialized) {
        return 1;
    }
    
    unload();
    g_ghost_directory[0] = '\0';
    g_yaya_initialized = false;
    return 1;
}

int yaya_set_directory(const char* dir_path) {
    if (!dir_path) {
        return 0;
    }
    
    strncpy(g_ghost_directory, dir_path, sizeof(g_ghost_directory) - 1);
    g_ghost_directory[sizeof(g_ghost_directory) - 1] = '\0';
    return 1;
}

int yaya_set_encoding(int encoding_type) {
    (void)encoding_type;
    return 1;
}

int yaya_load(HANDLE_TYPE h, LONG length) {
    if (!g_yaya_initialized) {
        return 0;
    }
    
    yaya::global_t load_h = nullptr;
    long load_len = length;

    if (h != nullptr && length > 0) {
        load_h = static_cast<yaya::global_t>(h);
    } else if (g_ghost_directory[0] != '\0') {
        load_len = static_cast<long>(strlen(g_ghost_directory));
#if defined(WIN32) || defined(_WIN32_WCE)
        HGLOBAL hg = ::GlobalAlloc(GMEM_FIXED, load_len + 1);
        if (hg) {
            memcpy(hg, g_ghost_directory, load_len + 1);
            load_h = static_cast<yaya::global_t>(hg);
        }
#else
        char* buf = static_cast<char*>(malloc(load_len + 1));
        if (buf) {
            memcpy(buf, g_ghost_directory, load_len + 1);
            load_h = buf;
        }
#endif
    }

    if (!load_h) {
        return 0;
    }

    BOOL_TYPE res = load(load_h, load_len);
    return res ? 1 : 0;
}

int yaya_unload() {
    if (!g_yaya_initialized) {
        return 0;
    }
    
    BOOL_TYPE res = unload();
    return res ? 1 : 0;
}

char* yaya_request(HANDLE_TYPE h, LONG* length) {
    if (!g_yaya_initialized || length == nullptr) {
        return nullptr;
    }

    const char* input_str = reinterpret_cast<const char*>(h);
    long req_len = (*length > 0) ? *length : (input_str ? static_cast<long>(strlen(input_str)) : 0);

    if (req_len <= 0 && !input_str) {
        *length = 0;
        return nullptr;
    }

    yaya::global_t req_h = nullptr;
#if defined(WIN32) || defined(_WIN32_WCE)
    HGLOBAL hg = ::GlobalAlloc(GMEM_FIXED, req_len + 1);
    if (hg) {
        if (input_str) {
            memcpy(hg, input_str, req_len);
        }
        static_cast<char*>(hg)[req_len] = '\0';
        req_h = static_cast<yaya::global_t>(hg);
    }
#else
    char* buf = static_cast<char*>(malloc(req_len + 1));
    if (buf) {
        if (input_str) {
            memcpy(buf, input_str, req_len);
        }
        buf[req_len] = '\0';
        req_h = buf;
    }
#endif

    if (!req_h) {
        *length = 0;
        return nullptr;
    }

    long res_len = req_len;
    yaya::global_t res_h = request(req_h, &res_len);

    if (!res_h) {
        *length = 0;
        return nullptr;
    }

    *length = static_cast<LONG>(res_len);
    return static_cast<char*>(res_h);
}

const char* yaya_get_version() {
    return "YAYA Rust Integration v0.2.0";
}

const char* yaya_get_name() {
    return "YAYA Integration";
}

void yaya_free_string(char* str) {
    if (str) {
#if defined(WIN32) || defined(_WIN32_WCE)
        ::GlobalFree(str);
#else
        free(str);
#endif
    }
}

} // extern "C"
