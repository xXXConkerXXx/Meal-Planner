(function (N) {
    window.HOLIDAY_SONGS = window.HOLIDAY_SONGS || {};
    Object.assign(window.HOLIDAY_SONGS, {
        4: Array.of(
            {
                name: "Sunlit Orchard", ensemble: "Piano, Flute & Harp", tempo: 420,
                lead: Array.of("piano", "flute"), pad: "harp", perc: "chime",
                notes: Array.of(
                    Array.of(N.F4, 1, N.F2, Array.of(N.F3, N.A3, N.C4), N.C4), Array.of(N.A4, 1, null, null, N.F4), Array.of(N.C5, 1, null, null, N.A4),
                    Array.of(N.D5, 1.5, N.Bb2, Array.of(N.Bb3, N.D4, N.F4), N.Bb4), Array.of(N.C5, 0.5, null, null, N.A4), Array.of(N.A4, 1, null, null, N.F4),
                    Array.of(N.G4, 1, N.C2, Array.of(N.C3, N.G3, N.Bb3), N.E4), Array.of(N.A4, 1, null, null, N.F4), Array.of(N.Bb4, 1, null, null, N.G4),
                    Array.of(N.A4, 2.5, N.F2, Array.of(N.F3, N.A3, N.C4), N.F4)
                )
            },
            {
                name: "Warm Breeze", ensemble: "Strings, Celesta & Harp", tempo: 450,
                lead: Array.of("strings", "celesta"), pad: "harp", perc: "none",
                notes: Array.of(
                    Array.of(N.A4, 1, N.F2, Array.of(N.F3, N.A3, N.C4), N.F4), Array.of(N.G4, 1, null, null, N.E4), Array.of(N.F4, 1, null, null, N.C4),
                    Array.of(N.G4, 2, N.C2, Array.of(N.C3, N.G3, N.E4), N.E4), Array.of(N.C5, 1, null, null, N.G4),
                    Array.of(N.Bb4, 1, N.Bb2, Array.of(N.Bb3, N.D4, N.F4), N.G4), Array.of(N.A4, 1, null, null, N.F4), Array.of(N.G4, 1, null, null, N.E4),
                    Array.of(N.F4, 2.5, N.F2, Array.of(N.F3, N.A3, N.C4), N.C4)
                )
            },
            {
                name: "May Blossom Waltz", ensemble: "Piano, Flute & Strings", tempo: 430,
                lead: Array.of("piano", "flute"), pad: "strings", perc: "chime",
                notes: Array.of(
                    Array.of(N.C5, 1, N.F2, Array.of(N.F3, N.A3, N.C4), N.A4), Array.of(N.A4, 1, null, null, N.F4), Array.of(N.F4, 1, null, null, N.C4),
                    Array.of(N.G4, 1, N.C2, Array.of(N.C3, N.G3, N.E4), N.E4), Array.of(N.A4, 1.5, null, null, N.F4), Array.of(N.Bb4, 0.5, null, null, N.G4),
                    Array.of(N.C5, 2, N.F2, Array.of(N.F3, N.A3, N.C4), N.A4),
                    Array.of(N.D5, 1, N.Bb2, Array.of(N.Bb3, N.D4, N.F4), N.Bb4), Array.of(N.C5, 1, N.F2, Array.of(N.F3, N.A3, N.C4), N.A4), Array.of(N.Bb4, 1, N.C2, Array.of(N.C3, N.G3, N.Bb3), N.G4),
                    Array.of(N.A4, 1, N.F2, Array.of(N.F3, N.A3, N.C4), N.F4), Array.of(N.G4, 1, N.C2, Array.of(N.C3, N.G3, N.Bb3), N.E4), Array.of(N.F4, 2.5, N.F2, Array.of(N.F3, N.A3, N.C4), N.C4)
                )
            }
        )
    });
})(window.HOLIDAY_NOTES);
