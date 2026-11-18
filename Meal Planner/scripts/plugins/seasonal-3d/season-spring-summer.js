window.SEASONAL_3D_MODELS = window.SEASONAL_3D_MODELS || {};

window.SEASONAL_3D_MODELS.heart = function (m) {
    const rgb = (r, g, b) => Array.of(r, g, b);
    const heartCol = rgb(0.90, 0.15, 0.27);
    const uSteps = 64, vSteps = 28;

    function evalPoint(u, v) {
        const t = u * Math.PI * 2, s = v * Math.PI;
        const sinS = Math.sin(s), cosS = Math.cos(s);
        const hx = 16 * Math.pow(Math.sin(t), 3);
        const rawHy = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        const hy = rawHy + 2.2 * Math.pow(Math.sin(t * 0.5), 4);
        const scale = 0.056 * sinS;
        return Array.of(hx * scale, (hy + 1.8) * scale, 0.38 * cosS * (0.45 + 0.55 * sinS));
    }

    const grid = [];
    for (let iv = 0; iv <= vSteps; iv++) {
        const row = [];
        for (let iu = 0; iu <= uSteps; iu++) row.push(evalPoint((iu % uSteps) / uSteps, iv / vSteps));
        grid.push(row);
    }

    function computeNormal(iu, iv) {
        if (iv === 0) return Array.of(0, 0, 1);
        if (iv === vSteps) return Array.of(0, 0, -1);
        const u0 = (iu - 1 + uSteps) % uSteps, u1 = (iu + 1) % uSteps;
        const v0 = Math.max(0, iv - 1), v1 = Math.min(vSteps, iv + 1);
        const pu0 = grid.at(iv).at(u0), pu1 = grid.at(iv).at(u1);
        const pv0 = grid.at(v0).at(iu), pv1 = grid.at(v1).at(iu);
        const dux = pu1.at(0) - pu0.at(0), duy = pu1.at(1) - pu0.at(1), duz = pu1.at(2) - pu0.at(2);
        const dvx = pv1.at(0) - pv0.at(0), dvy = pv1.at(1) - pv0.at(1), dvz = pv1.at(2) - pv0.at(2);
        let nx = dvy * duz - dvz * duy, ny = dvz * dux - dvx * duz, nz = dvx * duy - dvy * dux;
        const pt = grid.at(iv).at(iu);
        if (nx * pt.at(0) + ny * pt.at(1) + nz * pt.at(2) < 0) { nx = -nx; ny = -ny; nz = -nz; }
        const len = Math.hypot(nx, ny, nz) || 1;
        return Array.of(nx / len, ny / len, nz / len);
    }

    const normals = [];
    for (let iv = 0; iv <= vSteps; iv++) {
        const row = [];
        for (let iu = 0; iu <= uSteps; iu++) row.push(computeNormal(iu % uSteps, iv));
        normals.push(row);
    }

    for (let iv = 0; iv < vSteps; iv++) {
        for (let iu = 0; iu < uSteps; iu++) {
            m.pushQuad(
                grid.at(iv).at(iu), grid.at(iv).at(iu + 1), grid.at(iv + 1).at(iu + 1), grid.at(iv + 1).at(iu),
                heartCol,
                normals.at(iv).at(iu), normals.at(iv).at(iu + 1), normals.at(iv + 1).at(iu + 1), normals.at(iv + 1).at(iu)
            );
        }
    }
};

window.SEASONAL_3D_MODELS.clover = function (m) {
    const rgb = (r, g, b) => Array.of(r, g, b);
    const leafCol = rgb(0.16, 0.68, 0.28);
    for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2 + Math.PI / 4, perp = a + Math.PI / 2;
        const baseX = Math.cos(a) * 0.36, baseY = Math.sin(a) * 0.36;
        Array.of(-0.14, 0.14).forEach(off => {
            m.addEllipsoid(baseX + Math.cos(perp) * off, baseY + Math.sin(perp) * off, 0, 0.27, 0.27, 0.13, leafCol, 16);
        });
        m.addEllipsoid(Math.cos(a) * 0.20, Math.sin(a) * 0.20, 0, 0.22, 0.22, 0.13, leafCol, 14);
    }
    m.addEllipsoid(0, 0, 0, 0.26, 0.26, 0.15, rgb(0.12, 0.54, 0.22), 16);
    m.addTube(Array.of(Array.of(0, -0.10, 0), Array.of(0.06, -0.52, 0), Array.of(0.22, -0.88, 0)), Array.of(0.055, 0.045, 0.03), rgb(0.14, 0.52, 0.22), 12);
};

window.SEASONAL_3D_MODELS.egg = function (m) {
    const rgb = (r, g, b) => Array.of(r, g, b);
    m.addLathe(
        v => {
            const phi = v * Math.PI;
            return { r: Math.sin(phi) * 0.64 * (1 - 0.22 * Math.cos(phi)), y: Math.cos(phi) * 0.88 };
        },
        (v, u) => {
            const wave = Math.sin(u * Math.PI * 16) * 0.035;
            if (Math.abs(v - (0.49 + wave)) < 0.055) return rgb(0.98, 0.82, 0.24);
            if (Math.abs(v - 0.28) < 0.04 || Math.abs(v - 0.70) < 0.04) {
                return Math.sin(u * Math.PI * 16) > 0.25 ? rgb(0.96, 0.42, 0.58) : rgb(0.68, 0.52, 0.92);
            }
            return v < 0.49 ? rgb(0.68, 0.52, 0.92) : rgb(0.56, 0.82, 0.78);
        }, 44, 34
    );
};

window.SEASONAL_3D_MODELS.flower = function (m) {
    const rgb = (r, g, b) => Array.of(r, g, b);
    const outerCol = rgb(0.96, 0.44, 0.66), innerCol = rgb(0.99, 0.72, 0.84);
    for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        m.addEllipsoid(Math.cos(a) * 0.50, Math.sin(a) * 0.50, 0, 0.34, 0.34, 0.14, outerCol, 18);
        const a2 = a + Math.PI / 6;
        Array.of(-0.06, 0.06).forEach(zOff => m.addEllipsoid(Math.cos(a2) * 0.30, Math.sin(a2) * 0.30, zOff, 0.22, 0.22, 0.10, innerCol, 14));
    }
    m.addEllipsoid(0, 0, 0, 0.28, 0.28, 0.22, rgb(0.98, 0.78, 0.16), 18);
};

window.SEASONAL_3D_MODELS.sun = function (m) {
    const rgb = (r, g, b) => Array.of(r, g, b);
    const coreCol = rgb(0.99, 0.74, 0.12), glowCol = rgb(0.96, 0.54, 0.10), rayCol = rgb(0.99, 0.85, 0.24);
    m.addEllipsoid(0, 0, 0, 0.48, 0.48, 0.30, coreCol, 26);
    m.addEllipsoid(0, 0, 0, 0.58, 0.58, 0.16, glowCol, 22);

    for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a), isPrimary = i % 2 === 0;
        const midR = isPrimary ? 0.78 : 0.66, outerR = isPrimary ? 1.02 : 0.80, baseRad = isPrimary ? 0.105 : 0.085;
        const col = isPrimary ? rayCol : glowCol;
        m.addTube(Array.of(Array.of(ca * 0.50, sa * 0.50, 0), Array.of(ca * midR, sa * midR, 0), Array.of(ca * outerR, sa * outerR, 0)), Array.of(baseRad, baseRad * 0.52, 0.018), col, 12);
        m.addEllipsoid(ca * outerR, sa * outerR, 0, 0.02, 0.02, 0.02, col, 10);
    }
};
