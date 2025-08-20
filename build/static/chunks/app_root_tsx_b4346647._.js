(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/root.tsx [app-client] (ecmascript, next/dynamic entry, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "static/chunks/node_modules_05d983ea._.js",
  "static/chunks/app_e3293a00._.js",
  "static/chunks/app_root_tsx_0c524773._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[project]/app/root.tsx [app-client] (ecmascript, next/dynamic entry)");
    });
});
}),
]);