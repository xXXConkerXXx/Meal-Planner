window._pendingPluginBoot = () => window.ModuleLoader.loadPluginFolder(
    "theme-switcher",
    Array.of("theme-switcher.js"),
    Array.of("themes.css", "mobile.css")
);
