window.CoreStore = {
    createNamespace(namespace, defaults = {}) {
        const prefix = `planner_${namespace}_`;
        return {
            get(key, fallback = defaults[key]) {
                try {
                    const raw = localStorage.getItem(prefix + key);
                    return raw === null ? fallback : JSON.parse(raw);
                } catch (e) {
                    return fallback;
                }
            },
            set(key, value) {
                localStorage.setItem(prefix + key, JSON.stringify(value));
                window.CoreBus?.emit(`store:${namespace}:${key}`, value);
            },
            exportAll() {
                const dump = {};
                for (let i = 0; i < localStorage.length; i++) {
                    const k = localStorage.key(i);
                    if (k && k.startsWith(prefix)) {
                        dump[k.slice(prefix.length)] = JSON.parse(localStorage.getItem(k));
                    }
                }
                return dump;
            },
            importAll(dataObj) {
                if (!dataObj || typeof dataObj !== "object") return;
                Object.entries(dataObj).forEach(([k, v]) => this.set(k, v));
            }
        };
    }
};

window.CoreTheme = (function () {
    const store = window.CoreStore.createNamespace("core", { theme: "system" });

    function apply(choice) {
        const mode = choice || store.get("theme", "system");
        store.set("theme", mode);
        const sel = document.getElementById("theme-select");
        if (sel && sel.value !== mode) sel.value = mode;
        const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
        document.body.classList.toggle("theme-dark", mode === "dark" || (mode === "system" && prefersDark));
    }

    window.matchMedia?.("(prefers-color-scheme: dark)")?.addEventListener("change", () => {
        if (store.get("theme", "system") === "system") apply("system");
    });

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => apply());
    else apply();

    return { apply, get: () => store.get("theme", "system") };
})();

