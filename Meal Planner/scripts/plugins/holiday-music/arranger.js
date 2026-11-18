window.HOLIDAY_NOTES = {
    C2: 65.41, D2: 73.42, E2: 82.41, F2: 87.31, G2: 98.00, A2: 110.00, Bb2: 116.54, B2: 123.47,
    C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, Bb3: 233.08, B3: 246.94,
    C4: 261.63, Cs4: 277.18, D4: 293.66, Eb4: 311.13, E4: 329.63, F4: 349.23, Fs4: 369.99, G4: 392.00,
    Ab4: 415.30, A4: 440.00, Bb4: 466.16, B4: 493.88,
    C5: 523.25, D5: 587.33, Eb5: 622.25, E5: 659.25, F5: 698.46, Fs5: 739.99, G5: 783.99, A5: 880.00
};

window.HolidayArranger = {
    playStep(ctx, dest, song, stepIdx, isPlayingFn) {
        const len = song.notes.length;
        const pass = Math.floor(stepIdx / len);
        const notePos = stepIdx % len;
        const entry = song.notes.at(notePos);

        const baseFreq = entry.at(0);
        const beats = entry.at(1);
        const bassFreq = entry.at(2);
        const chord = entry.at(3);
        const harmFreq = entry.at(4);

        const phraseEnd = notePos === len - 1 || beats >= 2;
        const ms = beats * song.tempo + (phraseEnd ? 65 : 0);
        const durSec = ms / 1000;
        const synth = window.HolidayVoiceSynth;

        if (bassFreq) {
            synth.playBass(ctx, dest, bassFreq, durSec * 2);
            if (pass > 0 && beats >= 1.5) {
                setTimeout(() => {
                    if (isPlayingFn() && ctx) synth.playBass(ctx, dest, bassFreq * 1.5, durSec);
                }, ms * 0.5);
            }
        }

        if (chord) {
            const ordered = pass % 2 === 1 ? Array.from(chord).reverse() : chord;
            synth.playChord(ctx, dest, ordered, durSec * 2, song.pad || "harp");
        } else if (pass >= 1 && notePos % 2 === 1 && harmFreq) {
            synth.playChord(ctx, dest, Array.of(harmFreq * 0.5), durSec * 0.9, "harp");
        }

        const liftOctave = pass % 3 === 2 && baseFreq < 520;
        const leadFreq = liftOctave ? baseFreq * 2 : baseFreq;
        const leads = song.lead || Array.of("piano");

        if (beats >= 1.5 && Math.random() < 0.35 && harmFreq) {
            synth.playLead(ctx, dest, harmFreq, 0.14, leads.at(0));
            setTimeout(() => {
                if (isPlayingFn() && ctx) leads.forEach(v => synth.playLead(ctx, dest, leadFreq, durSec, v));
            }, 95);
        } else {
            leads.forEach(v => synth.playLead(ctx, dest, leadFreq, durSec, v));
        }

        if (harmFreq && (pass >= 1 || Math.random() < 0.45)) {
            const harmonyVoice = leads.length > 1 ? leads.at(1) : "strings";
            synth.playLead(ctx, dest, harmFreq, durSec * 1.1, harmonyVoice);
        }

        if (song.perc && song.perc !== "none") {
            const hitBeat = pass === 0 ? notePos % 2 === 0 : true;
            if (hitBeat) synth.playPercussion(ctx, dest, song.perc);
        }

        return ms + 30;
    }
};
