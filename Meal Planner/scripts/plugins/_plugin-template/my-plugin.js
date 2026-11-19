window.MyPlugin = (function () {
    // 1. Isolated localStorage namespace (never collides with other plugins)
    const store = window.CoreStore.createNamespace("my-plugin", { count: 0 });
    const ROOT_ID = "my-plugin-root";

    // 2. Mount your HTML into #plugin-views when enabled
    function mount() {
        if (document.getElementById(ROOT_ID)) return;
        const container = document.getElementById("plugin-views");
        if (!container) return;

        const el = document.createElement("section");
        el.id = ROOT_ID;
        el.className = "panel";
        el.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap;">
                <h2 style="margin: 0; border: none;">🚀 My Custom Plugin</h2>
                <button type="button" id="my-plugin-btn" class="btn-green">Clicked: ${store.get("count", 0)}</button>
            </div>
            <p style="margin: 10px 0 0 0; color: var(--text-muted); font-size: 0.9rem;">
                Edit <code>my-plugin.js</code> to build any standalone tool, dashboard, or HTML5 canvas game.
            </p>
        `;

        el.querySelector("#my-plugin-btn").addEventListener("click", e => {
            const next = store.get("count", 0) + 1;
            store.set("count", next);
            e.currentTarget.textContent = `Clicked: ${next}`;
            window.CoreBus?.emit("my-plugin:updated", { count: next });
        });

        container.appendChild(el);
    }

    // 3. Clean up DOM elements, timers, or animation loops when toggled OFF
    function unmount() {
        document.getElementById(ROOT_ID)?.remove();
    }

    // 4. Register with the core plugin manager
    window.CorePlugins?.register({
        id: "my-plugin",
        // Optional: requires: Array.of("calendar"), // Uncomment to nest under another plugin
        icon: "🚀",
        title: "My Custom Plugin",
        description: "Starter blueprint for standalone apps or sub-plugins",
        defaultEnabled: false,
        enable() { mount(); },
        disable() { unmount(); }
    });

    return { mount, unmount };
})();
