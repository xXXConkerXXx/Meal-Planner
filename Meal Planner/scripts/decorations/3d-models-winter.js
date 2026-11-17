window.HOLIDAY_3D_BUILDERS = window.HOLIDAY_3D_BUILDERS || {};

window.HOLIDAY_3D_BUILDERS.tree = function (m) {
    const rgb = (r, g, b) => Array.of(r, g, b);

    // 1. Solid brown trunk
    m.addLathe(v => {
        if (v <= 0.12) return { r: (v / 0.12) * 0.24, y: -0.96 };
        if (v <= 0.25) return { r: 0.24 - ((v - 0.12) / 0.13) * 0.04, y: -0.96 + ((v - 0.12) / 0.13) * 0.10 };
        if (v <= 0.88) return { r: 0.20, y: -0.86 + ((v - 0.25) / 0.63) * 0.34 };
        return { r: (1 - (v - 0.88) / 0.12) * 0.20, y: -0.52 };
    }, () => rgb(0.42, 0.26, 0.14), 36, 18);

    // 2. Sculpted 4-tier green pine foliage
    const getFoliageR = (t, th) => {
        const tier = (t * 4) % 1;
        return (1 - t * 0.90) * (0.42 + 0.58 * (1 - tier)) * 1.08 * (1 + 0.075 * Math.cos(10 * th) * (1 - tier));
    };

    m.addLathe((v, th) => {
        const bough = 1 + 0.075 * Math.cos(10 * th);
        if (v <= 0.07) return { r: (v / 0.07) * 1.08 * bough, y: -0.60 };
        const t = (v - 0.07) / 0.93;
        return { r: getFoliageR(t, th), y: -0.60 + t * 1.78 };
    }, v => {
        const shade = 0.90 + 0.10 * Math.sin(v * Math.PI * 8);
        return rgb(0.13 * shade, 0.54 * shade, 0.27 * shade);
    }, 56, 52);

    // 3. 360-degree scattered ornaments hugging the outer boughs on all sides
    const bulbColors = Array.of(
        rgb(0.92, 0.20, 0.22), // Red
        rgb(0.98, 0.80, 0.18), // Gold
        rgb(0.22, 0.60, 0.95), // Blue
        rgb(0.88, 0.34, 0.78)  // Magenta
    );

    const bulbCount = 18;
    for (let i = 0; i < bulbCount; i++) {
        // Golden-angle spiral distribution so bulbs scatter evenly around all 360 degrees
        const t = 0.08 + (i / bulbCount) * 0.76;
        const th = i * 2.39996 + (Math.random() - 0.5) * 0.35;
        const r = getFoliageR(t, th) + 0.02;
        const y = -0.60 + t * 1.78;
        const ox = Math.cos(th) * r;
        const oz = Math.sin(th) * r;
        const oc = bulbColors.at(i % bulbColors.length);
        m.addEllipsoid(ox, y, oz, 0.08, 0.08, 0.08, oc, 14);
    }

    // 4. Gold topper star
    const sPts = Array.from({ length: 10 }, (_, i) => {
        const r = i % 2 === 0 ? 0.28 : 0.12, a = (i / 10) * Math.PI * 2 + 1.57;
        return Array.of(Math.cos(a) * r, Math.sin(a) * r);
    });
    m.addPillow(sPts, 0.11, rgb(0.98, 0.82, 0.18), 0, 1.26, 0);
};

window.HOLIDAY_3D_BUILDERS.firework = function (m) {
    const rgb = (r, g, b) => Array.of(r, g, b);
    m.addLathe(
        v => {
            if (v <= 0.06) return { r: (v / 0.06) * 0.24, y: -0.62 };
            if (v <= 0.70) return { r: 0.24, y: -0.62 + ((v - 0.06) / 0.64) * 1.12 };
            if (v <= 0.74) return { r: 0.24 + ((v - 0.70) / 0.04) * 0.07, y: 0.50 };
            const t = (v - 0.74) / 0.26;
            return { r: (1 - t) * 0.31, y: 0.50 + t * 0.48 };
        },
        v => {
            if (v > 0.70) return rgb(0.96, 0.78, 0.20);
            const stripe = Math.floor(((v - 0.06) / 0.64) * 5) % 2 === 0;
            return stripe ? rgb(0.88, 0.22, 0.24) : rgb(0.96, 0.96, 0.96);
        }, 40, 40
    );

    for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2;
        const fx = Math.cos(a) * 0.34, fz = Math.sin(a) * 0.34;
        m.addTube(Array.of(Array.of(Math.cos(a) * 0.18, -0.18, Math.sin(a) * 0.18), Array.of(fx, -0.60, fz)), Array.of(0.05, 0.11), rgb(0.88, 0.22, 0.24), 12);
        m.addEllipsoid(fx, -0.60, fz, 0.11, 0.05, 0.11, rgb(0.88, 0.22, 0.24), 12);
    }

    m.addTube(Array.of(Array.of(0, -0.62, 0), Array.of(0.05, -0.82, 0.04), Array.of(-0.04, -1.02, -0.03)), Array.of(0.045, 0.03, 0.01), rgb(1.0, 0.85, 0.25), 12);
    Array.of(Array.of(-0.16, -0.92, 0.10), Array.of(0.18, -0.88, -0.08), Array.of(0.06, -1.04, 0.14), Array.of(-0.10, -1.05, -0.12)).forEach(([sx, sy, sz]) => {
        m.addEllipsoid(sx, sy, sz, 0.055, 0.055, 0.055, rgb(1.0, 0.72, 0.18), 12);
    });
};

window.HOLIDAY_3D_BUILDERS.snowflake = function (m) {
    const rgb = (r, g, b) => Array.of(r, g, b);
    m.addEllipsoid(0, 0, 0, 0.22, 0.22, 0.16, rgb(0.78, 0.93, 1.0), 20);
    for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a);
        m.addTube(Array.of(Array.of(0, 0, 0), Array.of(ca * 0.96, sa * 0.96, 0)), Array.of(0.075, 0.03), rgb(0.58, 0.84, 0.98), 12);
        m.addEllipsoid(ca * 0.96, sa * 0.96, 0, 0.045, 0.045, 0.045, rgb(0.82, 0.95, 1.0), 10);
        Array.of(-0.62, 0.62).forEach(off => {
            const ba = a + off;
            const bx = ca * 0.52 + Math.cos(ba) * 0.34, by = sa * 0.52 + Math.sin(ba) * 0.34;
            m.addTube(Array.of(Array.of(ca * 0.52, sa * 0.52, 0), Array.of(bx, by, 0)), Array.of(0.055, 0.02), rgb(0.70, 0.90, 1.0), 10);
            m.addEllipsoid(bx, by, 0, 0.03, 0.03, 0.03, rgb(0.82, 0.95, 1.0), 10);
        });
    }
};

window.HOLIDAY_3D_BUILDERS.star = function (m) {
    const rgb = (r, g, b) => Array.of(r, g, b);
    const pts = Array.from({ length: 10 }, (_, i) => {
        const r = i % 2 === 0 ? 0.98 : 0.44, a = (i / 10) * Math.PI * 2 + 1.57;
        return Array.of(Math.cos(a) * r, Math.sin(a) * r);
    });
    m.addPillow(pts, 0.24, rgb(0.96, 0.74, 0.18));
};
