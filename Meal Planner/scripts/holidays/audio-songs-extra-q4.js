(function (N) {
    window.HOLIDAY_SONGS = window.HOLIDAY_SONGS || [];
    window.HOLIDAY_SONGS.push(
        // October (month: 9)
        {
            month: 9, name: "Haunted Waltz", ensemble: "Celesta, Pipe Organ & Strings", tempo: 390,
            lead: Array.of("celesta", "organ"), pad: "strings", perc: "chime",
            notes: Array.of(
                Array.of(N.D4, 1, N.D2, Array.of(N.D3, N.A3, N.F4), N.A3), Array.of(N.F4, 1, null, null, N.D4), Array.of(N.A4, 1, null, null, N.F4),
                Array.of(N.Bb4, 1.5, N.G2, Array.of(N.G3, N.Bb3, N.D4), N.G4), Array.of(N.A4, 0.5, null, null, N.F4), Array.of(N.G4, 1, null, null, N.E4),
                Array.of(N.F4, 1, N.D2, Array.of(N.D3, N.A3, N.F4), N.D4), Array.of(N.E4, 1, N.A2, Array.of(N.A3, N.E4, N.A4), N.Cs4), Array.of(N.Cs4, 1, null, null, N.A3),
                Array.of(N.D4, 2.5, N.D2, Array.of(N.D3, N.A3, N.F4), N.A3)
            )
        },
        {
            month: 9, name: "Midnight Shadows", ensemble: "Pipe Organ, Strings & Timpani", tempo: 360,
            lead: Array.of("organ", "strings"), pad: "strings", perc: "timpani",
            notes: Array.of(
                Array.of(N.A4, 1, N.D2, Array.of(N.D3, N.A3, N.F4), N.F4), Array.of(N.F4, 0.5, null, null, N.D4), Array.of(N.D4, 0.5, null, null, N.A3), Array.of(N.E4, 1, N.A2, Array.of(N.A3, N.E4, N.A4), N.Cs4),
                Array.of(N.F4, 1, N.D2, Array.of(N.D3, N.A3, N.F4), N.D4), Array.of(N.G4, 0.5, null, null, N.E4), Array.of(N.A4, 0.5, null, null, N.F4), Array.of(N.Bb4, 1.5, N.G2, Array.of(N.G3, N.Bb3, N.D4), N.G4), Array.of(N.A4, 0.5, null, null, N.F4),
                Array.of(N.G4, 1, N.A2, Array.of(N.A3, N.E4, N.A4), N.E4), Array.of(N.E4, 1, null, null, N.Cs4),
                Array.of(N.D4, 2.5, N.D2, Array.of(N.D3, N.A3, N.F4), N.A3)
            )
        },
        // November (month: 10)
        {
            month: 10, name: "We Gather Together", ensemble: "Organ, Brass & Strings", tempo: 430,
            lead: Array.of("organ", "brass"), pad: "strings", perc: "timpani",
            notes: Array.of(
                Array.of(N.G4, 1, N.C2, Array.of(N.C3, N.G3, N.E4), N.E4), Array.of(N.C5, 1.5, N.C2, Array.of(N.C3, N.G3, N.E4), N.G4), Array.of(N.D5, 0.5, null, null, N.B4),
                Array.of(N.E5, 1, N.C2, Array.of(N.C3, N.G3, N.E4), N.C5), Array.of(N.C5, 1, null, null, N.G4), Array.of(N.D5, 1, N.G2, Array.of(N.G3, N.B3, N.D4), N.B4),
                Array.of(N.B4, 1.5, N.G2, Array.of(N.G3, N.B3, N.D4), N.G4), Array.of(N.C5, 0.5, null, null, N.A4), Array.of(N.D5, 1, null, null, N.B4),
                Array.of(N.C5, 2.5, N.C2, Array.of(N.C3, N.G3, N.E4), N.E4)
            )
        },
        {
            month: 10, name: "Hearthside Autumn", ensemble: "Piano, Cello & Harp", tempo: 460,
            lead: Array.of("piano", "strings"), pad: "harp", perc: "none",
            notes: Array.of(
                Array.of(N.E4, 1, N.C2, Array.of(N.C3, N.G3, N.E4), N.C4), Array.of(N.G4, 1, null, null, N.E4), Array.of(N.A4, 1, N.F2, Array.of(N.F3, N.A3, N.C4), N.F4),
                Array.of(N.G4, 2, N.C2, Array.of(N.C3, N.G3, N.E4), N.E4), Array.of(N.F4, 1, N.D2, Array.of(N.D3, N.A3, N.D4), N.D4),
                Array.of(N.E4, 1, N.C2, Array.of(N.C3, N.G3, N.E4), N.C4), Array.of(N.D4, 1, N.G2, Array.of(N.G3, N.B3, N.D4), N.B3),
                Array.of(N.C4, 2.5, N.C2, Array.of(N.C3, N.G3, N.E4), N.G3)
            )
        },
        // December (month: 11)
        {
            month: 11, name: "Silent Night", ensemble: "Celesta, Harp & Warm Strings", tempo: 490,
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
            month: 11, name: "Deck the Halls", ensemble: "Brass, Celesta & Sleigh Bells", tempo: 370,
            lead: Array.of("brass", "celesta"), pad: "strings", perc: "sleigh",
            notes: Array.of(
                Array.of(N.G4, 1.5, N.C2, Array.of(N.C3, N.G3, N.E4), N.E4), Array.of(N.F4, 0.5, null, null, N.D4), Array.of(N.E4, 1, null, null, N.C4), Array.of(N.D4, 1, null, null, N.B3),
                Array.of(N.C4, 1, N.C2, Array.of(N.C3, N.G3, N.E4), N.G3), Array.of(N.D4, 1, null, null, N.B3), Array.of(N.E4, 1, null, null, N.C4), Array.of(N.C4, 1, null, null, N.G3),
                Array.of(N.D4, 0.5, N.G2, Array.of(N.G3, N.B3, N.D4), N.B3), Array.of(N.E4, 0.5, null, null, N.C4), Array.of(N.F4, 0.5, null, null, N.D4), Array.of(N.D4, 0.5, null, null, N.B3),
                Array.of(N.E4, 1.5, N.C2, Array.of(N.C3, N.G3, N.E4), N.C4), Array.of(N.D4, 0.5, null, null, N.B3), Array.of(N.C4, 1, N.G2, Array.of(N.G3, N.B3, N.D4), N.G3), Array.of(N.B3, 1, null, null, N.G3),
                Array.of(N.C4, 2.5, N.C2, Array.of(N.C3, N.G3, N.E4), N.G3)
            )
        }
    );
})(window.HOLIDAY_NOTES);
