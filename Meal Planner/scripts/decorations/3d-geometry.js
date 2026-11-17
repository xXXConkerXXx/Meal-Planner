function createSmoothMeshBuilder() {
    const pos = [], norm = [], col = [];

    const pushTri = (a, b, c, color, na, nb, nc) => {
        if (!na) {
            const ux = b.at(0) - a.at(0), uy = b.at(1) - a.at(1), uz = b.at(2) - a.at(2);
            const vx = c.at(0) - a.at(0), vy = c.at(1) - a.at(1), vz = c.at(2) - a.at(2);
            let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
            const len = Math.hypot(nx, ny, nz) || 1;
            na = nb = nc = Array.of(nx / len, ny / len, nz / len);
        }
        Array.of(Array.of(a, na), Array.of(b, nb), Array.of(c, nc)).forEach(pair => {
            const p = pair.at(0), n = pair.at(1);
            pos.push(p.at(0), p.at(1), p.at(2));
            norm.push(n.at(0), n.at(1), n.at(2));
            col.push(color.at(0), color.at(1), color.at(2));
        });
    };

    const pushQuad = (p1, p2, p3, p4, color, n1, n2, n3, n4) => {
        pushTri(p1, p2, p3, color, n1, n2, n3);
        pushTri(p1, p3, p4, color, n1, n3, n4);
    };

    const addLathe = (profFn, colFn, segs = 64, stacks = 40) => {
        const g = [];
        for (let i = 0; i <= stacks; i++) {
            const row = [], v = i / stacks;
            for (let j = 0; j <= segs; j++) {
                const th = (j / segs) * Math.PI * 2;
                const { r, y } = profFn(v, th);
                row.push(Array.of(Math.cos(th) * r, y, Math.sin(th) * r));
            }
            g.push(row);
        }
        const getN = (i, j) => {
            const i0 = Math.max(0, i - 1), i1 = Math.min(stacks, i + 1);
            const j0 = (j - 1 + segs) % segs, j1 = (j + 1) % segs;
            const pU = g.at(i1).at(j), pD = g.at(i0).at(j), pR = g.at(i).at(j1), pL = g.at(i).at(j0);
            const tx = pR.at(0) - pL.at(0), ty = pR.at(1) - pL.at(1), tz = pR.at(2) - pL.at(2);
            const bx = pU.at(0) - pD.at(0), by = pU.at(1) - pD.at(1), bz = pU.at(2) - pD.at(2);
            let nx = by * tz - bz * ty, ny = bz * tx - bx * tz, nz = bx * ty - by * tx;
            const len = Math.hypot(nx, ny, nz) || 1;
            return Array.of(nx / len, ny / len, nz / len);
        };
        for (let i = 0; i < stacks; i++) {
            for (let j = 0; j < segs; j++) {
                pushQuad(g.at(i).at(j), g.at(i + 1).at(j), g.at(i + 1).at(j + 1), g.at(i).at(j + 1),
                    colFn((i + 0.5) / stacks, (j + 0.5) / segs),
                    getN(i, j), getN(i + 1, j), getN(i + 1, j + 1), getN(i, j + 1));
            }
        }
    };

    const addEllipsoid = (cx, cy, cz, rx, ry, rz, color, segs = 32) => {
        const st = Math.max(16, Math.floor(segs * 0.75));
        const vert = (i, j) => {
            const p = (i / st) * Math.PI, t = (j / segs) * Math.PI * 2;
            const dx = Math.sin(p) * Math.cos(t), dy = Math.cos(p), dz = Math.sin(p) * Math.sin(t);
            const len = Math.hypot(dx / rx, dy / ry, dz / rz) || 1;
            return { p: Array.of(cx + dx * rx, cy + dy * ry, cz + dz * rz), n: Array.of((dx / rx) / len, (dy / ry) / len, (dz / rz) / len) };
        };
        for (let i = 0; i < st; i++) for (let j = 0; j < segs; j++) {
            const v1 = vert(i, j), v2 = vert(i + 1, j), v3 = vert(i + 1, j + 1), v4 = vert(i, j + 1);
            pushQuad(v1.p, v2.p, v3.p, v4.p, color, v1.n, v2.n, v3.n, v4.n);
        }
    };

    const addTube = (pts, rads, color, segs = 20) => {
        const rings = [], nRings = [];
        pts.forEach((p, idx) => {
            const prev = pts.at(Math.max(0, idx - 1)), next = pts.at(Math.min(pts.length - 1, idx + 1));
            let tx = next.at(0) - prev.at(0), ty = next.at(1) - prev.at(1), tz = next.at(2) - prev.at(2);
            const tl = Math.hypot(tx, ty, tz) || 1; tx /= tl; ty /= tl; tz /= tl;
            const ux = Math.abs(ty) < 0.9 ? 0 : 1, uy = Math.abs(ty) < 0.9 ? 1 : 0;
            let nx = -tz * uy, ny = tz * ux, nz = tx * uy - ty * ux;
            const nl = Math.hypot(nx, ny, nz) || 1; nx /= nl; ny /= nl; nz /= nl;
            const bx = ty * nz - tz * ny, by = tz * nx - tx * nz, bz = tx * ny - ty * nx;
            const r = rads.at(idx), ring = [], nRing = [];
            for (let j = 0; j < segs; j++) {
                const a = (j / segs) * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a);
                const dx = nx * ca + bx * sa, dy = ny * ca + by * sa, dz = nz * ca + bz * sa;
                ring.push(Array.of(p.at(0) + dx * r, p.at(1) + dy * r, p.at(2) + dz * r));
                nRing.push(Array.of(dx, dy, dz));
            }
            rings.push(ring); nRings.push(nRing);
        });
        for (let i = 0; i < rings.length - 1; i++) for (let j = 0; j < segs; j++) {
            const j2 = (j + 1) % segs;
            pushQuad(rings.at(i).at(j), rings.at(i + 1).at(j), rings.at(i + 1).at(j2), rings.at(i).at(j2),
                color, nRings.at(i).at(j), nRings.at(i + 1).at(j), nRings.at(i + 1).at(j2), nRings.at(i).at(j2));
        }
    };

    const addPillow = (pts2D, depth, color, cx = 0, cy = 0, cz = 0) => {
        const n = pts2D.length, rings = 6;
        for (let r = 0; r < rings; r++) {
            const f1 = r / rings, f2 = (r + 1) / rings;
            const z1 = depth * Math.sqrt(Math.max(0, 1 - f1 * f1)), z2 = depth * Math.sqrt(Math.max(0, 1 - f2 * f2));
            for (let i = 0; i < n; i++) {
                const a = pts2D.at(i), b = pts2D.at((i + 1) % n);
                const p1 = Array.of(cx + a.at(0) * f1, cy + a.at(1) * f1, cz + z1);
                const p2 = Array.of(cx + a.at(0) * f2, cy + a.at(1) * f2, cz + z2);
                const p3 = Array.of(cx + b.at(0) * f2, cy + b.at(1) * f2, cz + z2);
                const p4 = Array.of(cx + b.at(0) * f1, cy + b.at(1) * f1, cz + z1);

                const nf = (pt, f) => {
                    const lx = (pt.at(0) - cx) * f * 0.65;
                    const ly = (pt.at(1) - cy) * f * 0.65;
                    const lz = Math.max(0.35, 1.0 - f * 0.55);
                    const l = Math.hypot(lx, ly, lz) || 1;
                    return Array.of(lx / l, ly / l, lz / l);
                };
                const nb = v => Array.of(v.at(0), v.at(1), -v.at(2));

                const n1 = nf(p1, f1), n2 = nf(p2, f2), n3 = nf(p3, f2), n4 = nf(p4, f1);
                pushQuad(p1, p4, p3, p2, color, n1, n4, n3, n2);

                const b1 = Array.of(p1.at(0), p1.at(1), cz - z1);
                const b2 = Array.of(p2.at(0), p2.at(1), cz - z2);
                const b3 = Array.of(p3.at(0), p3.at(1), cz - z2);
                const b4 = Array.of(p4.at(0), p4.at(1), cz - z1);
                pushQuad(b1, b2, b3, b4, color, nb(n1), nb(n2), nb(n3), nb(n4));
            }
        }
    };

    return { addLathe, addEllipsoid, addTube, addPillow, build: () => ({ pos: new Float32Array(pos), norm: new Float32Array(norm), col: new Float32Array(col), count: pos.length / 3 }) };
}
