let clearMonthArmed = false;
let clearYearArmed = false;
let clearAllArmed = false;

function resetClearButtons() {
    clearMonthArmed = false;
    clearYearArmed = false;
    clearAllArmed = false;
    document.querySelectorAll(".btn-danger-confirm").forEach(btn => {
        btn.classList.remove("btn-danger-confirm");
        if (btn.textContent.includes("Clear All")) btn.textContent = "Clear All";
        else if (btn.textContent.includes("Clear ")) {
            btn.textContent = btn.textContent.includes("20") ? "Clear Year" : "Clear Month";
        }
    });
}

function clearCurrentMonth(btn) {
    if (!clearMonthArmed) {
        clearMonthArmed = true;
        const mName = new Date(viewYear, viewMonth, 1).toLocaleString("default", { month: "short" });
        btn.textContent = `Confirm Clear ${mName}?`;
        btn.classList.add("btn-danger-confirm");
        setTimeout(() => { clearMonthArmed = false; btn.textContent = "Clear Month"; btn.classList.remove("btn-danger-confirm"); }, 4000);
        return;
    }
    clearMonthArmed = false;
    btn.textContent = "Clear Month";
    btn.classList.remove("btn-danger-confirm");
    const days = new Date(viewYear, viewMonth + 1, 0).getDate();
    for (let d = 1; d <= days; d++) delete yearlyPlan[formatDateKey(viewYear, viewMonth, d)];
    saveToDisk();
    refreshAllViews();
    showToast("Cleared current month.");
}

function clearCurrentYear(btn) {
    if (!clearYearArmed) {
        clearYearArmed = true;
        btn.textContent = `Confirm Clear ${viewYear}?`;
        btn.classList.add("btn-danger-confirm");
        setTimeout(() => { clearYearArmed = false; btn.textContent = "Clear Year"; btn.classList.remove("btn-danger-confirm"); }, 4000);
        return;
    }
    clearYearArmed = false;
    btn.textContent = "Clear Year";
    btn.classList.remove("btn-danger-confirm");
    Object.keys(yearlyPlan).forEach(key => { if (key.startsWith(`${viewYear}-`)) delete yearlyPlan[key]; });
    saveToDisk();
    refreshAllViews();
    showToast(`Cleared all of ${viewYear}.`);
}

function clearAllPlans(btn) {
    if (!clearAllArmed) {
        clearAllArmed = true;
        btn.textContent = "Confirm Clear All?";
        btn.classList.add("btn-danger-confirm");
        setTimeout(() => { clearAllArmed = false; btn.textContent = "Clear All"; btn.classList.remove("btn-danger-confirm"); }, 4000);
        return;
    }
    clearAllArmed = false;
    btn.textContent = "Clear All";
    btn.classList.remove("btn-danger-confirm");
    yearlyPlan = {};
    saveToDisk();
    refreshAllViews();
    showToast("Cleared entire calendar.");
}

function buildMonthGridHTML(slot, clickable = false) {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const prevY = viewMonth === 0 ? viewYear - 1 : viewYear;
    const prevM = viewMonth === 0 ? 11 : viewMonth - 1;
    const prevDays = new Date(prevY, prevM + 1, 0).getDate();
    const nextY = viewMonth === 11 ? viewYear + 1 : viewYear;
    const nextM = viewMonth === 11 ? 0 : viewMonth + 1;
    const now = new Date();
    const todayKey = formatDateKey(now.getFullYear(), now.getMonth(), now.getDate());

    const makeCell = (y, m, d, isAdj) => {
        const key = formatDateKey(y, m, d);
        const isToday = key === todayKey ? " current-day" : "";
        const adjClass = isAdj ? " adjacent-month" : "";
        const clickAttr = clickable ? ` onclick="openCellModal('${key}')"` : "";
        const plan = normalizePlanSlot(yearlyPlan[key]?.[slot]);

        let bodyHTML = "";
        if (plan.main) {
            bodyHTML += `<div class="meal-title">${plan.main.name}</div>`;
        }
        if (plan.sides.length) {
            const sidesText = plan.sides.map(s => `+ ${s.name}`).join("\n");
            bodyHTML += `<div class="meal-items">${sidesText}</div>`;
        }

        return `<div class="day-cell${adjClass}${isToday}"${clickAttr}><div class="day-num">${d}</div>${bodyHTML}</div>`;
    };

    let html = "";
    for (let i = firstDay - 1; i >= 0; i--) html += makeCell(prevY, prevM, prevDays - i, true);
    for (let d = 1; d <= daysInMonth; d++) html += makeCell(viewYear, viewMonth, d, false);
    const trailing = (7 - ((firstDay + daysInMonth) % 7)) % 7;
    for (let d = 1; d <= trailing; d++) html += makeCell(nextY, nextM, d, true);

    return html;
}

function renderCalendar() {
    document.getElementById("calendar-grid").innerHTML = buildMonthGridHTML(activeTab, true);
    const label = new Date(viewYear, viewMonth, 1).toLocaleString("default", { month: "long", year: "numeric" });
    document.getElementById("print-all-calendars").innerHTML = ["breakfast", "lunch", "dinner"].map(slot => `
        <div class="print-page-section">
            <div class="print-section-heading">${label} — ${slot}</div>
            <div class="calendar-wrapper"><div class="weekdays"><div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div></div>
            <div class="calendar-grid">${buildMonthGridHTML(slot, false)}</div></div>
        </div>
    `).join("");
}

function printAllCalendars() {
    renderCalendar();
    window.print();
}

window.addEventListener("beforeprint", renderCalendar);
