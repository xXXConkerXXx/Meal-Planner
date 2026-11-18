window.HolidayDecor = (function () {
    const getSeason = m => (m === 11 || m <= 1) ? "winter" : (m <= 4 ? "spring" : (m <= 7 ? "summer" : "fall"));

    function clearDecorations() {
        document.getElementById("season-badge")?.remove();
        document.getElementById("holiday-ambient-banner")?.remove();
        document.querySelectorAll("#calendar-grid .holiday-label").forEach(el => el.remove());
    }

    function updateSeasonBadge(month) {
        const headerControls = document.querySelector(".header-controls");
        if (!headerControls) return;
        let badge = document.getElementById("season-badge");
        if (!badge) {
            badge = document.createElement("span");
            badge.id = "season-badge";
            headerControls.insertBefore(badge, headerControls.firstChild);
        }
        badge.textContent = `Season: ${getSeason(month)}`;
    }

    function decorate() {
        if (!window.HolidayDates) return;
        if (window.CorePlugins && !window.CorePlugins.isEnabled("holiday-decor")) {
            clearDecorations();
            return;
        }

        const grid = document.getElementById("calendar-grid");
        const calView = document.getElementById("calendar-view");
        if (!grid || !calView) return;

        const view = window.CoreCalendar?.getViewDate?.() || { year: new Date().getFullYear(), month: new Date().getMonth() };
        updateSeasonBadge(view.month);
        const theme = window.HolidayDates.BANNERS.at(view.month);

        let banner = document.getElementById("holiday-ambient-banner");
        if (!banner) {
            banner = document.createElement("div");
            banner.id = "holiday-ambient-banner";
            banner.className = "screen-only";
            calView.insertBefore(banner, calView.firstChild);
        }
        banner.style.cssText = `max-width: 1100px; margin: 0 auto 12px auto; padding: 7px 14px; border-radius: 8px; border: 1px solid ${theme.border}; background: ${theme.bg}; display: flex; justify-content: space-between; align-items: center; font-size: 0.88rem; font-weight: bold;`;
        banner.innerHTML = `<span>${theme.icons}</span><span>${theme.title}</span><span>${theme.icons}</span>`;

        const holidayMap = window.HolidayDates.getMonthMap(view.year, view.month);
        grid.querySelectorAll(".day-cell").forEach(cell => {
            cell.querySelector(".holiday-label")?.remove();
            if (cell.classList.contains("adjacent-month") || cell.classList.contains("empty")) return;

            const numEl = cell.querySelector(".day-num");
            if (!numEl) return;
            const dayNum = parseInt(numEl.textContent, 10);
            const hol = holidayMap[dayNum];
            if (!hol) return;

            numEl.style.display = "flex";
            numEl.style.justifyContent = "space-between";
            numEl.style.alignItems = "center";
            numEl.style.gap = "4px";

            const badge = document.createElement("span");
            badge.className = "holiday-label";
            badge.textContent = `${hol.icon} ${hol.name}`;
            badge.title = hol.name;
            badge.style.cssText = `font-size: 0.68rem; font-weight: bold; color: #ffffff; background: ${hol.color}; padding: 1px 6px; border-radius: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 82%;`;
            numEl.appendChild(badge);
        });
    }

    window.CoreBus?.on("calendar:rendered", decorate);

    window.CorePlugins?.register({
        id: "holiday-decor",
        requires: Array.of("calendar"),
        icon: "🎊",
        title: "Holiday Banners & Badges",
        description: "Season badge, seasonal top banner, and holiday day badges",
        defaultEnabled: true,
        enable() { decorate(); },
        disable() { clearDecorations(); }
    });

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", decorate);
    else decorate();

    return { decorate };
})();
