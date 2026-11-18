(function (N) {
    window.HOLIDAY_SONGS = window.HOLIDAY_SONGS || {};
    Object.assign(window.HOLIDAY_SONGS, {
        9: Array.of(
            {
                name: "Haunted Waltz", ensemble: "Celesta, Pipe Organ & Strings", tempo: 390,
                lead: Array.of("celesta", "organ"), pad: "strings", perc: "chime",
                notes: Array.of(
                    Array.of(N.D4, 1, N.D2, Array.of(N.D3, N.A3, N.F4), N.A3), Array.of(N.F4, 1, null, null, N.D4), Array.of(N.A4, 1, null, null, N.F4),
                    Array.of(N.Bb4, 1.5, N.G2, Array.of(N.G3, N.Bb3, N.D4), N.G4), Array.of(N.A4, 0.5, null, null, N.F4), Array.of(N.G4, 1, null, null, N.E4),
                    Array.of(N.F4, 1, N.D2, Array.of(N.D3, N.A3, N.F4), N.D4), Array.of(N.E4, 1, N.A2, Array.of(N.A3, N.E4, N.A4), N.Cs4), Array.of(N.Cs4, 1, null, null, N.A3),
                    Array.of(N.D4, 2.5, N.D2, Array.of(N.D3, N.A3, N.F4), N.A3)
                )
            },
            {
                name: "Midnight Shadows", ensemble: "Pipe Organ, Strings & Timpani", tempo: 360,
                lead: Array.of("organ", "strings"), pad: "strings", perc: "timpani",
                notes: Array.of(
                    Array.of(N.A4, 1, N.D2, Array.of(N.D3, N.A3, N.F4), N.F4), Array.of(N.F4, 0.5, null, null, N.D4), Array.of(N.D4, 0.5, null, null, N.A3), Array.of(N.E4, 1, N.A2, Array.of(N.A3, N.E4, N.A4), N.Cs4),
                    Array.of(N.F4, 1, N.D2, Array.of(N.D3, N.A3, N.F4), N.D4), Array.of(N.G4, 0.5, null, null, N.E4), Array.of(N.A4, 0.5, null, null, N.F4), Array.of(N.Bb4, 1.5, N.G2, Array.of(N.G3, N.Bb3, N.D4), N.G4), Array.of(N.A4, 0.5, null, null, N.F4),
                    Array.of(N.G4, 1, N.A2, Array.of(N.A3, N.E4, N.A4), N.E4), Array.of(N.E4, 1, null, null, N.Cs4),
                    Array.of(N.D4, 2.5, N.D2, Array.of(N.D3, N.A3, N.F4), N.A3)
                )
            },
            {
                name: "Spooky Toccata", ensemble: "Pipe Organ, Celesta & Strings", tempo: 370,
                lead: Array.of("organ", "celesta"), pad: "strings", perc: "chime",
                notes: Array.of(
                    Array.of(N.A4, 0.5, N.D2, Array.of(N.D3, N.A3, N.F4), N.F4), Array.of(N.G4, 0.5, null, null, N.E4), Array.of(N.A4, 1.5, null, null, N.F4),
                    Array.of(N.G4, 0.5, N.Bb2, Array.of(N.Bb3, N.D4, N.G4), N.D4), Array.of(N.F4, 0.5, null, null, N.D4), Array.of(N.E4, 0.5, null, null, N.Cs4), Array.of(N.D4, 0.5, null, null, N.A3),
                    Array.of(N.Cs4, 1, N.A2, Array.of(N.A3, N.E4, N.A4), N.A3), Array.of(N.D4, 2, N.D2, Array.of(N.D3, N.A3, N.D4), N.A3),
                    Array.of(N.D4, 0.5, N.D2, null, N.A3), Array.of(N.F4, 0.5, null, null, N.D4), Array.of(N.A4, 1, N.F2, Array.of(N.F3, N.A3, N.D4), N.F4), Array.of(N.Bb4, 1, N.G2, Array.of(N.G3, N.Bb3, N.D4), N.G4),
                    Array.of(N.A4, 1, N.A2, Array.of(N.A3, N.E4, N.A4), N.E4), Array.of(N.D4, 2.5, N.D2, Array.of(N.D3, N.A3, N.D4), N.A3)
                )
            }
        )
    });
})(window.HOLIDAY_NOTES);
