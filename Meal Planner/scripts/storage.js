let meals = [];
let yearlyPlan = {};

const today = new Date();
let viewYear = today.getFullYear();
let viewMonth = today.getMonth();

function showToast(msg, isError = false) {
    let toast = document.getElementById("toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast";
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.className = isError ? "show error" : "show";
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => { toast.className = ""; }, 3000);
}

function getSeason(m) {
    const num = m + 1;
    if (num >= 3 && num <= 5) return "spring";
    if (num >= 6 && num <= 8) return "summer";
    if (num >= 9 && num <= 11) return "fall";
    return "winter";
}

function formatDateKey(y, m, d) {
    return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function normalizePlanSlot(entry) {
    if (!entry) return { main: null, sides: [] };
    if ("main" in entry || "sides" in entry) {
        return { main: entry.main || null, sides: Array.isArray(entry.sides) ? entry.sides : [] };
    }
    return { main: entry, sides: [] };
}

function getBackupPayload() {
    const holidayRepeats = window.HolidayRepeatStore ? window.HolidayRepeatStore.getAll() : [];
    return JSON.stringify({ recipes: meals, yearlyPlan: yearlyPlan, holidayRepeats: holidayRepeats }, null, 2);
}

function saveToDisk() {
    localStorage.setItem("meal_planner_backup", getBackupPayload());
}

function loadBackupData() {
    const backup = localStorage.getItem("meal_planner_backup");
    if (backup) {
        const parsed = JSON.parse(backup);
        meals = parsed.recipes || [];
        yearlyPlan = parsed.yearlyPlan || {};
    }
}

function importFromFile(event) {
    const file = event.target.files.item(0);
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
        try {
            const data = JSON.parse(e.target.result || "{}");
            meals = Array.isArray(data) ? data : (data.recipes || []);
            yearlyPlan = data.yearlyPlan || {};
            if (window.HolidayRepeatStore && Array.isArray(data.holidayRepeats)) {
                window.HolidayRepeatStore.replaceAll(data.holidayRepeats);
            }
            saveToDisk();
            refreshAllViews();
            const patternSel = document.getElementById("assign-pattern");
            const card = patternSel ? (patternSel.closest(".panel") || patternSel.parentElement.parentElement) : null;
            if (window.HolidayRepeatList && card) window.HolidayRepeatList.render(card);
            showToast("Loaded " + file.name);
        } catch (err) {
            showToast("Invalid JSON file.", true);
        }
        event.target.value = "";
    };
    reader.readAsText(file);
}

function exportToFile() {
    const blob = new Blob([getBackupPayload()], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "meals.json";
    a.click();
    showToast("Saved meals.json");
}
