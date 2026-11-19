window.CoreCalendar = (function () {
    const MONTHS = Array.of("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December");
    const DAYS = Array.of("Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat");

    let viewYear = new Date().getFullYear();
    let viewMonth = new Date().getMonth();
    let activePlugin = null;
    let activeTab = "";

    const formatDateKey = (y, m, d) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

    function showToast(msg, isError = false) {
        const el = document.getElementById("toast");
        if (!el) return;
        el.textContent = msg;
        el.className = isError ? "error show" : "show";
        setTimeout(() => { el.className = ""; }, 2600);
    }

    function applyBodyModeClass() {
        document.body.classList.remove("mode-default", "mode-breakfast", "mode-lunch", "mode-dinner", "mode-slot-1", "mode-slot-2", "mode-slot-3");
        if (!activePlugin || !activeTab) {
            document.body.classList.add("mode-default");
            return;
        }
        const tabIdx = (activePlugin.tabs || []).findIndex(t => t.id === activeTab);
        if (["breakfast", "lunch", "dinner"].includes(activeTab)) document.body.classList.add(`mode-${activeTab}`);
        else if (tabIdx >= 0) document.body.classList.add(`mode-slot-${(tabIdx % 3) + 1}`);
        else document.body.classList.add("mode-default");
    }

    function buildShell() {
        if (document.getElementById("core-calendar-shell")) return;
        const root = document.getElementById("plugin-views");
        if (!root) return;

        const shell = document.createElement("div");
        shell.id = "core-calendar-shell";
        shell.innerHTML = `
            <header class="screen-only">
                <div class="month-nav">
                    <button type="button" id="cal-prev-month" class="nav-arrow">&#9664; Prev</button>
                    <h1 id="month-title"></h1>
                    <button type="button" id="cal-next-month" class="nav-arrow">Next &#9654;</button>
                </div>
                <div class="header-controls">
                    <button type="button" id="cal-full-view-btn" class="btn-outline">Full View</button>
                    <div id="plugin-header-actions" style="display: contents;"></div>
                </div>
                <div id="view-switcher" class="view-switcher"></div>
            </header>

            <button type="button" id="exit-kiosk-btn" class="hidden screen-only">✕ Exit Full View</button>

            <div id="calendar-view">
                <div class="calendar-bar screen-only">
                    <div id="calendar-tabs" class="tabs"></div>
                    <div id="calendar-actions" class="calendar-actions"></div>
                </div>
                <div class="calendar-wrapper">
                    <div class="weekdays">${DAYS.map(d => `<div>${d}</div>`).join("")}</div>
                    <div id="calendar-grid" class="calendar-grid"></div>
                </div>
            </div>
        `;
        root.prepend(shell);

        shell.querySelector("#cal-prev-month").addEventListener("click", () => changeMonth(-1));
        shell.querySelector("#cal-next-month").addEventListener("click", () => changeMonth(1));
        shell.querySelector("#cal-full-view-btn").addEventListener("click", () => toggleFullView(true));
        shell.querySelector("#exit-kiosk-btn").addEventListener("click", () => toggleFullView(false));

        document.addEventListener("fullscreenchange", () => {
            if (!document.fullscreenElement && document.body.classList.contains("kiosk-active")) {
                document.body.classList.remove("kiosk-active");
                document.getElementById("exit-kiosk-btn")?.classList.add("hidden");
            }
        });
    }

    function toggleFullView(active) {
        document.body.classList.toggle("kiosk-active", active);
        document.getElementById("exit-kiosk-btn")?.classList.toggle("hidden", !active);
        if (active) document.documentElement.requestFullscreen?.().catch(() => {});
        else if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    }

    function renderTabsAndActions() {
        const tabsEl = document.getElementById("calendar-tabs");
        const actionsEl = document.getElementById("calendar-actions");
        if (!tabsEl || !actionsEl) return;

        const tabs = activePlugin?.tabs || [];
        if (tabs.length && !tabs.some(t => t.id === activeTab)) activeTab = tabs.at(0).id;
        if (!tabs.length) activeTab = "";
        applyBodyModeClass();

        tabsEl.innerHTML = tabs.map(t => `<button type="button" class="tab ${t.id === activeTab ? "active" : ""}" data-tab-id="${t.id}">${t.label}</button>`).join("");
        tabsEl.querySelectorAll("button[data-tab-id]").forEach(btn => {
            btn.addEventListener("click", () => {
                activeTab = btn.dataset.tabId;
                renderTabsAndActions();
                render();
                window.CoreBus?.emit("calendar:tabChanged", { activeTab });
            });
        });

        actionsEl.innerHTML = "";
        (activePlugin?.actions || []).forEach(act => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = act.className || "btn-outline";
            btn.textContent = act.label;
            btn.addEventListener("click", e => act.onClick?.(e));
            actionsEl.appendChild(btn);
        });
    }

    function createCell(year, month, day, isAdjacent) {
        const dateKey = formatDateKey(year, month, day);
        const now = new Date();
        const isToday = !isAdjacent && year === now.getFullYear() && month === now.getMonth() && day === now.getDate();

        const cell = document.createElement("div");
        cell.className = `day-cell${isAdjacent ? " adjacent-month" : ""}${isToday ? " current-day" : ""}`;
        cell.dataset.dateKey = dateKey;

        const contentHTML = typeof activePlugin?.renderDay === "function"
            ? activePlugin.renderDay({ dateKey, year, month, day, isAdjacent, activeTab })
            : "";

        cell.innerHTML = `<div class="day-num">${day}</div>${contentHTML}`;
        cell.addEventListener("click", () => {
            if (isAdjacent) {
                viewYear = year;
                viewMonth = month;
                render();
                window.CoreBus?.emit("calendar:monthChanged", { year: viewYear, month: viewMonth });
            }
            window.CoreBus?.emit("calendar:dayClicked", { dateKey, year, month, day, activeTab });
        });
        return cell;
    }

    function render() {
        if (window.CorePlugins && !window.CorePlugins.isEnabled("calendar")) return;
        buildShell();
        const titleEl = document.getElementById("month-title");
        const gridEl = document.getElementById("calendar-grid");
        if (!titleEl || !gridEl) return;

        titleEl.textContent = `${MONTHS.at(viewMonth)} ${viewYear}`;
        gridEl.innerHTML = "";

        const firstDay = new Date(viewYear, viewMonth, 1).getDay();
        const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();
        const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
        const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
        const prevMonthDays = new Date(prevYear, prevMonth + 1, 0).getDate();

        for (let i = firstDay - 1; i >= 0; i--) gridEl.appendChild(createCell(prevYear, prevMonth, prevMonthDays - i, true));
        for (let d = 1; d <= totalDays; d++) gridEl.appendChild(createCell(viewYear, viewMonth, d, false));

        const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
        const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
        const trailing = (7 - ((firstDay + totalDays) % 7)) % 7;
        for (let d = 1; d <= trailing; d++) gridEl.appendChild(createCell(nextYear, nextMonth, d, true));

        window.CoreBus?.emit("calendar:rendered", { year: viewYear, month: viewMonth, activeTab });
    }

    function changeMonth(delta) {
        viewMonth += delta;
        if (viewMonth < 0) { viewMonth = 11; viewYear--; }
        if (viewMonth > 11) { viewMonth = 0; viewYear++; }
        render();
        window.CoreBus?.emit("calendar:monthChanged", { year: viewYear, month: viewMonth });
    }

    function registerPlugin(pluginDef) {
        activePlugin = pluginDef;
        activeTab = pluginDef?.tabs?.at(0)?.id || "";
        renderTabsAndActions();
        render();
    }

    window.CorePlugins?.register({
        id: "calendar",
        icon: "📅",
        title: "Monthly Calendar",
        description: "Core monthly calendar grid, navigation, and Full View",
        defaultEnabled: true,
        enable() {
            buildShell();
            document.getElementById("core-calendar-shell")?.classList.remove("hidden");
            render();
        },
        disable() {
            toggleFullView(false);
            document.getElementById("core-calendar-shell")?.classList.add("hidden");
        }
    });

    return {
        render,
        registerPlugin,
        showToast,
        formatDateKey,
        getViewDate: () => ({ year: viewYear, month: viewMonth, activeTab })
    };
})();
