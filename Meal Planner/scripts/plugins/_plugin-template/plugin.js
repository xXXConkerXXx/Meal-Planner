// When you copy this folder, change "_plugin-template" to your new folder name (e.g. "my-plugin")
window._pendingPluginBoot = () => window.ModuleLoader.loadPluginFolder(
    "_plugin-template",
    Array.of("my-plugin.js"),
    Array.of("my-plugin.css")
);
