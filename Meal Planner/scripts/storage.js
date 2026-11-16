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

function saveToDisk() {
    const payload = JSON.stringify({ recipes: meals, yearlyPlan: yearlyPlan }, null, 2);
    localStorage.setItem("meal_planner_backup", payload);
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
            saveToDisk();
            refreshAllViews();
            showToast("Loaded " + file.name);
        } catch (err) {
            showToast("Invalid JSON file.", true);
        }
        event.target.value = "";
    };
    reader.readAsText(file);
}

function exportToFile() {
    const payload = JSON.stringify({ recipes: meals, yearlyPlan: yearlyPlan }, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "meals.json";
    a.click();
    showToast("Saved meals.json");
}
