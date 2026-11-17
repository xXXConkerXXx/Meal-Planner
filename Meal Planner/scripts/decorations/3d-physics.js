function stepHoliday3DPhysics(objs, halfW, halfH) {
    for (let i = 0; i < objs.length; i++) {
        for (let j = i + 1; j < objs.length; j++) {
            const a = objs.at(i), b = objs.at(j);
            const dx = b.x - a.x, dy = b.y - a.y, dist = Math.hypot(dx, dy);
            const minDist = (a.scale + b.scale) * 0.95;
            if (dist > 0 && dist < minDist) {
                const nx = dx / dist, ny = dy / dist, push = (minDist - dist) * 0.5;
                a.x -= nx * push;
                a.y -= ny * push;
                b.x += nx * push;
                b.y += ny * push;

                const vn = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
                if (vn < 0) {
                    const mA = Math.pow(a.scale, 3), mB = Math.pow(b.scale, 3);
                    const imp = (-1.92 * vn) / (1 / mA + 1 / mB);
                    a.vx -= (imp / mA) * nx;
                    a.vy -= (imp / mA) * ny;
                    b.vx += (imp / mB) * nx;
                    b.vy += (imp / mB) * ny;
                }
            }
        }
    }

    objs.forEach(o => {
        o.x += o.vx;
        o.y += o.vy;
        o.rx += o.vrx;
        o.ry += o.vry;
        o.rz += o.vrz;
        const pad = o.scale * 1.4;
        if (o.x > halfW + pad) o.x = -halfW - pad;
        else if (o.x < -halfW - pad) o.x = halfW + pad;
        if (o.y > halfH + pad) o.y = -halfH - pad;
        else if (o.y < -halfH - pad) o.y = halfH + pad;
    });
}
