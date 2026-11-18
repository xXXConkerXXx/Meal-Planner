(function (N) {
    window.HOLIDAY_SONGS = window.HOLIDAY_SONGS || {};
    Object.assign(window.HOLIDAY_SONGS, {
        2: Array.of(
            {
                name: "Emerald Jig", ensemble: "Flute, Harp & Strings", tempo: 360,
                lead: Array.of("flute", "celesta"), pad: "harp", perc: "chime",
                notes: Array.of(
                    Array.of(N.D4, 0.5, N.D2, Array.of(N.D3, N.A3, N.Fs4), N.A3), Array.of(N.Fs4, 0.5, null, null, N.D4), Array.of(N.A4, 0.5, null, null, N.Fs4), Array.of(N.D5, 1, null, null, N.A4),
                    Array.of(N.B4, 0.5, N.G2, Array.of(N.G3, N.B3, N.D4), N.G4), Array.of(N.G4, 0.5, null, null, N.D4), Array.of(N.B4, 0.5, null, null, N.G4), Array.of(N.A4, 1, N.D2, Array.of(N.D3, N.A3, N.Fs4), N.Fs4),
                    Array.of(N.G4, 0.5, N.A2, Array.of(N.A3, N.E4, N.G4), N.E4), Array.of(N.E4, 0.5, null, null, N.Cs4), Array.of(N.Fs4, 0.5, null, null, N.D4), Array.of(N.G4, 0.5, null, null, N.E4),
                    Array.of(N.Fs4, 1, N.D2, Array.of(N.D3, N.A3, N.Fs4), N.D4), Array.of(N.D4, 2, N.D2, Array.of(N.D3, N.A3, N.Fs4), N.A3)
                )
            },
            {
                name: "Misty Clover Hills", ensemble: "Celtic Harp & Flute", tempo: 430,
                lead: Array.of("flute", "strings"), pad: "harp", perc: "none",
                notes: Array.of(
                    Array.of(N.A4, 1, N.D2, Array.of(N.D3, N.A3, N.Fs4), N.Fs4), Array.of(N.G4, 1, null, null, N.E4), Array.of(N.Fs4, 1, null, null, N.D4),
                    Array.of(N.E4, 1.5, N.A2, Array.of(N.A3, N.E4, N.G4), N.Cs4), Array.of(N.D4, 0.5, null, null, N.B3), Array.of(N.E4, 1, null, null, N.Cs4),
                    Array.of(N.Fs4, 1, N.G2, Array.of(N.G3, N.B3, N.D4), N.D4), Array.of(N.A4, 1, null, null, N.Fs4), Array.of(N.B4, 1, null, null, N.G4),
                    Array.of(N.A4, 2.5, N.D2, Array.of(N.D3, N.A3, N.Fs4), N.Fs4)
                )
            },
            {
                name: "Celtic Spring Air", ensemble: "Flute, Celtic Harp & Strings", tempo: 390,
                lead: Array.of("flute", "strings"), pad: "harp", perc: "chime",
                notes: Array.of(
                    Array.of(N.D4, 0.5, N.D2, Array.of(N.D3, N.A3, N.Fs4), N.A3), Array.of(N.E4, 0.5, null, null, N.B3), Array.of(N.Fs4, 1, null, null, N.D4), Array.of(N.A4, 1, null, null, N.Fs4),
                    Array.of(N.B4, 1, N.G2, Array.of(N.G3, N.B3, N.D4), N.G4), Array.of(N.A4, 0.5, null, null, N.Fs4), Array.of(N.Fs4, 0.5, null, null, N.D4), Array.of(N.D4, 1, null, null, N.A3),
                    Array.of(N.E4, 1, N.A2, Array.of(N.A3, N.E4, N.G4), N.Cs4), Array.of(N.Fs4, 1, null, null, N.D4), Array.of(N.E4, 1, null, null, N.Cs4),
                    Array.of(N.D4, 2, N.D2, Array.of(N.D3, N.A3, N.Fs4), N.A3),
                    Array.of(N.A4, 1, N.D2, Array.of(N.D3, N.A3, N.Fs4), N.Fs4), Array.of(N.B4, 0.5, null, null, N.G4), Array.of(N.Cs4 * 2, 0.5, null, null, N.A4), Array.of(N.D5, 1.5, N.G2, Array.of(N.G3, N.B3, N.D4), N.B4),
                    Array.of(N.B4, 0.5, null, null, N.G4), Array.of(N.A4, 1, N.D2, Array.of(N.D3, N.A3, N.Fs4), N.Fs4), Array.of(N.Fs4, 1, null, null, N.D4),
                    Array.of(N.E4, 1, N.A2, Array.of(N.A3, N.E4, N.G4), N.Cs4), Array.of(N.D4, 2.5, N.D2, Array.of(N.D3, N.A3, N.Fs4), N.A3)
                )
            }
        )
    });
})(window.HOLIDAY_NOTES);
