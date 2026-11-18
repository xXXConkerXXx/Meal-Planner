(function (N) {
    window.HOLIDAY_SONGS = window.HOLIDAY_SONGS || {};
    Object.assign(window.HOLIDAY_SONGS, {
        7: Array.of(
            {
                name: "Late Summer Sunset", ensemble: "Piano, Strings & Harp", tempo: 460,
                lead: Array.of("piano", "strings"), pad: "harp", perc: "none",
                notes: Array.of(
                    Array.of(N.C5, 1.5, N.F2, Array.of(N.F3, N.A3, N.C4), N.A4), Array.of(N.B4, 0.5, null, null, N.G4), Array.of(N.A4, 1, null, null, N.F4),
                    Array.of(N.G4, 1.5, N.C2, Array.of(N.C3, N.G3, N.E4), N.E4), Array.of(N.A4, 0.5, null, null, N.F4), Array.of(N.G4, 1, null, null, N.E4),
                    Array.of(N.F4, 1, N.D2, Array.of(N.D3, N.A3, N.D4), N.D4), Array.of(N.G4, 1, N.G2, Array.of(N.G3, N.B3, N.D4), N.D4), Array.of(N.A4, 1, null, null, N.F4),
                    Array.of(N.G4, 2.5, N.C2, Array.of(N.C3, N.G3, N.E4), N.E4)
                )
            },
            {
                name: "Meadow Cicadas", ensemble: "Flute, Celesta & Harp", tempo: 430,
                lead: Array.of("flute", "celesta"), pad: "harp", perc: "chime",
                notes: Array.of(
                    Array.of(N.E4, 1, N.C2, Array.of(N.C3, N.G3, N.E4), N.C4), Array.of(N.G4, 1, null, null, N.E4), Array.of(N.A4, 1, null, null, N.F4),
                    Array.of(N.G4, 2, N.C2, Array.of(N.C3, N.G3, N.E4), N.E4), Array.of(N.C5, 1, null, null, N.G4),
                    Array.of(N.B4, 1, N.G2, Array.of(N.G3, N.B3, N.D4), N.G4), Array.of(N.A4, 1, null, null, N.F4), Array.of(N.G4, 1, null, null, N.E4),
                    Array.of(N.E4, 2.5, N.C2, Array.of(N.C3, N.G3, N.E4), N.C4)
                )
            },
            {
                name: "Golden Harvest", ensemble: "Piano, Harp & Warm Strings", tempo: 440,
                lead: Array.of("piano", "strings"), pad: "harp", perc: "none",
                notes: Array.of(
                    Array.of(N.A4, 1, N.F2, Array.of(N.F3, N.A3, N.C4), N.F4), Array.of(N.C5, 1, null, null, N.A4), Array.of(N.E5, 1, null, null, N.C5),
                    Array.of(N.D5, 1, N.G2, Array.of(N.G3, N.B3, N.D4), N.B4), Array.of(N.C5, 1, null, null, N.A4), Array.of(N.B4, 1, null, null, N.G4),
                    Array.of(N.A4, 2, N.A2, Array.of(N.A3, N.E4, N.C5), N.E4),
                    Array.of(N.G4, 1, N.C2, Array.of(N.C3, N.G3, N.E4), N.E4), Array.of(N.A4, 1, N.F2, Array.of(N.F3, N.A3, N.C4), N.F4), Array.of(N.B4, 1, N.G2, Array.of(N.G3, N.B3, N.D4), N.G4),
                    Array.of(N.C5, 2.5, N.C2, Array.of(N.C3, N.G3, N.E4), N.E4)
                )
            }
        )
    });
})(window.HOLIDAY_NOTES);
