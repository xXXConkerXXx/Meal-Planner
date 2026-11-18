window.RecipeAutocomplete = (function () {
    const TOP_UNITS = ["cups", "cup", "tbsp", "tsp", "oz", "ounce", "lbs", "lb", "can", "stick", "bag", "clove"];
    let popup = null, activeInput = null, suggestions = [], selectedIdx = 0;

    function ensurePopup() {
        if (popup) return;
        popup = document.createElement("div");
        popup.id = "recipe-autocomplete-popup";
        popup.className = "hidden";
        popup.style.cssText = "position: fixed; z-index: 9999; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 6px; box-shadow: 0 8px 20px rgba(0, 0, 0, 0.45); overflow: hidden; min-width: 180px; max-width: 280px; font-size: 0.86rem;";
        document.body.appendChild(popup);
        document.addEventListener("click", e => {
            if (e.target !== activeInput && !popup.contains(e.target)) hidePopup();
        });
    }

    function hidePopup() {
        if (popup) popup.classList.add("hidden");
        suggestions = [];
        selectedIdx = 0;
    }

    function getCaretCoords(el) {
        const rect = el.getBoundingClientRect();
        if (el.tagName !== "TEXTAREA") {
            return { left: rect.left, top: rect.bottom + 4, width: Math.min(320, Math.max(200, rect.width)) };
        }

        const style = window.getComputedStyle(el);
        const mirror = document.createElement("div");
        const props = [
            "boxSizing", "width", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft",
            "borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth",
            "fontFamily", "fontSize", "fontWeight", "lineHeight", "letterSpacing", "wordSpacing", "whiteSpace", "wordWrap"
        ];
        mirror.style.cssText = `position: fixed; visibility: hidden; pointer-events: none; left: ${rect.left}px; top: ${rect.top}px; white-space: pre-wrap; word-wrap: break-word;`;
        props.forEach(p => { mirror.style[p] = style[p]; });

        const pos = el.selectionStart || 0;
        mirror.textContent = el.value.slice(0, pos);
        const marker = document.createElement("span");
        marker.textContent = "\u200b";
        mirror.appendChild(marker);
        document.body.appendChild(mirror);

        const mRect = marker.getBoundingClientRect();
        const lineHeight = parseFloat(style.lineHeight) || (parseFloat(style.fontSize) * 1.4) || 20;
        const left = Math.min(window.innerWidth - 220, Math.max(rect.left, mRect.left - el.scrollLeft));
        const top = Math.min(window.innerHeight - 180, Math.max(rect.top + lineHeight, mRect.top - el.scrollTop + lineHeight + 2));

        document.body.removeChild(mirror);
        return { left, top, width: 210 };
    }

    function renderPopup() {
        ensurePopup();
        if (!suggestions.length || !activeInput) return hidePopup();

        const coords = getCaretCoords(activeInput);
        popup.style.left = `${coords.left}px`;
        popup.style.top = `${coords.top}px`;
        popup.style.width = `${coords.width}px`;

        popup.innerHTML = suggestions.map((item, idx) => {
            const activeStyle = idx === selectedIdx ? "background: var(--mode-color); color: #fff;" : "color: var(--text-main);";
            return `<div data-ac-idx="${idx}" style="padding: 6px 10px; cursor: pointer; ${activeStyle}">${item}</div>`;
        }).join("");

        popup.classList.remove("hidden");
        popup.querySelectorAll("[data-ac-idx]").forEach(row => {
            row.addEventListener("mousedown", e => {
                e.preventDefault();
                applySuggestion(suggestions.at(Number(row.getAttribute("data-ac-idx"))));
            });
        });
    }

    function applySuggestion(chosen) {
        if (!chosen || !activeInput) return;
        if (activeInput.id === "meal-name") {
            activeInput.value = chosen;
            hidePopup();
            return;
        }

        const units = window.RecipeDictionary.MEASUREMENT_WORDS;
        const val = activeInput.value;
        const pos = activeInput.selectionStart || val.length;
        const lineStart = val.lastIndexOf("\n", pos - 1) + 1;
        const lineBeforeCursor = val.slice(lineStart, pos);
        const afterCursor = val.slice(pos);

        const qtyOnlyMatch = lineBeforeCursor.match(/^((?:\d+\s+)?(?:\d+\/\d+|\d+(?:\.\d+)?|[¼½¾⅓⅔⅛⅜⅝⅞]))\s*$/);
        const qtyUnitMatch = lineBeforeCursor.match(/^((?:\d+\s+)?(?:\d+\/\d+|\d+(?:\.\d+)?|[¼½¾⅓⅔⅛⅜⅝⅞]))\s+(?:([a-zA-Z]+)\s+)?(.*)$/);
        let replacedLine = chosen;

        if (qtyOnlyMatch) {
            replacedLine = `${qtyOnlyMatch.at(1)} ${chosen} `;
        } else if (qtyUnitMatch) {
            const qtyPart = qtyUnitMatch.at(1);
            const unitPart = qtyUnitMatch.at(2) || "";
            if (units.includes(chosen.toLowerCase())) replacedLine = `${qtyPart} ${chosen} `;
            else if (unitPart && units.includes(unitPart.toLowerCase())) replacedLine = `${qtyPart} ${unitPart} ${chosen}`;
            else replacedLine = `${qtyPart} ${chosen}`;
        }

        activeInput.value = val.slice(0, lineStart) + replacedLine + afterCursor;
        const newPos = lineStart + replacedLine.length;
        activeInput.setSelectionRange(newPos, newPos);
        hidePopup();
    }

    function handleInput(el) {
        activeInput = el;
        selectedIdx = 0;

        const learned = window.RecipeDictionary.getLearnedPools();
        if (el.id === "meal-name") {
            suggestions = window.RecipeFuzzyMatch.findMatches(el.value, learned.dishes);
            renderPopup();
            return;
        }

        const val = el.value;
        const pos = el.selectionStart || val.length;
        const lineStart = val.lastIndexOf("\n", pos - 1) + 1;
        const line = val.slice(lineStart, pos);

        if (/^(?:\d+\s+)?(?:\d+\/\d+|\d+(?:\.\d+)?|[¼½¾⅓⅔⅛⅜⅝⅞])\s+$/.test(line)) {
            suggestions = TOP_UNITS.slice(0, 8);
            renderPopup();
            return;
        }

        const unitTyping = line.match(/^(?:\d+\s+)?(?:\d+\/\d+|\d+(?:\.\d+)?|[¼½¾⅓⅔⅛⅜⅝⅞])\s+([a-zA-Z]{1,})$/);
        if (unitTyping) {
            const uQuery = unitTyping.at(1).toLowerCase();
            const unitMatches = window.RecipeDictionary.MEASUREMENT_WORDS.filter(u => u.startsWith(uQuery));
            const ingMatches = window.RecipeFuzzyMatch.findMatches(uQuery, learned.ingredients);
            suggestions = [...unitMatches, ...ingMatches].slice(0, 8);
            renderPopup();
            return;
        }

        const afterUnit = line.match(/^(?:\d+\s+)?(?:\d+\/\d+|\d+(?:\.\d+)?|[¼½¾⅓⅔⅛⅜⅝⅞])\s+[a-zA-Z]+\s+(.+)$/);
        const query = afterUnit ? afterUnit.at(1) : line.replace(/^[\d\/\.\s¼½¾⅓⅔⅛⅜⅝⅞]+/, "");
        suggestions = window.RecipeFuzzyMatch.findMatches(query, learned.ingredients);
        renderPopup();
    }

    function handleKeydown(e) {
        if (!popup || popup.classList.contains("hidden") || !suggestions.length) return;
        if (e.key === "ArrowDown") { e.preventDefault(); selectedIdx = (selectedIdx + 1) % suggestions.length; renderPopup(); }
        else if (e.key === "ArrowUp") { e.preventDefault(); selectedIdx = (selectedIdx - 1 + suggestions.length) % suggestions.length; renderPopup(); }
        else if (e.key === "Tab" || (e.key === "Enter" && activeInput?.id === "meal-name")) { e.preventDefault(); applySuggestion(suggestions.at(selectedIdx)); }
        else if (e.key === "Escape") hidePopup();
    }

    function attach() {
        ["meal-name", "meal-items"].forEach(id => {
            const el = document.getElementById(id);
            if (!el || el.dataset.acAttached) return;
            el.dataset.acAttached = "1";
            el.setAttribute("autocomplete", "off");
            el.setAttribute("spellcheck", "false");
            el.addEventListener("input", () => handleInput(el));
            el.addEventListener("keydown", handleKeydown);
        });
    }

    return { attach };
})();
