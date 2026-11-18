window.CountdownTargets = (function () {
    let manualMode = null;

    function resolveMode(now, mIdx) {
        if (mIdx === 6 || (now.getMonth() === 6 && now.getDate() === 4)) return "july4";
        if (manualMode) return manualMode;
        if (mIdx === 11) {
            if (now.getMonth() === 11 && now.getDate() > 25) return "ny";
            return "xmas";
        }
        return "ny";
    }

    return {
        setMode(mode) { manualMode = mode; },
        resetAuto() { manualMode = null; },
        getData(now, mIdx) {
            const mode = resolveMode(now, mIdx);
            const isXmas = mode === "xmas", isJuly4 = mode === "july4";
            let target, isCelebrationDay, subLabel, headingText, topText, bottomText;

            if (isJuly4) {
                const passed = now.getMonth() > 6 || (now.getMonth() === 6 && now.getDate() > 4);
                const yr = passed ? now.getFullYear() + 1 : now.getFullYear();
                target = new Date(yr, 6, 4, 0, 0, 0);
                isCelebrationDay = now.getMonth() === 6 && now.getDate() === 4;
                headingText = "🇺🇸 4TH OF JULY 🎆"; subLabel = `Jul 4, ${yr}`;
                topText = "🇺🇸 HAPPY"; bottomText = "4TH OF JULY!";
            } else if (isXmas) {
                const yr = (now.getMonth() === 11 && now.getDate() > 25) ? now.getFullYear() + 1 : now.getFullYear();
                target = new Date(yr, 11, 25, 0, 0, 0);
                isCelebrationDay = now.getMonth() === 11 && now.getDate() === 25;
                headingText = "🎄 25 Days of Xmas 🎄"; subLabel = `Dec 25, ${yr}`;
                topText = "🎅 MERRY"; bottomText = "CHRISTMAS!";
            } else {
                const yr = (now.getMonth() === 0 && now.getDate() === 1) ? now.getFullYear() : now.getFullYear() + 1;
                target = new Date(yr, 0, 1, 0, 0, 0);
                isCelebrationDay = now.getMonth() === 0 && now.getDate() === 1;
                headingText = "🎆 New Year 🎆"; subLabel = `Jan 1, ${yr}`;
                topText = "🎉 HAPPY"; bottomText = "NEW YEAR!";
            }

            const diff = isCelebrationDay ? 0 : Math.max(0, target - now);
            const pad = n => String(n).padStart(2, "0");
            return {
                mode, isXmas, isJuly4, showModeTabs: !isJuly4, isCelebrationDay, headingText, subLabel,
                daysDisplay: isCelebrationDay ? topText : `${Math.floor(diff / 86400000)}d`,
                hmsDisplay: isCelebrationDay ? bottomText : `${pad(Math.floor((diff % 86400000) / 3600000))}:${pad(Math.floor((diff % 3600000) / 60000))}:${pad(Math.floor((diff % 60000) / 1000))}`
            };
        }
    };
})();
