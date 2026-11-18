window.ModuleLoader = (function () {
    const SCAN_KEY = "planner_discovered_plugins_v1";
    const CORE_SCRIPTS = Array.of(
        "scripts/core/event-bus.js",
        "scripts/core/store.js",
        "scripts/core/plugin-manager.js"
    );

    function loadStyle(href) {
        if (document.querySelector(`link[href="${href}"]`)) return;
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = href;
        document.head.appendChild(link);
    }

    function loadScript(src) {
        return new Promise(resolve => {
            const s = document.createElement("script");
            s.src = src;
            s.async = false;
            s.onload = () => resolve(true);
            s.onerror = () => { s.remove(); resolve(false); };
            document.body.appendChild(s);
        });
    }

    async function loadSequential(list) {
        for (const src of list) await loadScript(src);
    }

    async function loadPluginFolder(pluginName, files, styles = Array.of()) {
        const base = `scripts/plugins/${pluginName}`;
        styles.forEach(css => loadStyle(`${base}/${css}`));
        await loadSequential(files.map(f => `${base}/${f}`));
    }

    function scanPluginsFolder() {
        const input = document.createElement("input");
        input.type = "file";
        input.webkitdirectory = true;
        input.addEventListener("change", () => {
            const found = new Set();
            Array.from(input.files || []).forEach(file => {
                const parts = file.webkitRelativePath.split("/");
                if (parts.length === 3 && parts.at(2) === "plugin.js") found.add(parts.at(1));
                else if (parts.length === 4 && parts.at(1) === "plugins" && parts.at(3) === "plugin.js") found.add(parts.at(2));
            });
            if (!found.size) return;
            localStorage.setItem(SCAN_KEY, JSON.stringify(Array.from(found)));
            location.reload();
        });
        input.click();
    }

    async function boot() {
        await loadSequential(CORE_SCRIPTS);
        await loadScript("scripts/plugins/manifest.js");

        let savedScan = [];
        try { savedScan = JSON.parse(localStorage.getItem(SCAN_KEY) || "[]"); } catch (e) {}
        const merged = Array.from(new Set([...(window.INSTALLED_PLUGINS || []), ...savedScan]));

        for (const name of merged) {
            window._pendingPluginBoot = null;
            const found = await loadScript(`scripts/plugins/${name}/plugin.js`);
            if (found && typeof window._pendingPluginBoot === "function") {
                await window._pendingPluginBoot();
            }
        }
        window._pendingPluginBoot = null;
        window.CorePlugins?.pruneUninstalled?.();
        window.CoreBus?.emit("plugins:allLoaded", { count: merged.length });
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
    else boot();

    return { loadStyle, loadScript, loadSequential, loadPluginFolder, scanPluginsFolder };
})();
