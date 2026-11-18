window.ThemeSwitcher = (function () {
    const store = window.CoreStore.createNamespace("appearance", { theme: "system" });
    const THEME_CLASSES = Array.of("theme-light", "theme-cream", "theme-sage", "theme-sky", "theme-sepia", "theme-dark", "theme-slate", "theme-forest", "theme-nord", "theme-amoled", "is-dark-theme");
    const DARK_THEMES = new Set(["dark", "slate", "forest", "nord", "amoled"]);

    function apply(choice) {
        const enabled = !window.CorePlugins || window.CorePlugins.isEnabled("theme-switcher");
        const mode = enabled ? (choice || store.get("theme", "system")) : "system";
        if (enabled && choice) store.set("theme", mode);

        const sel = document.getElementById("theme-plugin-select");
        if (sel) {
            sel.value = store.get("theme", "system");
            sel.disabled = !enabled;
        }

        document.body.classList.remove(...THEME_CLASSES);
        const resolved = mode === "system"
            ? (window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ? "dark" : "light")
            : mode;

        document.body.classList.add(`theme-${resolved}`);
        if (DARK_THEMES.has(resolved)) document.body.classList.add("is-dark-theme");
    }

    window.matchMedia?.("(prefers-color-scheme: dark)")?.addEventListener("change", () => {
        if (store.get("theme", "system") === "system" || (window.CorePlugins && !window.CorePlugins.isEnabled("theme-switcher"))) {
            apply();
        }
    });

    function buildControlHTML() {
        const cur = store.get("theme", "system");
        const opts = [
            `<option value="system">System Default</option>`,
            `<optgroup label="Light Themes (Dark Text)">`,
            `<option value="light">Soft Grey</option>`,
            `<option value="cream">Warm Cream</option>`,
            `<option value="sage">Botanical Sage</option>`,
            `<option value="sky">Mist Blue</option>`,
            `<option value="sepia">Warm Sepia</option>`,
            `</optgroup>`,
            `<optgroup label="Dark Themes (Light Text)">`,
            `<option value="dark">Midnight Espresso</option>`,
            `<option value="slate">Charcoal Slate</option>`,
            `<option value="forest">Deep Forest</option>`,
            `<option value="nord">Arctic Night</option>`,
            `<option value="amoled">Pitch Obsidian</option>`,
            `</optgroup>`
        ].join("");

        return `
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed var(--border-color); display: flex; justify-content: space-between; align-items: center; gap: 8px;">
                <span style="font-size: 0.82rem; font-weight: bold; color: var(--text-muted);">Active Palette:</span>
                <select id="theme-plugin-select" style="padding: 4px 8px; font-size: 0.83rem; background: var(--bg-card); color: var(--text-main); border: 1px solid var(--border-color); border-radius: 6px; font-family: inherit; cursor: pointer;">
                    ${opts.replace(`value="${cur}"`, `value="${cur}" selected`)}
                </select>
            </div>
        `;
    }

    function bindControl(cardEl) {
        const sel = cardEl.querySelector("#theme-plugin-select");
        if (!sel) return;
        sel.disabled = window.CorePlugins && !window.CorePlugins.isEnabled("theme-switcher");
        sel.addEventListener("change", e => apply(e.target.value));
    }

    window.CorePlugins?.register({
        id: "theme-switcher",
        pinnedTop: true,
        icon: "🎨",
        title: "Color Themes",
        description: "10 light and dark color palettes (independent of calendar)",
        defaultEnabled: true,
        renderExtra: buildControlHTML,
        bindExtra: bindControl,
        enable() { apply(); },
        disable() { apply("system"); }
    });

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => apply());
    else apply();

    return { apply, getTheme: () => store.get("theme", "system") };
})();
