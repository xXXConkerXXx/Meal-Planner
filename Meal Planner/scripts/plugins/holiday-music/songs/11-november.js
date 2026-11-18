(function (N) {
    window.HOLIDAY_SONGS = window.HOLIDAY_SONGS || {};
    Object.assign(window.HOLIDAY_SONGS, {
        10: Array.of(
            {
                name: "We Gather Together", ensemble: "Organ, Brass & Strings", tempo: 430,
                lead: Array.of("organ", "brass"), pad: "strings", perc: "timpani",
                notes: Array.of(
                    Array.of(N.G4, 1, N.C2, Array.of(N.C3, N.G3, N.E4), N.E4), Array.of(N.C5, 1.5, N.C2, Array.of(N.C3, N.G3, N.E4), N.G4), Array.of(N.D5, 0.5, null, null, N.B4),
                    Array.of(N.E5, 1, N.C2, Array.of(N.C3, N.G3, N.E4), N.C5), Array.of(N.C5, 1, null, null, N.G4), Array.of(N.D5, 1, N.G2, Array.of(N.G3, N.B3, N.D4), N.B4),
                    Array.of(N.B4, 1.5, N.G2, Array.of(N.G3, N.B3, N.D4), N.G4), Array.of(N.C5, 0.5, null, null, N.A4), Array.of(N.D5, 1, null, null, N.B4),
                    Array.of(N.C5, 2.5, N.C2, Array.of(N.C3, N.G3, N.E4), N.E4)
                )
            },
            {
                name: "Hearthside Autumn", ensemble: "Piano, Cello & Harp", tempo: 460,
                lead: Array.of("piano", "strings"), pad: "harp", perc: "none",
                notes: Array.of(
                    Array.of(N.E4, 1, N.C2, Array.of(N.C3, N.G3, N.E4), N.C4), Array.of(N.G4, 1, null, null, N.E4), Array.of(N.A4, 1, N.F2, Array.of(N.F3, N.A3, N.C4), N.F4),
                    Array.of(N.G4, 2, N.C2, Array.of(N.C3, N.G3, N.E4), N.E4), Array.of(N.F4, 1, N.D2, Array.of(N.D3, N.A3, N.D4), N.D4),
                    Array.of(N.E4, 1, N.C2, Array.of(N.C3, N.G3, N.E4), N.C4), Array.of(N.D4, 1, N.G2, Array.of(N.G3, N.B3, N.D4), N.B3),
                    Array.of(N.C4, 2.5, N.C2, Array.of(N.C3, N.G3, N.E4), N.G3)
                )
            },
            {
                name: "Thanksgiving Hymn", ensemble: "Organ, Strings & Brass", tempo: 450,
                lead: Array.of("organ", "strings"), pad: "brass", perc: "timpani",
                notes: Array.of(
                    Array.of(N.G4, 1, N.G2, Array.of(N.G3, N.B3, N.D4), N.D4), Array.of(N.G4, 1, null, null, N.D4), Array.of(N.A4, 1, N.D2, Array.of(N.D3, N.A3, N.Fs4), N.Fs4), Array.of(N.B4, 1, null, null, N.G4),
                    Array.of(N.C5, 1.5, N.C2, Array.of(N.C3, N.G3, N.E4), N.G4), Array.of(N.B4, 0.5, null, null, N.G4), Array.of(N.A4, 1, N.D2, Array.of(N.D3, N.A3, N.Fs4), N.Fs4),
                    Array.of(N.G4, 2, N.G2, Array.of(N.G3, N.B3, N.D4), N.D4),
                    Array.of(N.B4, 1, N.E2, Array.of(N.E3, N.B3, N.G4), N.G4), Array.of(N.C5, 1, N.C2, Array.of(N.C3, N.G3, N.E4), N.G4), Array.of(N.D5, 1.5, N.G2, Array.of(N.G3, N.B3, N.D4), N.B4),
                    Array.of(N.C5, 0.5, null, null, N.A4), Array.of(N.B4, 1, N.D2, Array.of(N.D3, N.A3, N.Fs4), N.G4), Array.of(N.A4, 1, null, null, N.Fs4), Array.of(N.G4, 2.5, N.G2, Array.of(N.G3, N.B3, N.D4), N.D4)
                )
            }
        )
    });
})(window.HOLIDAY_NOTES);
