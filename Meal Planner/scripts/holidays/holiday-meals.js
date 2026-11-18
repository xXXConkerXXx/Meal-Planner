(function () {
    function init() {
        const patternSel = document.getElementById("assign-pattern");
        const singleBox = document.getElementById("single-day-box");
        const slotSel = document.getElementById("assign-slot");
        const mealSel = document.getElementById("assign-meal");
        if (!patternSel || !singleBox || !slotSel || !mealSel || !window.HolidayRules || !window.HolidayRepeatStore) return;
        if (patternSel.dataset.holidayIntegrated) return;
        patternSel.dataset.holidayIntegrated = "1";

        const card = patternSel.closest(".panel") || patternSel.parentElement.parentElement;

        // Mount Side Dishes dropdown directly ABOVE the "Placement Pattern" label
        if (window.AssignSidesPicker) {
            const patternLabel = Array.from(card.querySelectorAll("label")).find(l => l.textContent.trim().startsWith("Placement Pattern"));
            window.AssignSidesPicker.mountBefore(patternLabel || patternSel);
        }

        const opt = document.createElement("option");
        opt.value = "repeat-holiday";
        opt.textContent = "Repeat Every Year on Holiday";
        patternSel.appendChild(opt);

        const holBox = document.createElement("div");
        holBox.id = "holiday-box";
        holBox.className = "hidden";
        holBox.innerHTML = `
            <label for="assign-holiday">Select Holiday</label>
            <select id="assign-holiday">
                ${window.HolidayRules.LIST.map(h => `<option value="${h.id}">${h.icon} ${h.name}</option>`).join("")}
            </select>
        `;
        singleBox.parentNode.insertBefore(holBox, singleBox.nextSibling);

        const origToggle = window.togglePatternInputs;
        window.togglePatternInputs = function () {
            if (typeof origToggle === "function") origToggle();
            const isHol = patternSel.value === "repeat-holiday";
            holBox.classList.toggle("hidden", !isHol);
            if (isHol) {
                singleBox.classList.add("hidden");
                const wkBox = document.getElementById("weekday-box");
                if (wkBox) wkBox.classList.add("hidden");
            }
        };

        const origUpdateDropdown = window.updateAssignMealDropdown;
        window.updateAssignMealDropdown = function () {
            if (typeof origUpdateDropdown === "function") origUpdateDropdown();
            if (window.AssignSidesPicker) window.AssignSidesPicker.refresh();
        };

        const origApply = window.applyMealPlacement;
        window.applyMealPlacement = function () {
            const slot = slotSel.value;
            const idx = mealSel.value;
            if (idx === "") return showToast("Add a main dish first!", true);

            const mainDish = meals.at(Number(idx));
            const selectedSides = window.AssignSidesPicker ? window.AssignSidesPicker.getSelectedDishes() : [];
            if (window.AssignSidesPicker) window.AssignSidesPicker.closePopover();

            if (patternSel.value === "repeat-holiday") {
                const holidayId = document.getElementById("assign-holiday").value;
                window.HolidayRepeatStore.upsert({
                    holidayId,
                    slot,
                    mainName: mainDish.name,
                    sideNames: selectedSides.map(s => s.name)
                });
                if (typeof saveToDisk === "function") saveToDisk();
                if (typeof refreshAllViews === "function") refreshAllViews();
                if (window.HolidayRepeatList) window.HolidayRepeatList.render(card);
                showToast(`Scheduled "${mainDish.name}" every year!`);
                return;
            }

            const beforeKeys = new Set(Object.keys(yearlyPlan).filter(k => yearlyPlan[k]?.[slot]?.main?.name === mainDish.name));
            if (typeof origApply === "function") origApply();

            if (selectedSides.length) {
                Object.keys(yearlyPlan).forEach(k => {
                    const entry = yearlyPlan[k]?.[slot];
                    if (entry && entry.main && entry.main.name === mainDish.name && (!beforeKeys.has(k) || patternSel.value === "single")) {
                        entry.sides = Array.from(selectedSides);
                    }
                });
                if (typeof saveToDisk === "function") saveToDisk();
                if (typeof refreshAllViews === "function") refreshAllViews();
            }
        };

        window.HolidayRepeatStore.syncAll();
        if (window.HolidayRepeatList) window.HolidayRepeatList.render(card);
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
})();
