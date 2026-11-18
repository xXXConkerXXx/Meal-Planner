window.CorePlugins = (function () {
    const store = window.CoreStore.createNamespace("plugins", { enabled: {}, collapsed: {} });
    const registry = new Map();

    function isSelfEnabled(id) {
        const plugin = registry.get(id);
        if (!plugin) return false;
        const saved = store.get("enabled", {});
        return typeof saved[id] === "boolean" ? saved[id] : Boolean(plugin.defaultEnabled);
    }

    function isCollapsed(id) {
        const saved = store.get("collapsed", {});
        return Boolean(saved[id]);
    }

    function toggleCollapsed(id) {
        const saved = Object.assign({}, store.get("collapsed", {}));
        saved[id] = !saved[id];
        store.set("collapsed", saved);
        renderModalList();
    }

    function getMissingParents(id) {
        const plugin = registry.get(id);
        if (!plugin || !Array.isArray(plugin.requires)) return [];
        return plugin.requires.filter(parentId => !registry.has(parentId));
    }

    function areDepsMet(id) {
        const plugin = registry.get(id);
        if (!plugin || !Array.isArray(plugin.requires)) return true;
        return plugin.requires.every(parentId => registry.has(parentId) && isEnabled(parentId));
    }

    function isEnabled(id) {
        return isSelfEnabled(id) && areDepsMet(id);
    }

    function pruneUninstalled() {
        const saved = Object.assign({}, store.get("enabled", {}));
        let changed = false;
        Object.keys(saved).forEach(id => {
            if (!registry.has(id)) {
                delete saved[id];
                changed = true;
            }
        });
        if (changed) store.set("enabled", saved);
        registry.forEach((plugin, id) => {
            if (!areDepsMet(id) && typeof plugin.disable === "function") plugin.disable();
        });
    }

    function syncDependents(parentId) {
        registry.forEach((child, childId) => {
            if (!Array.isArray(child.requires) || !child.requires.includes(parentId)) return;
            const active = isEnabled(childId);
            if (active && typeof child.enable === "function") child.enable();
            if (!active && typeof child.disable === "function") child.disable();
            syncDependents(childId);
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

    function ensureModal() {
        if (document.getElementById("core-plugins-modal")) return;
        const modal = document.createElement("div");
        modal.id = "core-plugins-modal";
        modal.className = "modal-backdrop hidden screen-only";
        modal.addEventListener("click", () => modal.classList.add("hidden"));

        modal.innerHTML = `
            <div class="modal-box panel" style="max-width: 490px; max-height: 82vh; overflow-y: auto;" onclick="event.stopPropagation()">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 8px; margin-bottom: 12px; gap: 8px;">
                    <h2 style="border: none; margin: 0; padding: 0;">🧩 Installed Plugins</h2>
                    <div style="display: flex; gap: 6px; align-items: center;">
                        <button type="button" id="scan-plugins-btn" class="btn-outline" title="Scan scripts/plugins folder for new plugins" style="padding: 4px 10px; font-size: 0.78rem;">📁 Scan</button>
                        <button type="button" id="close-plugins-modal" class="btn-outline" style="padding: 4px 10px;">✕</button>
                    </div>
                </div>
                <div id="core-plugins-list" style="display: flex; flex-direction: column; gap: 8px;"></div>
            </div>
        `;
        modal.querySelector("#scan-plugins-btn").addEventListener("click", () => window.ModuleLoader?.scanPluginsFolder?.());
        modal.querySelector("#close-plugins-modal").addEventListener("click", () => modal.classList.add("hidden"));
        document.body.appendChild(modal);
    }

    function renderPluginCard(p, isSub = false, childCount = 0) {
        const missing = getMissingParents(p.id);
        const depsOk = areDepsMet(p.id);
        const active = isEnabled(p.id);
        const collapsed = isCollapsed(p.id);
        const indent = isSub ? "margin-left: 20px; border-left: 3px solid var(--title-color);" : "";
        const prefix = isSub ? "↳ " : "";
        const btnLabel = missing.length ? "MISSING" : (!depsOk ? "LOCKED" : (active ? "ON" : "OFF"));
        const btnClass = !depsOk ? "btn-outline" : (active ? "btn-green" : "btn-outline");
        const extraHTML = typeof p.renderExtra === "function" ? p.renderExtra() : "";

        const collapseBtn = (!isSub && childCount > 0)
            ? `<button type="button" data-collapse-plugin="${p.id}" class="btn-outline" title="${collapsed ? "Expand sub-plugins" : "Minimize sub-plugins"}" style="padding: 2px 8px; font-size: 0.76rem; margin-left: 6px;">${collapsed ? `▸ ${childCount}` : `▾ ${childCount}`}</button>`
            : "";

        return `
            <div data-plugin-card="${p.id}" style="padding: 10px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-main); transition: all 0.18s ease; ${indent} ${!depsOk ? "opacity: 0.65;" : ""}">
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px;">
                    <div style="flex: 1;">
                        <div style="font-weight: bold; font-size: 0.92rem; display: flex; align-items: center; flex-wrap: wrap;">
                            <span>${prefix}${p.icon || "🔌"} ${p.title}</span>${collapseBtn}
                        </div>
                        <div style="font-size: 0.78rem; color: var(--text-muted);">${missing.length ? `Requires missing plugin: ${missing.join(", ")}` : (p.description || "")}</div>
                    </div>
                    <button type="button" data-toggle-plugin="${p.id}" class="${btnClass}" ${!depsOk ? "disabled" : ""} style="min-width: 72px;">
                        ${btnLabel}
                    </button>
                </div>
                ${extraHTML}
            </div>
        `;
    }

    function renderModalList() {
        const listEl = document.getElementById("core-plugins-list");
        if (!listEl) return;

        const all = Array.from(registry.values());
        const sortRoots = (a, b) => {
            if (Boolean(a.pinnedTop) !== Boolean(b.pinnedTop)) return a.pinnedTop ? -1 : 1;
            return Number(isEnabled(b.id)) - Number(isEnabled(a.id));
        };
        const sortChildren = (a, b) => Number(isEnabled(b.id)) - Number(isEnabled(a.id));
        const roots = all.filter(p => !Array.isArray(p.requires) || !p.requires.length || getMissingParents(p.id).length > 0).sort(sortRoots);
        let html = "";

        roots.forEach(root => {
            const children = all.filter(c => Array.isArray(c.requires) && c.requires.includes(root.id)).sort(sortChildren);
            html += renderPluginCard(root, false, children.length);
            if (!isCollapsed(root.id)) {
                children.forEach(child => { html += renderPluginCard(child, true, 0); });
            }
        });

        listEl.innerHTML = html || `<p style="color: var(--text-muted); font-size: 0.88rem; margin: 0;">No plugins registered yet.</p>`;
        listEl.querySelectorAll("button[data-collapse-plugin]").forEach(btn => {
            btn.addEventListener("click", () => toggleCollapsed(btn.dataset.collapsePlugin));
        });
        listEl.querySelectorAll("button[data-toggle-plugin]:not([disabled])").forEach(btn => {
            btn.addEventListener("click", () => setEnabled(btn.dataset.togglePlugin, !isSelfEnabled(btn.dataset.togglePlugin)));
        });
        all.forEach(p => {
            if (typeof p.bindExtra === "function") {
                const card = listEl.querySelector(`[data-plugin-card="${p.id}"]`);
                if (card) p.bindExtra(card);
            }
        });
    }

    function init() {
        if (document.getElementById("open-plugins-btn")) return;

        const btn = document.createElement("button");
        btn.type = "button";
        btn.id = "open-plugins-btn";
        btn.className = "btn-outline screen-only";
        btn.textContent = "🧩 Plugins";
        btn.title = "Manage Installed Plugins";
        btn.style.cssText = "position: fixed; bottom: 16px; right: 16px; z-index: 25; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35); padding: 8px 14px;";
        btn.addEventListener("click", () => {
            ensureModal();
            renderModalList();
            document.getElementById("core-plugins-modal").classList.remove("hidden");
        });
        document.body.appendChild(btn);
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();

    return { register, isEnabled, setEnabled, pruneUninstalled };
})();
