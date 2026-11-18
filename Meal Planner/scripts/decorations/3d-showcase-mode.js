(function () {
    let isImmersive = false;
    let toggleBtn = null;
    let navPill = null;

    const UI_SELECTORS = ["header", "#preview-view", "#edit-view", "#grocery-view", "#holiday-banner", "#ny-countdown-corners"];

    function dockMusicPlayerGlobally() {
        const previewView = document.getElementById("preview-view");
        if (!previewView) return;

        const slider = previewView.querySelector("input[type='range']");
        if (!slider) return;

        let playerBar = slider.parentElement;
        while (playerBar && playerBar.parentElement !== previewView) {
            playerBar = playerBar.parentElement;
        }
        if (!playerBar || playerBar.dataset.globalDocked) return;

        playerBar.dataset.globalDocked = "1";
        playerBar.classList.add("screen-only");
        playerBar.style.position = "fixed";
        playerBar.style.bottom = "12px";
        playerBar.style.left = "50%";
        playerBar.style.transform = "translateX(-50%)";
        playerBar.style.width = "min(960px, calc(100vw - 28px))";
        playerBar.style.margin = "0";
        playerBar.style.zIndex = "20";
        playerBar.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.35)";

        document.body.appendChild(playerBar);
        document.body.style.paddingBottom = "64px";
    }

    function stepMonth(delta) {
        if (typeof changeMonth === "function") {
            changeMonth(delta);
        } else if (typeof viewMonth === "number" && typeof viewYear === "number") {
            viewMonth += delta;
            if (viewMonth < 0) { viewMonth = 11; viewYear--; }
            if (viewMonth > 11) { viewMonth = 0; viewYear++; }
            if (typeof refreshAllViews === "function") refreshAllViews();
        }
        syncMonthLabel();
    }

    function syncMonthLabel() {
        if (!navPill) return;
        const labelEl = navPill.querySelector(".showcase-month-label");
        if (!labelEl) return;
        const h1Text = document.querySelector("h1")?.textContent?.trim();
        if (h1Text) {
            labelEl.textContent = h1Text;
        } else if (typeof viewYear === "number" && typeof viewMonth === "number") {
            labelEl.textContent = new Date(viewYear, viewMonth, 1).toLocaleString("default", { month: "long", year: "numeric" });
        }
    }

    function applyModeState() {
        dockMusicPlayerGlobally();
        document.body.dataset.immersive3d = isImmersive ? "1" : "";

        UI_SELECTORS.forEach(sel => {
            document.querySelectorAll(sel).forEach(el => {
                if (isImmersive) {
                    if (!el.dataset.prevDisplay) el.dataset.prevDisplay = el.style.display || "";
                    el.style.display = "none";
                } else {
                    el.style.display = el.dataset.prevDisplay || "";
                }
            });
        });

        if (navPill) {
            navPill.style.display = isImmersive ? "flex" : "none";
            if (isImmersive) syncMonthLabel();
        }
    }

    function setImmersive(active) {
        isImmersive = Boolean(active);
        applyModeState();
    }

    function placeToggleButton() {
        const header = document.querySelector("header");
        if (!header) {
            document.body.appendChild(toggleBtn);
            return;
        }

        const kitchenBtn = Array.from(header.querySelectorAll("button")).find(b => /kitchen mode/i.test(b.textContent));
        if (kitchenBtn && kitchenBtn.parentElement) {
            kitchenBtn.insertAdjacentElement("afterend", toggleBtn);
        } else {
            header.appendChild(toggleBtn);
        }
    }

    function init() {
        toggleBtn = document.createElement("button");
        toggleBtn.type = "button";
        toggleBtn.id = "showcase-enter-btn";
        toggleBtn.className = "btn-outline screen-only";
        toggleBtn.title = "Hide UI to view 3D seasonal scene (Shortcut: H)";
        toggleBtn.textContent = "✨ 3D View";
        toggleBtn.addEventListener("click", () => setImmersive(true));
        placeToggleButton();

        navPill = document.createElement("div");
        navPill.id = "showcase-nav-pill";
        navPill.className = "panel screen-only";
        navPill.style.cssText = `
            position: fixed; top: 14px; left: 50%; transform: translateX(-50%); z-index: 20;
            display: none; align-items: center; gap: 10px;
            padding: 8px 14px; border-radius: 10px;
            background: var(--bg-card); color: var(--text-main);
            border: 1px solid var(--border-color);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        `;
        navPill.innerHTML = `
            <button type="button" class="btn-outline sc-prev" title="Previous Month (Left Arrow)" style="padding: 4px 10px;">◀</button>
            <span class="showcase-month-label" style="min-width: 145px; text-align: center; font-weight: bold; font-size: 0.95rem; color: var(--title-color);"></span>
            <button type="button" class="btn-outline sc-next" title="Next Month (Right Arrow)" style="padding: 4px 10px;">▶</button>
            <button type="button" class="btn-green sc-exit" title="Restore UI (H or Esc)" style="margin-left: 4px; padding: 5px 12px; font-size: 0.80rem;">👁 Show UI</button>
        `;

        navPill.querySelector(".sc-prev").addEventListener("click", () => stepMonth(-1));
        navPill.querySelector(".sc-next").addEventListener("click", () => stepMonth(1));
        navPill.querySelector(".sc-exit").addEventListener("click", () => setImmersive(false));
        document.body.appendChild(navPill);

        dockMusicPlayerGlobally();
        const previewView = document.getElementById("preview-view");
        if (previewView) {
            new MutationObserver(dockMusicPlayerGlobally).observe(previewView, { childList: true, subtree: true });
        }

        window.addEventListener("keydown", e => {
            const tag = (document.activeElement?.tagName || "").toLowerCase();
            if (tag === "input" || tag === "textarea" || tag === "select") return;

            if (e.key === "h" || e.key === "H") {
                e.preventDefault();
                setImmersive(!isImmersive);
            } else if (isImmersive && e.key === "Escape") {
                e.preventDefault();
                setImmersive(false);
            } else if (isImmersive && e.key === "ArrowLeft") {
                e.preventDefault();
                stepMonth(-1);
            } else if (isImmersive && e.key === "ArrowRight") {
                e.preventDefault();
                stepMonth(1);
            }
        });
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
})();
