let activeTab = "breakfast";
let activeTheme = localStorage.getItem("meal_planner_theme") || "system";
const systemDarkQuery = window.matchMedia("(prefers-color-scheme: dark)");

function applyClasses() {
    const isDark = activeTheme === "dark" || (activeTheme === "system" && systemDarkQuery.matches);
    const isKiosk = document.body.classList.contains("kiosk-active");
    document.body.className = `mode-${activeTab} ${isDark ? "theme-dark" : "theme-light"}${isKiosk ? " kiosk-active" : ""}`;
}

function setTheme(theme) {
    activeTheme = theme;
    localStorage.setItem("meal_planner_theme", theme);
    applyClasses();
}

function toggleKioskMode() {
    const entering = !document.body.classList.contains("kiosk-active");
    document.body.classList.toggle("kiosk-active", entering);
    document.getElementById("exit-kiosk-btn").classList.toggle("hidden", !entering);
    if (entering) {
        switchView("preview", document.querySelector(".view-btn"));
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(() => {});
        }
    } else if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
    }
}

systemDarkQuery.addEventListener("change", () => {
    if (activeTheme === "system") applyClasses();
});

function changeMonth(delta) {
    viewMonth += delta;
    if (viewMonth > 11) { viewMonth = 0; viewYear++; }
    if (viewMonth < 0) { viewMonth = 11; viewYear--; }
    refreshAllViews();
}

function switchView(view, btn) {
    document.querySelectorAll(".view-btn").forEach(b => b.classList.remove("active"));
    if (btn) btn.classList.add("active");
    document.getElementById("preview-view").classList.toggle("hidden", view !== "preview");
    document.getElementById("edit-view").classList.toggle("hidden", view !== "edit");
    document.getElementById("grocery-view").classList.toggle("hidden", view !== "grocery");
    refreshAllViews();
}

function switchTab(tab, btn) {
    activeTab = tab;
    applyClasses();
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    btn.classList.add("active");
    renderCalendar();
}
