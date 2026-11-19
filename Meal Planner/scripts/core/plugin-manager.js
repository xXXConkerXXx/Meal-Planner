window.CorePlugins = (function () {
    const store = window.CoreStore.createNamespace("plugins", { enabled: {}, collapsed: {}, launcher: "full" });
    const registry = new Map();

    function isSelfEnabled(id) {
        const plugin = registry.get(id);
        if (!plugin) return false;
        const saved = store.get("enabled", {});
        return typeof saved[id] === "boolean" ? saved[id] : Boolean(plugin.defaultEnabled);
    }

    function isCollapsed(id) {
        return Boolean(store.get("collapsed", {})[id]);
    }

    function toggleCollapsed(id) {
        const saved = Object.assign({}, store.get("collapsed", {}));
        saved[id] = !saved[id];
        store.set("collapsed", saved);
        renderModalList();
    }

    function getMissingParents(id, visited = new Set()) {
        if (visited.has(id)) return [];
        visited.add(id);
        const plugin = registry.get(id);
        if (!plugin || !Array.isArray(plugin.requires)) return [];

        const missing = new Set();
        plugin.requires.forEach(parentId => {
            if (!registry.has(parentId)) missing.add(parentId);
            else getMissingParents(parentId, new Set(visited)).forEach(m => missing.add(m));
        });
        return Array.from(missing);
    }

    function areDepsMet(id, visited = new Set()) {
        if (visited.has(id)) return false;
        visited.add(id);
        const plugin = registry.get(id);
        if (!plugin || !Array.isArray(plugin.requires)) return true;

        return plugin.requires.every(parentId =>
            registry.has(parentId) &&
            isSelfEnabled(parentId) &&
            areDepsMet(parentId, new Set(visited))
        );
    }

    function isEnabled(id) {
        return isSelfEnabled(id) && areDepsMet(id);
    }

    function pruneUninstalled() {
        const saved = Object.assign({}, store.get("enabled", {}));
        let changed = false;
        Object.keys(saved).forEach(id => {
            if (!registry.has(id)) { delete saved[id]; changed = true; }
        });
        if (changed) store.set("enabled", saved);
        registry.forEach((plugin, id) => {
            if (!areDepsMet(id) && typeof plugin.disable === "function") plugin.disable();
        });
    }

    function syncDependents(parentId, visited = new Set()) {
        if (visited.has(parentId)) return;
        visited.add(parentId);
        registry.forEach((child, childId) => {
            if (!Array.isArray(child.requires) || !child.requires.includes(parentId)) return;
            const active = isEnabled(childId);
            if (active && typeof child.enable === "function") child.enable();
            if (!active && typeof child.disable === "function") child.disable();
            syncDependents(childId, visited);
        });
    }

    function setEnabled(id, active) {
        const plugin = registry.get(id);
        if (!plugin) return;

        const saved = Object.assign({}, store.get("enabled", {}));
        saved[id] = Boolean(active);
        store.set("enabled", saved);

        const effective = isEnabled(id);
        if (effective && typeof plugin.enable === "function") plugin.enable();
        if (!effective && typeof plugin.disable === "function") plugin.disable();

        syncDependents(id);
        renderModalList();
        window.CoreBus?.emit("plugin:toggled", { id, active: effective });
    }

    function register(def) {
        if (!def || !def.id) return;
        registry.set(def.id, def);
        const effective = isEnabled(def.id);
        if (effective && typeof def.enable === "function") def.enable();
        else if (!effective && typeof def.disable === "function") def.disable();
        syncDependents(def.id);
    }

    function openModal() {
        window.CorePluginModal?.ensure();
        renderModalList();
        syncLauncherUI();
        document.getElementById("core-plugins-modal")?.classList.remove("hidden");
    }

    function setLauncherMode(mode) {
        store.set("launcher", mode);
        syncLauncherUI();
    }

    function toggleLauncherHidden() {
        const next = store.get("launcher", "full") === "hidden" ? "full" : "hidden";
        setLauncherMode(next);
    }

    function syncLauncherUI() {
        const mode = store.get("launcher", "full");
        const dock = document.getElementById("open-plugins-btn");
        const visBtn = document.getElementById("toggle-launcher-vis-btn");
        if (visBtn) visBtn.textContent = mode === "hidden" ? "👁️ Show Btn" : "👁️ Hide Btn";
        if (!dock) return;

        dock.style.display = mode === "hidden" ? "none" : "inline-flex";
        const mainBtn = dock.querySelector("#plugins-dock-open");
        const minBtn = dock.querySelector("#plugins-dock-min");

        if (mode === "mini") {
            dock.style.right = "0px";
            dock.style.borderRadius = "8px 0 0 8px";
            dock.style.padding = "4px 6px";
            dock.style.opacity = "0.75";
            if (mainBtn) mainBtn.textContent = "🧩";
            if (minBtn) minBtn.style.display = "none";
        } else {
            dock.style.right = "16px";
            dock.style.borderRadius = "8px";
            dock.style.padding = "0";
            dock.style.opacity = "1";
            if (mainBtn) mainBtn.textContent = "🧩 Plugins";
            if (minBtn) minBtn.style.display = "inline-block";
        }
    }

    function renderModalList() {
        const listEl = document.getElementById("core-plugins-list");
        if (!listEl || !window.CorePluginModal) return;
        window.CorePluginModal.renderList(listEl, Array.from(registry.values()), {
            isEnabled, getMissingParents, areDepsMet, isCollapsed, toggleCollapsed,
            toggleEnabled: id => setEnabled(id, !isSelfEnabled(id))
        });
    }

    function bindUniversalReveal() {
        document.addEventListener("keydown", e => {
            if ((e.altKey && e.key.toLowerCase() === "p") || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "p")) {
                e.preventDefault();
                openModal();
            }
        });

        let tapCount = 0, tapTimer = null;
        document.addEventListener("touchend", e => {
            if (e.target.closest("button, input, select, textarea, a, label, .modal-box")) return;
            tapCount++;
            clearTimeout(tapTimer);
            if (tapCount >= 3) {
                tapCount = 0;
                openModal();
            } else {
                tapTimer = setTimeout(() => { tapCount = 0; }, 550);
            }
        }, { passive: true });
    }

    function init() {
        if (document.getElementById("open-plugins-btn")) return;
        const dock = document.createElement("div");
        dock.id = "open-plugins-btn";
        dock.className = "screen-only";
        dock.style.cssText = "position: fixed; bottom: 16px; right: 16px; z-index: 25; display: inline-flex; align-items: stretch; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35); overflow: hidden; transition: all 0.18s ease;";
        dock.innerHTML = `
            <button type="button" id="plugins-dock-open" class="btn-outline" style="border: none; border-radius: 0; padding: 8px 12px; margin: 0;">🧩 Plugins</button>
            <button type="button" id="plugins-dock-min" class="btn-outline" title="Dock to screen edge" style="border: none; border-left: 1px solid var(--border-color); border-radius: 0; padding: 8px 8px; margin: 0; color: var(--text-muted);">–</button>
        `;

        dock.querySelector("#plugins-dock-open").addEventListener("click", () => {
            if (store.get("launcher", "full") === "mini") setLauncherMode("full");
            else openModal();
        });
        dock.querySelector("#plugins-dock-min").addEventListener("click", e => {
            e.stopPropagation();
            setLauncherMode("mini");
        });

        document.body.appendChild(dock);
        syncLauncherUI();
        bindUniversalReveal();
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();

    return { register, isEnabled, setEnabled, pruneUninstalled, openModal, toggleLauncherHidden };
})();
