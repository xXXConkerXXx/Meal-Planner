window.RecipeFuzzyMatch = (function () {
    function editDistance(a, b) {
        if (Math.abs(a.length - b.length) > 1) return 99;
        const dp = Array.from({ length: a.length + 1 }, (_, i) => i);
        for (let j = 1; j <= b.length; j++) {
            let prev = dp.at(0);
            dp[0] = j;
            for (let i = 1; i <= a.length; i++) {
                const temp = dp.at(i);
                dp[i] = a[i - 1] === b[j - 1] ? prev : 1 + Math.min(prev, dp.at(i), dp.at(i - 1));
                prev = temp;
            }
        }
        return dp.at(a.length);
    }

    function findMatches(query, pool, maxResults = 8) {
        const q = String(query || "").toLowerCase().trim();
        if (q.length < 1) return [];

        if (pool.some(word => word.toLowerCase() === q)) return [];

        const qTokens = q.split(/\s+/);
        const starts = [], wordStarts = [], fuzzy = [];

        pool.forEach(word => {
            const w = word.toLowerCase();
            if (w.startsWith(q)) {
                starts.push(word);
                return;
            }

            const wTokens = w.split(/\s+/);
            if (qTokens.length > 1) {
                if (qTokens.every(qt => wTokens.some(wt => wt.startsWith(qt)))) {
                    wordStarts.push(word);
                }
                return;
            }

            if (wTokens.some(wt => wt.startsWith(q))) {
                wordStarts.push(word);
            } else if (q.length >= 5 && w.at(0) === q.at(0)) {
                const firstWord = wTokens.at(0);
                if (editDistance(q, firstWord) <= 1 || editDistance(q, w) <= 1) {
                    fuzzy.push(word);
                }
            }
        });

        return [...starts, ...wordStarts, ...fuzzy].slice(0, maxResults);
    }

    return { findMatches };
})();
