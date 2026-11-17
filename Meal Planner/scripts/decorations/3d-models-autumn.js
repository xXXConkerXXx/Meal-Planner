window.HOLIDAY_3D_BUILDERS = window.HOLIDAY_3D_BUILDERS || {};

window.HOLIDAY_3D_BUILDERS.pumpkin = function (m) {
    const rgb = (r, g, b) => Array.of(r, g, b);
    m.addLathe(
        (v, th) => {
            const phi = v * Math.PI, sp = Math.sin(phi);
            const ribs = 1 - 0.085 * Math.pow(Math.sin(5 * th), 2) * sp;
            const indent = 1 - 0.16 * Math.pow(Math.cos(phi), 6);
            return { r: sp * 0.92 * ribs, y: Math.cos(phi) * 0.64 * indent - 0.06 };
        },
        (v, u) => {
            if (v < 0.06) return rgb(0.22, 0.48, 0.18);
            const crease = 0.88 + 0.12 * Math.cos(10 * u * Math.PI * 2);
            return rgb(0.95 * crease, 0.42 * crease, 0.08 * crease);
        }, 72, 44
    );
    m.addTube(
        Array.of(Array.of(0, 0.48, 0), Array.of(0.03, 0.66, -0.02), Array.of(0.11, 0.82, -0.06), Array.of(0.20, 0.94, -0.11)),
        Array.of(0.15, 0.105, 0.075, 0.042), rgb(0.24, 0.50, 0.19), 20
    );
    m.addEllipsoid(0.20, 0.94, -0.11, 0.042, 0.042, 0.042, rgb(0.24, 0.50, 0.19), 14);
    const glow = rgb(1.0, 0.88, 0.16);
    m.addPillow(Array.of(Array.of(-0.13, -0.07), Array.of(0.13, -0.07), Array.of(0, 0.13)), 0.09, glow, -0.28, 0.13, 0.86);
    m.addPillow(Array.of(Array.of(-0.13, -0.07), Array.of(0.13, -0.07), Array.of(0, 0.13)), 0.09, glow, 0.28, 0.13, 0.86);
    m.addPillow(Array.of(Array.of(-0.06, -0.04), Array.of(0.06, -0.04), Array.of(0, 0.06)), 0.08, glow, 0, -0.01, 0.90);
    m.addTube(
        Array.of(Array.of(-0.32, -0.10, 0.83), Array.of(-0.16, -0.20, 0.88), Array.of(0, -0.17, 0.90), Array.of(0.16, -0.20, 0.88), Array.of(0.32, -0.10, 0.83)),
        Array.of(0.04, 0.065, 0.065, 0.065, 0.04), glow, 16
    );
};

window.HOLIDAY_3D_BUILDERS.turkey = function (m) {
    const rgb = (r, g, b) => Array.of(r, g, b);
    m.addEllipsoid(0, -0.06, 0.04, 0.64, 0.55, 0.72, rgb(0.44, 0.23, 0.11), 34);
    m.addEllipsoid(0, -0.08, 0.34, 0.48, 0.42, 0.46, rgb(0.54, 0.30, 0.15), 26);
    Array.of(-1, 1).forEach(side => {
        m.addEllipsoid(side * 0.58, -0.02, 0.02, 0.16, 0.36, 0.48, rgb(0.36, 0.18, 0.08), 22);
    });
    m.addTube(Array.of(Array.of(0, 0.24, 0.42), Array.of(0, 0.48, 0.56)), Array.of(0.22, 0.20), rgb(0.50, 0.27, 0.13), 18);
    m.addEllipsoid(0, 0.52, 0.58, 0.25, 0.26, 0.25, rgb(0.56, 0.31, 0.15), 26);
    m.addTube(Array.of(Array.of(0, 0.50, 0.80), Array.of(0, 0.45, 0.97), Array.of(0, 0.40, 1.10)), Array.of(0.11, 0.055, 0.008), rgb(0.95, 0.65, 0.15), 16);
    m.addEllipsoid(0.06, 0.35, 0.84, 0.055, 0.13, 0.055, rgb(0.86, 0.16, 0.16), 14);
    Array.of(-0.11, 0.11).forEach(ex => {
        m.addEllipsoid(ex, 0.57, 0.80, 0.045, 0.045, 0.045, rgb(0.08, 0.08, 0.08), 12);
    });

    const footColor = rgb(0.92, 0.58, 0.14);
    Array.of(-0.24, 0.24).forEach(fx => {
        m.addTube(Array.of(Array.of(fx, -0.50, 0.06), Array.of(fx, -0.84, 0.08)), Array.of(0.06, 0.045), footColor, 14);
        m.addEllipsoid(fx, -0.84, 0.08, 0.05, 0.04, 0.05, footColor, 12);
        Array.of(-0.34, 0, 0.34).forEach(ta => {
            const tx = fx + Math.sin(ta) * 0.25, tz = 0.08 + Math.cos(ta) * 0.25;
            m.addTube(Array.of(Array.of(fx, -0.84, 0.08), Array.of(tx, -0.85, tz)), Array.of(0.038, 0.018), footColor, 10);
            m.addEllipsoid(tx, -0.85, tz, 0.02, 0.02, 0.02, footColor, 10);
        });
    });

    const palette = Array.of(
        rgb(0.84, 0.36, 0.10), rgb(0.92, 0.70, 0.14), rgb(0.76, 0.16, 0.16),
        rgb(0.94, 0.76, 0.18), rgb(0.76, 0.16, 0.16), rgb(0.92, 0.70, 0.14), rgb(0.84, 0.36, 0.10)
    );
    palette.forEach((c, i) => {
        const a = (i - 3) * 0.28;
        const tipX = Math.sin(a) * 0.88, tipY = 0.84 + Math.cos(a) * 0.36, tipZ = -0.50;
        m.addTube(
            Array.of(Array.of(Math.sin(a) * 0.18, 0.08, -0.44), Array.of(Math.sin(a) * 0.56, 0.50 + Math.cos(a) * 0.2, -0.47), Array.of(tipX, tipY, tipZ)),
            Array.of(0.085, 0.15, 0.115), c, 16
        );
        m.addEllipsoid(tipX, tipY, tipZ, 0.118, 0.118, 0.118, c, 16);
    });
};

window.HOLIDAY_3D_BUILDERS.acorn = function (m) {
    const rgb = (r, g, b) => Array.of(r, g, b);
    m.addLathe(v => {
        if (v <= 0.03) return { r: (v / 0.03) * 0.08, y: 0.86 };
        if (v < 0.14) return { r: 0.08, y: 0.86 - ((v - 0.03) / 0.11) * 0.20 };
        if (v < 0.40) return { r: Math.sin(((v - 0.14) / 0.26) * 1.57) * 0.72, y: 0.66 - ((v - 0.14) / 0.26) * 0.36 };
        if (v <= 0.45) {
            const rim = (v - 0.40) / 0.05;
            return { r: 0.72 - rim * 0.15, y: 0.30 - rim * 0.02 };
        }
        const t = (v - 0.45) / 0.55;
        return { r: Math.cos(t * 1.57) * 0.57, y: 0.28 - Math.pow(t, 0.85) * 1.05 };
    }, (v, u) => {
        if (v <= 0.45) {
            const tex = 0.84 + 0.16 * Math.sin(v * 72) * Math.cos(u * 48);
            return rgb(0.42 * tex, 0.24 * tex, 0.11 * tex);
        }
        return rgb(0.82, 0.55, 0.26);
    }, 52, 48);
};

window.HOLIDAY_3D_BUILDERS.leaf = function (m) {
    const rgb = (r, g, b) => Array.of(r, g, b);
    const leaf = Array.of(
        Array.of(0, -0.65), Array.of(0.48, -0.52), Array.of(0.38, -0.24), Array.of(0.72, -0.05), Array.of(0.38, 0.14),
        Array.of(0.52, 0.44), Array.of(0.22, 0.42), Array.of(0, 0.85), Array.of(-0.22, 0.42), Array.of(-0.52, 0.44),
        Array.of(-0.38, 0.14), Array.of(-0.72, -0.05), Array.of(-0.38, -0.24), Array.of(-0.48, -0.52)
    );
    m.addPillow(leaf, 0.14, rgb(0.86, 0.40, 0.12));
    m.addTube(Array.of(Array.of(0, -0.88, 0), Array.of(0, -0.52, 0)), Array.of(0.035, 0.05), rgb(0.46, 0.22, 0.08), 10);
    m.addEllipsoid(0, -0.88, 0, 0.035, 0.035, 0.035, rgb(0.46, 0.22, 0.08), 10);
};
