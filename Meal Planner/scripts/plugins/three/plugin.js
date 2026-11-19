window._pendingPluginBoot = async () => {
    try {
        const mod = await import("./three.module.js");
        window.THREE = Object.assign({}, mod);
    } catch (err) {
        console.warn("[ThreePlugin] Failed to load ES module:", err);
    }
    await window.ModuleLoader.loadPluginFolder("three", Array.of("three-plugin.js"));
};
