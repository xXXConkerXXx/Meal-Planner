(function (N) {
    window.HOLIDAY_SONGS = window.HOLIDAY_SONGS || {};
    Object.assign(window.HOLIDAY_SONGS, {
        8: Array.of(
            {
                name: "Crisp Morning Air", ensemble: "Piano, Flute & Cello", tempo: 440,
                lead: Array.of("piano", "flute"), pad: "strings", perc: "none",
                notes: Array.of(
                    Array.of(N.A4, 1, N.A2, Array.of(N.A3, N.E4, N.C5), N.E4), Array.of(N.B4, 1, null, null, N.G4), Array.of(N.C5, 1, null, null, N.A4),
                    Array.of(N.B4, 1.5, N.E2, Array.of(N.E3, N.B3, N.G4), N.G4), Array.of(N.A4, 0.5, null, null, N.F4), Array.of(N.G4, 1, null, null, N.E4),
                    Array.of(N.F4, 1, N.F2, Array.of(N.F3, N.A3, N.C4), N.D4), Array.of(N.E4, 1, N.C2, Array.of(N.C3, N.G3, N.E4), N.C4), Array.of(N.D4, 1, N.G2, Array.of(N.G3, N.B3, N.D4), N.B3),
                    Array.of(N.E4, 2.5, N.A2, Array.of(N.A3, N.E4, N.C5), N.C4)
                )
            },
            {
                name: "Amber Twilight", ensemble: "Harp, Cello & Strings", tempo: 470,
                lead: Array.of("strings", "piano"), pad: "harp", perc: "chime",
                notes: Array.of(
                    Array.of(N.C5, 1, N.A2, Array.of(N.A3, N.E4, N.C5), N.A4), Array.of(N.A4, 1, null, null, N.E4), Array.of(N.E4, 1, null, null, N.C4),
                    Array.of(N.F4, 1.5, N.F2, Array.of(N.F3, N.A3, N.C4), N.D4), Array.of(N.G4, 0.5, null, null, N.E4), Array.of(N.A4, 1, null, null, N.F4),
                    Array.of(N.G4, 1, N.G2, Array.of(N.G3, N.B3, N.D4), N.D4), Array.of(N.B4, 1, null, null, N.G4),
                    Array.of(N.A4, 2.5, N.A2, Array.of(N.A3, N.E4, N.C5), N.E4)
                )
            },
            {
                name: "Autumn Leaves", ensemble: "Piano, Cello & Harp", tempo: 450,
                lead: Array.of("piano", "strings"), pad: "harp", perc: "none",
                notes: Array.of(
                    Array.of(N.E4, 1, N.A2, Array.of(N.A3, N.E4, N.C5), N.C4), Array.of(N.Fs4, 1, null, null, N.D4), Array.of(N.G4, 1, null, null, N.E4), Array.of(N.C5, 2, N.F2, Array.of(N.F3, N.A3, N.C4), N.A4),
                    Array.of(N.D4, 1, N.G2, Array.of(N.G3, N.B3, N.D4), N.B3), Array.of(N.E4, 1, null, null, N.C4), Array.of(N.Fs4, 1, null, null, N.D4), Array.of(N.B4, 2, N.E2, Array.of(N.E3, N.B3, N.E4), N.G4),
                    Array.of(N.C4, 1, N.A2, Array.of(N.A3, N.E4, N.C5), N.A3), Array.of(N.D4, 1, null, null, N.B3), Array.of(N.E4, 1, null, null, N.C4), Array.of(N.A4, 2.5, N.A2, Array.of(N.A3, N.E4, N.C5), N.E4)
                )
            }
        )
    });
})(window.HOLIDAY_NOTES);
