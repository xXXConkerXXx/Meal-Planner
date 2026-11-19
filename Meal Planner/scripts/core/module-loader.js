window.ModuleLoader = (function () {
    const SCAN_KEY = "planner_discovered_plugins_v1";
    const CORE_SCRIPTS = Array.of(
        "scripts/core/event-bus.js",
        "scripts/core/store.js",
        "scripts/core/zip-reader.js",
        "scripts/core/plugin-installer.js",
        "scripts/core/plugin-card-renderer.js",
        "scripts/core/plugin-modal-view.js",
        "scripts/core/plugin-manager.js"
    );

    function resolvePath(logicalPath) {
        return window.CorePluginInstaller?.resolveVirtualUrl?.(logicalPath) || logicalPath;
    }

    function loadStyle(href) {
        if (document.querySelector(`link[data-logical-href="${href}"]`)) return;
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.dataset.logicalHref = href;
        link.href = resolvePath(href);
        document.head.appendChild(link);
    }

    function loadScript(src) {
        return new Promise(resolve => {
            const s = document.createElement("script");
            s.src = resolvePath(src);
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

    function scanPluginsFolder(includeTemplates = false) {
        const input = document.createElement("input");
        input.type = "file";
        input.webkitdirectory = true;
        input.addEventListener("change", async () => {
            const foundFolders = new Set();
            const zipFiles = [];

            Array.from(input.files || []).forEach(file => {
                const lower = file.name.toLowerCase();
                if (lower.endsWith(".zip")) {
                    if (includeTemplates || !file.name.startsWith("_")) zipFiles.push(file);
                    return;
                }
                const parts = file.webkitRelativePath.split("/");
                const folder = parts.length === 3 ? parts.at(1) : (parts.length === 4 && parts.at(1) === "plugins" ? parts.at(2) : "");
                const fileName = parts.at(-1);
                if (!folder || fileName !== "plugin.js") return;
                if (!includeTemplates && folder.startsWith("_")) return;
                foundFolders.add(folder);
            });

            let zipCount = 0;
            for (const zf of zipFiles) {
                try {
                    const installed = await window.CorePluginInstaller?.installFromFile?.(zf, includeTemplates);
                    zipCount += (installed || []).length;
                } catch (err) {
                    console.warn(`[PluginScanner] Skipped ${zf.name}:`, err.message);
                }
            }

            if (!foundFolders.size && !zipCount) return;
            if (foundFolders.size) {
                localStorage.setItem(SCAN_KEY, JSON.stringify(Array.from(foundFolders)));
            }
            location.reload();
        });
        input.click();
    }

    async function boot() {
        await loadSequential(CORE_SCRIPTS);
        await loadScript("scripts/plugins/manifest.js");

        const virtualIds = await (window.CorePluginInstaller?.preloadVirtualPackages?.() || Promise.resolve([]));
        let savedScan = [];
        try { savedScan = JSON.parse(localStorage.getItem(SCAN_KEY) || "[]"); } catch (e) {}
        const merged = Array.from(new Set([...(window.INSTALLED_PLUGINS || []), ...savedScan, ...virtualIds]));

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
