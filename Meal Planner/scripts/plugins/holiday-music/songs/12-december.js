(function (N) {
    window.HOLIDAY_SONGS = window.HOLIDAY_SONGS || {};
    Object.assign(window.HOLIDAY_SONGS, {
        11: Array.of(
            {
                name: "Silent Night", ensemble: "Celesta, Harp & Warm Strings", tempo: 490,
                lead: Array.of("celesta", "strings"), pad: "harp", perc: "chime",
                notes: Array.of(
                    Array.of(N.G4, 1.5, N.C2, Array.of(N.C3, N.G3, N.E4), N.E4), Array.of(N.A4, 0.5, null, null, N.F4), Array.of(N.G4, 1, null, null, N.E4),
                    Array.of(N.E4, 3, N.C2, Array.of(N.C3, N.G3, N.E4), N.C4),
                    Array.of(N.G4, 1.5, N.C2, Array.of(N.C3, N.G3, N.E4), N.E4), Array.of(N.A4, 0.5, null, null, N.F4), Array.of(N.G4, 1, null, null, N.E4),
                    Array.of(N.E4, 3, N.C2, Array.of(N.C3, N.G3, N.E4), N.C4),
                    Array.of(N.D5, 2, N.G2, Array.of(N.G3, N.B3, N.D4), N.B4), Array.of(N.D5, 1, null, null, N.B4),
                    Array.of(N.B4, 3, N.G2, Array.of(N.G3, N.B3, N.D4), N.G4),
                    Array.of(N.C5, 2, N.C2, Array.of(N.C3, N.G3, N.E4), N.G4), Array.of(N.C5, 1, null, null, N.G4),
                    Array.of(N.G4, 3, N.C2, Array.of(N.C3, N.G3, N.E4), N.E4)
                )
            },
            {
                name: "Deck the Halls", ensemble: "Brass, Celesta & Sleigh Bells", tempo: 370,
                lead: Array.of("brass", "celesta"), pad: "strings", perc: "sleigh",
                notes: Array.of(
                    Array.of(N.G4, 1.5, N.C2, Array.of(N.C3, N.G3, N.E4), N.E4), Array.of(N.F4, 0.5, null, null, N.D4), Array.of(N.E4, 1, null, null, N.C4), Array.of(N.D4, 1, null, null, N.B3),
                    Array.of(N.C4, 1, N.C2, Array.of(N.C3, N.G3, N.E4), N.G3), Array.of(N.D4, 1, null, null, N.B3), Array.of(N.E4, 1, null, null, N.C4), Array.of(N.C4, 1, null, null, N.G3),
                    Array.of(N.D4, 0.5, N.G2, Array.of(N.G3, N.B3, N.D4), N.B3), Array.of(N.E4, 0.5, null, null, N.C4), Array.of(N.F4, 0.5, null, null, N.D4), Array.of(N.D4, 0.5, null, null, N.B3),
                    Array.of(N.E4, 1.5, N.C2, Array.of(N.C3, N.G3, N.E4), N.C4), Array.of(N.D4, 0.5, null, null, N.B3), Array.of(N.C4, 1, N.G2, Array.of(N.G3, N.B3, N.D4), N.G3), Array.of(N.B3, 1, null, null, N.G3),
                    Array.of(N.C4, 2.5, N.C2, Array.of(N.C3, N.G3, N.E4), N.G3)
                )
            },
            {
                name: "Jingle Bells Ensemble", ensemble: "Celesta, Strings & Sleigh Bells", tempo: 380,
                lead: Array.of("celesta", "strings"), pad: "harp", perc: "sleigh",
                notes: Array.of(
                    Array.of(N.E4, 1, N.C2, Array.of(N.C3, N.G3, N.E4), N.C4), Array.of(N.E4, 1, null, null, N.C4), Array.of(N.E4, 2, N.C2, Array.of(N.C3, N.G3, N.E4), N.C4),
                    Array.of(N.E4, 1, N.C2, Array.of(N.C3, N.G3, N.E4), N.C4), Array.of(N.E4, 1, null, null, N.C4), Array.of(N.E4, 2, N.C2, Array.of(N.C3, N.G3, N.E4), N.C4),
                    Array.of(N.E4, 1, N.C2, Array.of(N.C3, N.G3, N.E4), N.C4), Array.of(N.G4, 1, null, null, N.E4), Array.of(N.C4, 1.5, N.F2, Array.of(N.F3, N.A3, N.C4), N.A3), Array.of(N.D4, 0.5, null, null, N.B3),
                    Array.of(N.E4, 3, N.C2, Array.of(N.C3, N.G3, N.E4), N.C4),
                    Array.of(N.F4, 1, N.F2, Array.of(N.F3, N.A3, N.C4), N.D4), Array.of(N.F4, 1, null, null, N.D4), Array.of(N.F4, 1.5, N.F2, Array.of(N.F3, N.A3, N.C4), N.D4), Array.of(N.F4, 0.5, null, null, N.D4),
                    Array.of(N.F4, 1, N.C2, Array.of(N.C3, N.G3, N.E4), N.C4), Array.of(N.E4, 1, null, null, N.C4), Array.of(N.E4, 1, null, null, N.C4), Array.of(N.E4, 0.5, null, null, N.C4), Array.of(N.E4, 0.5, null, null, N.C4),
                    Array.of(N.G4, 1, N.G2, Array.of(N.G3, N.B3, N.D4), N.E4), Array.of(N.G4, 1, null, null, N.E4), Array.of(N.F4, 1, N.G2, Array.of(N.G3, N.B3, N.D4), N.D4), Array.of(N.D4, 1, null, null, N.B3),
                    Array.of(N.C4, 3.5, N.C2, Array.of(N.C3, N.G3, N.E4), N.G3)
                )
            }
        )
    });
})(window.HOLIDAY_NOTES);
