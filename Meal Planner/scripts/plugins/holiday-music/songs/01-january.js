(function (N) {
    window.HOLIDAY_SONGS = window.HOLIDAY_SONGS || {};
    Object.assign(window.HOLIDAY_SONGS, {
        0: Array.of(
            {
                name: "Winter Starlight", ensemble: "Celesta, Harp & Strings", tempo: 440,
                lead: Array.of("celesta", "strings"), pad: "harp", perc: "chime",
                notes: Array.of(
                    Array.of(N.G4, 1, N.C2, Array.of(N.C3, N.G3, N.E4), N.E4), Array.of(N.E5, 1.5, null, null, N.C5), Array.of(N.D5, 0.5, null, null, N.B4),
                    Array.of(N.C5, 1, N.A2, Array.of(N.A3, N.E4, N.C5), N.A4), Array.of(N.B4, 1, null, null, N.G4), Array.of(N.A4, 1, null, null, N.E4),
                    Array.of(N.G4, 2, N.F2, Array.of(N.F3, N.A3, N.C4), N.C4), Array.of(N.A4, 1, null, null, N.F4),
                    Array.of(N.B4, 1, N.G2, Array.of(N.G3, N.B3, N.D4), N.G4), Array.of(N.D5, 1, null, null, N.B4), Array.of(N.C5, 2.5, N.C2, Array.of(N.C3, N.G3, N.E4), N.E4)
                )
            },
            {
                name: "Frosty Morning", ensemble: "Flute, Piano & Celesta", tempo: 410,
                lead: Array.of("flute", "piano"), pad: "celesta", perc: "chime",
                notes: Array.of(
                    Array.of(N.E4, 1, N.C2, Array.of(N.C3, N.G3, N.E4), N.C4), Array.of(N.F4, 0.5, null, null, N.D4), Array.of(N.G4, 1.5, null, null, N.E4),
                    Array.of(N.A4, 1, N.F2, Array.of(N.F3, N.A3, N.C4), N.F4), Array.of(N.G4, 1, null, null, N.E4), Array.of(N.E4, 1, null, null, N.C4),
                    Array.of(N.D4, 1.5, N.G2, Array.of(N.G3, N.B3, N.D4), N.B3), Array.of(N.E4, 0.5, null, null, N.C4), Array.of(N.F4, 1, null, null, N.D4),
                    Array.of(N.E4, 2.5, N.C2, Array.of(N.C3, N.G3, N.E4), N.C4)
                )
            },
            {
                name: "Auld Lang Syne", ensemble: "Piano, Strings & Chimes", tempo: 450,
                lead: Array.of("piano", "strings"), pad: "harp", perc: "chime",
                notes: Array.of(
                    Array.of(N.C4, 1, N.F2, Array.of(N.F3, N.A3, N.C4), N.A3), Array.of(N.F4, 1.5, N.F2, Array.of(N.F3, N.A3, N.C4), N.C4), Array.of(N.E4, 0.5, null, null, N.Bb3),
                    Array.of(N.F4, 1, N.F2, Array.of(N.F3, N.A3, N.C4), N.A3), Array.of(N.A4, 1, null, null, N.F4),
                    Array.of(N.G4, 1.5, N.C2, Array.of(N.C3, N.G3, N.Bb3), N.E4), Array.of(N.F4, 0.5, null, null, N.D4),
                    Array.of(N.G4, 1, N.C2, Array.of(N.C3, N.G3, N.Bb3), N.E4), Array.of(N.A4, 1, null, null, N.F4),
                    Array.of(N.F4, 1.5, N.F2, Array.of(N.F3, N.A3, N.C4), N.C4), Array.of(N.F4, 0.5, null, null, N.A3),
                    Array.of(N.A4, 1, N.D2, Array.of(N.D3, N.A3, N.D4), N.F4), Array.of(N.C5, 1, null, null, N.A4),
                    Array.of(N.D5, 2.5, N.Bb2, Array.of(N.Bb3, N.D4, N.F4), N.Bb4),
                    Array.of(N.D5, 0.5, N.Bb2, null, N.Bb4), Array.of(N.C5, 1.5, N.F2, Array.of(N.F3, N.A3, N.C4), N.A4), Array.of(N.A4, 0.5, null, null, N.F4),
                    Array.of(N.A4, 1, N.F2, Array.of(N.F3, N.A3, N.C4), N.F4), Array.of(N.F4, 1, null, null, N.C4),
                    Array.of(N.G4, 1.5, N.C2, Array.of(N.C3, N.G3, N.Bb3), N.E4), Array.of(N.F4, 0.5, null, null, N.D4),
                    Array.of(N.G4, 1, N.C2, Array.of(N.C3, N.G3, N.Bb3), N.E4), Array.of(N.A4, 1, null, null, N.F4),
                    Array.of(N.F4, 1.5, N.D2, Array.of(N.D3, N.A3, N.D4), N.D4), Array.of(N.D4, 0.5, null, null, N.A3),
                    Array.of(N.D4, 1, N.Bb2, Array.of(N.Bb3, N.D4, N.F4), N.Bb3), Array.of(N.C4, 1, N.C2, Array.of(N.C3, N.G3, N.Bb3), N.G3),
                    Array.of(N.F4, 2.5, N.F2, Array.of(N.F3, N.A3, N.C4), N.A3)
                )
            }
        )
    });
})(window.HOLIDAY_NOTES);
