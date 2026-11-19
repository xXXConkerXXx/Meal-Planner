window.CorePluginModal = {
    virtualIds: new Set(),

    async refreshVirtualSet() {
        const pkgs = await (window.CorePluginInstaller?.getAllPackages?.() || Promise.resolve([]));
        this.virtualIds = new Set(pkgs.map(p => p.id));
    },

    ensure() {
        if (document.getElementById("core-plugins-modal")) return;
        const modal = document.createElement("div");
        modal.id = "core-plugins-modal";
        modal.className = "modal-backdrop hidden screen-only";
        modal.addEventListener("click", () => modal.classList.add("hidden"));

        const incSaved = localStorage.getItem("planner_scan_templates_v1") === "1";

        modal.innerHTML = `
            <div class="modal-box panel" style="max-width: 520px; max-height: 84vh; overflow-y: auto;" onclick="event.stopPropagation()">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 8px; margin-bottom: 10px; gap: 8px; flex-wrap: wrap;">
                    <h2 style="border: none; margin: 0; padding: 0;">🧩 Installed Plugins</h2>
                    <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
                        <label title="Include _template folders or zips when scanning" style="display: inline-flex; align-items: center; gap: 4px; font-size: 0.76rem; color: var(--text-muted); cursor: pointer; margin: 0;">
                            <input type="checkbox" id="scan-include-templates" ${incSaved ? "checked" : ""} style="margin: 0;">
                            <span>_templates</span>
                        </label>
                        <button type="button" id="scan-plugins-btn" class="btn-outline" title="Scan a folder for plugin folders and .zip archives" style="padding: 4px 9px; font-size: 0.78rem;">📁 Scan</button>
                        <label class="btn-outline" title="Select one or more plugin .zip archives" style="margin: 0; cursor: pointer; display: inline-flex; align-items: center; padding: 4px 9px; border-radius: 6px; font-size: 0.78rem; font-weight: bold;">
                            📦 .zip <input type="file" id="import-zip-input" accept=".zip" multiple style="display: none;">
                        </label>
                        <button type="button" id="toggle-cloud-bar-btn" class="btn-outline" title="Download plugin .zip from GitHub or cloud URL" style="padding: 4px 9px; font-size: 0.78rem;">☁️ Cloud</button>
                        <button type="button" id="toggle-launcher-vis-btn" class="btn-outline" title="Hide or show the floating Plugins button" style="padding: 4px 9px; font-size: 0.78rem;">👁️ Hide Btn</button>
                        <button type="button" id="close-plugins-modal" class="btn-outline" style="padding: 4px 9px;">✕</button>
                    </div>
                </div>
                <div id="cloud-install-bar" class="hidden" style="display: flex; gap: 6px; margin-bottom: 10px; flex-wrap: wrap;">
                    <input type="url" id="cloud-zip-url" placeholder="https://githubusercontent.com" style="flex: 1; min-width: 180px; padding: 6px 10px; font-size: 0.82rem; background: var(--bg-main); color: var(--text-main); border: 1px solid var(--border-color); border-radius: 6px; font-family: inherit;">
                    <button type="button" id="cloud-zip-fetch-btn" class="btn-green" style="padding: 6px 12px; font-size: 0.80rem;">⬇️ Install</button>
                </div>
                <div style="font-size: 0.74rem; color: var(--text-muted); margin-bottom: 10px;">
                    Tip: Press <strong>Alt+P</strong> (desktop) or <strong>Triple-Tap</strong> anywhere (mobile) to open Plugins even if the button is hidden.
                </div>
                <div id="core-plugins-list" style="display: flex; flex-direction: column; gap: 8px;"></div>
            </div>
        `;

        const incBox = modal.querySelector("#scan-include-templates");
        incBox.addEventListener("change", () => localStorage.setItem("planner_scan_templates_v1", incBox.checked ? "1" : "0"));
        modal.querySelector("#scan-plugins-btn").addEventListener("click", () => window.ModuleLoader?.scanPluginsFolder?.(incBox.checked));

        modal.querySelector("#import-zip-input").addEventListener("change", async e => {
            const files = Array.from(e.target.files || []);
            e.target.value = "";
            if (!files.length) return;
            try {
                for (const file of files) {
                    await window.CorePluginInstaller.installFromFile(file, incBox.checked);
                }
                location.reload();
            } catch (err) {
                window.CoreCalendar?.showToast?.(err.message || "Failed to import .zip", true);
            }
        });

        const cloudBar = modal.querySelector("#cloud-install-bar");
        modal.querySelector("#toggle-cloud-bar-btn").addEventListener("click", () => cloudBar.classList.toggle("hidden"));
        modal.querySelector("#cloud-zip-fetch-btn").addEventListener("click", async () => {
            const url = modal.querySelector("#cloud-zip-url").value.trim();
            if (!url) return;
            try {
                await window.CorePluginInstaller.installFromUrl(url, incBox.checked);
                location.reload();
            } catch (err) {
                window.CoreCalendar?.showToast?.(err.message || "Cloud install failed", true);
            }
        });

        modal.querySelector("#toggle-launcher-vis-btn").addEventListener("click", () => window.CorePlugins?.toggleLauncherHidden?.());
        modal.querySelector("#close-plugins-modal").addEventListener("click", () => modal.classList.add("hidden"));
        document.body.appendChild(modal);
    },

    async renderList(listEl, all, helpers) {
        await this.refreshVirtualSet();
        const sortRoots = (a, b) => (Boolean(a.pinnedTop) !== Boolean(b.pinnedTop)) ? (a.pinnedTop ? -1 : 1) : (Number(helpers.isEnabled(b.id)) - Number(helpers.isEnabled(a.id)));
        const sortChildren = (a, b) => Number(helpers.isEnabled(b.id)) - Number(helpers.isEnabled(a.id));

        const renderTree = (plugin, depth, parentTitle = "", seen = new Set()) => {
            if (seen.has(plugin.id)) return "";
            seen.add(plugin.id);

            const children = all.filter(c => Array.isArray(c.requires) && c.requires.includes(plugin.id)).sort(sortChildren);
            const state = {
                missing: helpers.getMissingParents(plugin.id),
                depsOk: helpers.areDepsMet(plugin.id),
                active: helpers.isEnabled(plugin.id),
                collapsed: helpers.isCollapsed(plugin.id),
                isVirtual: this.virtualIds.has(plugin.id),
                parentTitle
            };
            let branch = window.CorePluginCardRenderer.renderCard(plugin, depth, children.length, state);
            if (!state.collapsed) children.forEach(child => { branch += renderTree(child, depth + 1, plugin.title, new Set(seen)); });
            return branch;
        };

        const isRootOrOrphan = p => !Array.isArray(p.requires) || !p.requires.length || p.requires.some(id => !all.some(x => x.id === id));
        const roots = all.filter(isRootOrOrphan).sort(sortRoots);
        listEl.innerHTML = roots.map(r => renderTree(r, 0)).join("") || `<p style="color: var(--text-muted); font-size: 0.88rem; margin: 0;">No plugins registered yet.</p>`;

        listEl.querySelectorAll("[data-collapse-card]").forEach(card => card.addEventListener("click", () => helpers.toggleCollapsed(card.dataset.collapseCard)));
        listEl.querySelectorAll("[data-stop-collapse]").forEach(area => area.addEventListener("click", e => e.stopPropagation()));
        listEl.querySelectorAll("button[data-toggle-plugin]").forEach(btn => btn.addEventListener("click", e => {
            e.stopPropagation();
            if (!btn.disabled) helpers.toggleEnabled(btn.dataset.togglePlugin);
        }));
        listEl.querySelectorAll("button[data-remove-pkg]").forEach(btn => btn.addEventListener("click", async e => {
            e.stopPropagation();
            await window.CorePluginInstaller?.removePackage?.(btn.dataset.removePkg);
            location.reload();
        }));
        all.forEach(p => { if (typeof p.bindExtra === "function") { const card = listEl.querySelector(`[data-plugin-card="${p.id}"]`); if (card) p.bindExtra(card); } });
    }
};
