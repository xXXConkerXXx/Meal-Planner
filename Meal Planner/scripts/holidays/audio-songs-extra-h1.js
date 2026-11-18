(function (N) {
    window.HOLIDAY_SONGS = window.HOLIDAY_SONGS || [];
    window.HOLIDAY_SONGS.push(
        // January (month: 0)
        {
            month: 0, name: "Winter Starlight", ensemble: "Celesta, Harp & Strings", tempo: 440,
            lead: Array.of("celesta", "strings"), pad: "harp", perc: "chime",
            notes: Array.of(
                Array.of(N.G4, 1, N.C2, Array.of(N.C3, N.G3, N.E4), N.E4), Array.of(N.E5, 1.5, null, null, N.C5), Array.of(N.D5, 0.5, null, null, N.B4),
                Array.of(N.C5, 1, N.A2, Array.of(N.A3, N.E4, N.C5), N.A4), Array.of(N.B4, 1, null, null, N.G4), Array.of(N.A4, 1, null, null, N.E4),
                Array.of(N.G4, 2, N.F2, Array.of(N.F3, N.A3, N.C4), N.C4), Array.of(N.A4, 1, null, null, N.F4),
                Array.of(N.B4, 1, N.G2, Array.of(N.G3, N.B3, N.D4), N.G4), Array.of(N.D5, 1, null, null, N.B4), Array.of(N.C5, 2.5, N.C2, Array.of(N.C3, N.G3, N.E4), N.E4)
            )
        },
        {
            month: 0, name: "Frosty Morning", ensemble: "Flute, Piano & Celesta", tempo: 410,
            lead: Array.of("flute", "piano"), pad: "celesta", perc: "chime",
            notes: Array.of(
                Array.of(N.E4, 1, N.C2, Array.of(N.C3, N.G3, N.E4), N.C4), Array.of(N.F4, 0.5, null, null, N.D4), Array.of(N.G4, 1.5, null, null, N.E4),
                Array.of(N.A4, 1, N.F2, Array.of(N.F3, N.A3, N.C4), N.F4), Array.of(N.G4, 1, null, null, N.E4), Array.of(N.E4, 1, null, null, N.C4),
                Array.of(N.D4, 1.5, N.G2, Array.of(N.G3, N.B3, N.D4), N.B3), Array.of(N.E4, 0.5, null, null, N.C4), Array.of(N.F4, 1, null, null, N.D4),
                Array.of(N.E4, 2.5, N.C2, Array.of(N.C3, N.G3, N.E4), N.C4)
            )
        },
        // February (month: 1)
        {
            month: 1, name: "Sweetheart Waltz", ensemble: "Piano, Strings & Harp", tempo: 440,
            lead: Array.of("piano", "strings"), pad: "harp", perc: "chime",
            notes: Array.of(
                Array.of(N.G4, 1, N.C2, Array.of(N.C3, N.G3, N.E4), N.E4), Array.of(N.E5, 1, null, null, N.C5), Array.of(N.D5, 1, null, null, N.B4),
                Array.of(N.C5, 1, N.F2, Array.of(N.F3, N.A3, N.C4), N.A4), Array.of(N.A4, 1, null, null, N.F4), Array.of(N.C5, 1, null, null, N.A4),
                Array.of(N.B4, 2, N.G2, Array.of(N.G3, N.B3, N.D4), N.G4), Array.of(N.A4, 1, null, null, N.F4),
                Array.of(N.G4, 1, N.C2, Array.of(N.C3, N.G3, N.E4), N.E4), Array.of(N.E4, 1, null, null, N.C4), Array.of(N.C5, 2.5, N.C2, Array.of(N.C3, N.G3, N.E4), N.G4)
            )
        },
        {
            month: 1, name: "Candlelight Serenade", ensemble: "Cello, Harp & Flute", tempo: 480,
            lead: Array.of("strings", "flute"), pad: "harp", perc: "none",
            notes: Array.of(
                Array.of(N.A4, 1.5, N.A2, Array.of(N.A3, N.E4, N.C5), N.E4), Array.of(N.B4, 0.5, null, null, N.G4), Array.of(N.C5, 1, null, null, N.A4),
                Array.of(N.D5, 1.5, N.D2, Array.of(N.D3, N.A3, N.F4), N.A4), Array.of(N.C5, 0.5, null, null, N.G4), Array.of(N.B4, 1, null, null, N.F4),
                Array.of(N.G4, 1.5, N.E2, Array.of(N.E3, N.B3, N.G4), N.E4), Array.of(N.A4, 0.5, null, null, N.F4), Array.of(N.B4, 1, null, null, N.G4),
                Array.of(N.A4, 2.5, N.A2, Array.of(N.A3, N.E4, N.C5), N.E4)
            )
        },
        // March (month: 2)
        {
            month: 2, name: "Emerald Jig", ensemble: "Flute, Harp & Strings", tempo: 360,
            lead: Array.of("flute", "celesta"), pad: "harp", perc: "chime",
            notes: Array.of(
                Array.of(N.D4, 0.5, N.D2, Array.of(N.D3, N.A3, N.Fs4), N.A3), Array.of(N.Fs4, 0.5, null, null, N.D4), Array.of(N.A4, 0.5, null, null, N.Fs4), Array.of(N.D5, 1, null, null, N.A4),
                Array.of(N.B4, 0.5, N.G2, Array.of(N.G3, N.B3, N.D4), N.G4), Array.of(N.G4, 0.5, null, null, N.D4), Array.of(N.B4, 0.5, null, null, N.G4), Array.of(N.A4, 1, N.D2, Array.of(N.D3, N.A3, N.Fs4), N.Fs4),
                Array.of(N.G4, 0.5, N.A2, Array.of(N.A3, N.E4, N.G4), N.E4), Array.of(N.E4, 0.5, null, null, N.Cs4), Array.of(N.Fs4, 0.5, null, null, N.D4), Array.of(N.G4, 0.5, null, null, N.E4),
                Array.of(N.Fs4, 1, N.D2, Array.of(N.D3, N.A3, N.Fs4), N.D4), Array.of(N.D4, 2, N.D2, Array.of(N.D3, N.A3, N.Fs4), N.A3)
            )
        },
        {
            month: 2, name: "Misty Clover Hills", ensemble: "Celtic Harp & Flute", tempo: 430,
            lead: Array.of("flute", "strings"), pad: "harp", perc: "none",
            notes: Array.of(
                Array.of(N.A4, 1, N.D2, Array.of(N.D3, N.A3, N.Fs4), N.Fs4), Array.of(N.G4, 1, null, null, N.E4), Array.of(N.Fs4, 1, null, null, N.D4),
                Array.of(N.E4, 1.5, N.A2, Array.of(N.A3, N.E4, N.G4), N.Cs4), Array.of(N.D4, 0.5, null, null, N.B3), Array.of(N.E4, 1, null, null, N.Cs4),
                Array.of(N.Fs4, 1, N.G2, Array.of(N.G3, N.B3, N.D4), N.D4), Array.of(N.A4, 1, null, null, N.Fs4), Array.of(N.B4, 1, null, null, N.G4),
                Array.of(N.A4, 2.5, N.D2, Array.of(N.D3, N.A3, N.Fs4), N.Fs4)
            )
        },
        // April (month: 3)
        {
            month: 3, name: "April Showers", ensemble: "Celesta, Piano & Harp", tempo: 410,
            lead: Array.of("celesta", "piano"), pad: "harp", perc: "chime",
            notes: Array.of(
                Array.of(N.E5, 0.5, N.C2, Array.of(N.C3, N.G3, N.E4), N.C5), Array.of(N.D5, 0.5, null, null, N.B4), Array.of(N.C5, 1, null, null, N.G4), Array.of(N.G4, 1, null, null, N.E4),
                Array.of(N.A4, 0.5, N.F2, Array.of(N.F3, N.A3, N.C4), N.F4), Array.of(N.B4, 0.5, null, null, N.G4), Array.of(N.C5, 1, null, null, N.A4), Array.of(N.A4, 1, null, null, N.F4),
                Array.of(N.B4, 1, N.G2, Array.of(N.G3, N.B3, N.D4), N.G4), Array.of(N.D5, 1, null, null, N.B4), Array.of(N.C5, 2.5, N.C2, Array.of(N.C3, N.G3, N.E4), N.E4)
            )
        },
        {
            month: 3, name: "Garden Morning", ensemble: "Flute, Harp & Strings", tempo: 440,
            lead: Array.of("flute", "strings"), pad: "harp", perc: "chime",
            notes: Array.of(
                Array.of(N.B4, 1, N.G2, Array.of(N.G3, N.B3, N.D4), N.G4), Array.of(N.C5, 1, null, null, N.A4), Array.of(N.D5, 1.5, null, null, N.B4), Array.of(N.B4, 0.5, null, null, N.G4),
                Array.of(N.E5, 1, N.C2, Array.of(N.C3, N.G3, N.E4), N.C5), Array.of(N.D5, 1, null, null, N.B4), Array.of(N.C5, 1, null, null, N.A4), Array.of(N.B4, 1, null, null, N.G4),
                Array.of(N.A4, 1, N.D2, Array.of(N.D3, N.A3, N.Fs4), N.Fs4), Array.of(N.B4, 1, null, null, N.G4), Array.of(N.G4, 2.5, N.G2, Array.of(N.G3, N.B3, N.D4), N.D4)
            )
        },
        // May (month: 4)
        {
            month: 4, name: "Sunlit Orchard", ensemble: "Piano, Flute & Harp", tempo: 420,
            lead: Array.of("piano", "flute"), pad: "harp", perc: "chime",
            notes: Array.of(
                Array.of(N.F4, 1, N.F2, Array.of(N.F3, N.A3, N.C4), N.C4), Array.of(N.A4, 1, null, null, N.F4), Array.of(N.C5, 1, null, null, N.A4),
                Array.of(N.D5, 1.5, N.Bb2, Array.of(N.Bb3, N.D4, N.F4), N.Bb4), Array.of(N.C5, 0.5, null, null, N.A4), Array.of(N.A4, 1, null, null, N.F4),
                Array.of(N.G4, 1, N.C2, Array.of(N.C3, N.G3, N.Bb3), N.E4), Array.of(N.A4, 1, null, null, N.F4), Array.of(N.Bb4, 1, null, null, N.G4),
                Array.of(N.A4, 2.5, N.F2, Array.of(N.F3, N.A3, N.C4), N.F4)
            )
        },
        {
            month: 4, name: "Warm Breeze", ensemble: "Strings, Celesta & Harp", tempo: 450,
            lead: Array.of("strings", "celesta"), pad: "harp", perc: "none",
            notes: Array.of(
                Array.of(N.A4, 1, N.F2, Array.of(N.F3, N.A3, N.C4), N.F4), Array.of(N.G4, 1, null, null, N.E4), Array.of(N.F4, 1, null, null, N.C4),
                Array.of(N.G4, 2, N.C2, Array.of(N.C3, N.G3, N.E4), N.E4), Array.of(N.C5, 1, null, null, N.G4),
                Array.of(N.Bb4, 1, N.Bb2, Array.of(N.Bb3, N.D4, N.F4), N.G4), Array.of(N.A4, 1, null, null, N.F4), Array.of(N.G4, 1, null, null, N.E4),
                Array.of(N.F4, 2.5, N.F2, Array.of(N.F3, N.A3, N.C4), N.C4)
            )
        },
        // June (month: 5)
        {
            month: 5, name: "Golden Coastline", ensemble: "Flute, Piano & Harp", tempo: 400,
            lead: Array.of("flute", "piano"), pad: "harp", perc: "chime",
            notes: Array.of(
                Array.of(N.G4, 1, N.C2, Array.of(N.C3, N.G3, N.E4), N.E4), Array.of(N.A4, 0.5, null, null, N.F4), Array.of(N.B4, 0.5, null, null, N.G4), Array.of(N.C5, 1.5, null, null, N.G4), Array.of(N.E5, 0.5, null, null, N.C5),
                Array.of(N.D5, 1, N.G2, Array.of(N.G3, N.B3, N.D4), N.B4), Array.of(N.B4, 1, null, null, N.G4), Array.of(N.G4, 1, null, null, N.D4),
                Array.of(N.A4, 1, N.F2, Array.of(N.F3, N.A3, N.C4), N.F4), Array.of(N.B4, 1, N.G2, Array.of(N.G3, N.B3, N.D4), N.G4),
                Array.of(N.C5, 2.5, N.C2, Array.of(N.C3, N.G3, N.E4), N.E4)
            )
        },
        {
            month: 5, name: "Firefly Dusk", ensemble: "Celesta, Harp & Strings", tempo: 460,
            lead: Array.of("celesta", "strings"), pad: "harp", perc: "chime",
            notes: Array.of(
                Array.of(N.B4, 1, N.E2, Array.of(N.E3, N.B3, N.G4), N.G4), Array.of(N.G4, 1, null, null, N.E4), Array.of(N.E4, 1, null, null, N.B3),
                Array.of(N.A4, 1.5, N.A2, Array.of(N.A3, N.E4, N.C5), N.E4), Array.of(N.B4, 0.5, null, null, N.G4), Array.of(N.C5, 1, null, null, N.A4),
                Array.of(N.B4, 1, N.G2, Array.of(N.G3, N.B3, N.D4), N.G4), Array.of(N.A4, 1, null, null, N.F4), Array.of(N.G4, 1, null, null, N.E4),
                Array.of(N.E4, 2.5, N.E2, Array.of(N.E3, N.B3, N.G4), N.B3)
            )
        }
    );
})(window.HOLIDAY_NOTES);
