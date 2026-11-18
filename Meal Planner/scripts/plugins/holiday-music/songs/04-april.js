(function (N) {
    window.HOLIDAY_SONGS = window.HOLIDAY_SONGS || {};
    Object.assign(window.HOLIDAY_SONGS, {
        3: Array.of(
            {
                name: "April Showers", ensemble: "Celesta, Piano & Harp", tempo: 410,
                lead: Array.of("celesta", "piano"), pad: "harp", perc: "chime",
                notes: Array.of(
                    Array.of(N.E5, 0.5, N.C2, Array.of(N.C3, N.G3, N.E4), N.C5), Array.of(N.D5, 0.5, null, null, N.B4), Array.of(N.C5, 1, null, null, N.G4), Array.of(N.G4, 1, null, null, N.E4),
                    Array.of(N.A4, 0.5, N.F2, Array.of(N.F3, N.A3, N.C4), N.F4), Array.of(N.B4, 0.5, null, null, N.G4), Array.of(N.C5, 1, null, null, N.A4), Array.of(N.A4, 1, null, null, N.F4),
                    Array.of(N.B4, 1, N.G2, Array.of(N.G3, N.B3, N.D4), N.G4), Array.of(N.D5, 1, null, null, N.B4), Array.of(N.C5, 2.5, N.C2, Array.of(N.C3, N.G3, N.E4), N.E4)
                )
            },
            {
                name: "Garden Morning", ensemble: "Flute, Harp & Strings", tempo: 440,
                lead: Array.of("flute", "strings"), pad: "harp", perc: "chime",
                notes: Array.of(
                    Array.of(N.B4, 1, N.G2, Array.of(N.G3, N.B3, N.D4), N.G4), Array.of(N.C5, 1, null, null, N.A4), Array.of(N.D5, 1.5, null, null, N.B4), Array.of(N.B4, 0.5, null, null, N.G4),
                    Array.of(N.E5, 1, N.C2, Array.of(N.C3, N.G3, N.E4), N.C5), Array.of(N.D5, 1, null, null, N.B4), Array.of(N.C5, 1, null, null, N.A4), Array.of(N.B4, 1, null, null, N.G4),
                    Array.of(N.A4, 1, N.D2, Array.of(N.D3, N.A3, N.Fs4), N.Fs4), Array.of(N.B4, 1, null, null, N.G4), Array.of(N.G4, 2.5, N.G2, Array.of(N.G3, N.B3, N.D4), N.D4)
                )
            },
            {
                name: "Spring Meadow", ensemble: "Celesta, Flute & Harp", tempo: 420,
                lead: Array.of("celesta", "flute"), pad: "harp", perc: "chime",
                notes: Array.of(
                    Array.of(N.G4, 1, N.G2, Array.of(N.G3, N.B3, N.D4), N.D4), Array.of(N.B4, 1, null, null, N.G4), Array.of(N.D5, 1, null, null, N.B4), Array.of(N.B4, 1, null, null, N.G4),
                    Array.of(N.C5, 1, N.C2, Array.of(N.C3, N.G3, N.E4), N.G4), Array.of(N.A4, 1, null, null, N.Fs4), Array.of(N.B4, 1, N.D2, Array.of(N.D3, N.A3, N.Fs4), N.G4),
                    Array.of(N.G4, 2, N.G2, Array.of(N.G3, N.B3, N.D4), N.D4),
                    Array.of(N.D5, 1, N.G2, Array.of(N.G3, N.B3, N.D4), N.B4), Array.of(N.E5, 1, N.C2, Array.of(N.C3, N.G3, N.E4), N.C5), Array.of(N.D5, 1, null, null, N.B4), Array.of(N.B4, 1, null, null, N.G4),
                    Array.of(N.A4, 1, N.D2, Array.of(N.D3, N.A3, N.Fs4), N.Fs4), Array.of(N.B4, 1, null, null, N.G4), Array.of(N.G4, 2.5, N.G2, Array.of(N.G3, N.B3, N.D4), N.D4)
                )
            }
        )
    });
})(window.HOLIDAY_NOTES);
