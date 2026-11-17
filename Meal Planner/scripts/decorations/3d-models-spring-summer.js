window.HOLIDAY_3D_BUILDERS = window.HOLIDAY_3D_BUILDERS || {};

window.HOLIDAY_3D_BUILDERS.bat = function (m) {
    const rgb = (r, g, b) => Array.of(r, g, b);
    m.addEllipsoid(0, 0, 0, 0.28, 0.38, 0.25, rgb(0.32, 0.20, 0.44), 28);
    m.addEllipsoid(0, 0.34, 0.04, 0.20, 0.20, 0.19, rgb(0.36, 0.23, 0.48), 22);
    Array.of(-1, 1).forEach(s => {
        m.addTube(Array.of(Array.of(s * 0.11, 0.46, 0.04), Array.of(s * 0.16, 0.66, 0.04)), Array.of(0.06, 0.01), rgb(0.36, 0.23, 0.48), 10);
        m.addTube(
            Array.of(Array.of(s * 0.20, 0.16, 0), Array.of(s * 0.56, 0.34, 0.06), Array.of(s * 1.02, 0.16, -0.04)),
            Array.of(0.16, 0.21, 0.02), rgb(0.46, 0.28, 0.60), 18
        );
        m.addEllipsoid(s * 0.08, 0.37, 0.20, 0.042, 0.042, 0.042, rgb(1.0, 0.86, 0.16), 12);
    });
};

window.HOLIDAY_3D_BUILDERS.clover = function (m) {
    const rgb = (r, g, b) => Array.of(r, g, b);
    const leafCol = rgb(0.18, 0.62, 0.32);
    for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
        m.addEllipsoid(Math.cos(a) * 0.42, Math.sin(a) * 0.42, 0, 0.38, 0.38, 0.18, leafCol, 24);
    }
    m.addEllipsoid(0, 0, 0, 0.22, 0.22, 0.20, rgb(0.24, 0.72, 0.38), 18);
    m.addTube(
        Array.of(Array.of(0, -0.25, 0), Array.of(0.06, -0.62, 0), Array.of(0.16, -0.92, 0)),
        Array.of(0.055, 0.045, 0.03), rgb(0.15, 0.50, 0.25), 12
    );
};

window.HOLIDAY_3D_BUILDERS.flower = function (m) {
    const rgb = (r, g, b) => Array.of(r, g, b);
    const petalCol = rgb(0.95, 0.46, 0.68);
    for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        m.addEllipsoid(Math.cos(a) * 0.48, Math.sin(a) * 0.48, 0, 0.34, 0.34, 0.18, petalCol, 22);
    }
    m.addEllipsoid(0, 0, 0, 0.30, 0.30, 0.26, rgb(0.98, 0.82, 0.24), 22);
};

window.HOLIDAY_3D_BUILDERS.egg = function (m) {
    const rgb = (r, g, b) => Array.of(r, g, b);
    m.addLathe(
        v => { const p = v * Math.PI; return { r: Math.sin(p) * 0.65 * (1 + 0.22 * Math.cos(p)), y: Math.cos(p) * 0.88 }; },
        (v, u) => {
            if (Math.abs(v - 0.52) < 0.065) return rgb(0.98, 0.82, 0.32);
            if (Math.abs(v - 0.34) < 0.045 && Math.sin(u * Math.PI * 16) > 0.2) return rgb(0.98, 0.52, 0.70);
            if (Math.abs(v - 0.70) < 0.045 && Math.cos(u * Math.PI * 16) > 0.2) return rgb(0.46, 0.85, 0.74);
            return rgb(0.72, 0.56, 0.92);
        }, 56, 42
    );
};

window.HOLIDAY_3D_BUILDERS.heart = function (m) {
    const rgb = (r, g, b) => Array.of(r, g, b);
    const pts = Array.from({ length: 64 }, (_, i) => {
        const t = (i / 64) * Math.PI * 2;
        return Array.of(16 * Math.pow(Math.sin(t), 3) * 0.052, (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t) + 2.2) * 0.052);
    });
    m.addPillow(pts, 0.38, rgb(0.88, 0.24, 0.44));
};

window.HOLIDAY_3D_BUILDERS.sun = function (m) {
    const rgb = (r, g, b) => Array.of(r, g, b);
    m.addEllipsoid(0, 0, 0, 0.56, 0.56, 0.42, rgb(0.96, 0.68, 0.16), 32);
    for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        m.addTube(Array.of(Array.of(Math.cos(a) * 0.54, Math.sin(a) * 0.54, 0), Array.of(Math.cos(a) * 0.98, Math.sin(a) * 0.98, 0)), Array.of(0.11, 0.01), rgb(0.98, 0.78, 0.22), 12);
    }
};
