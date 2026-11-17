(function () {
    const MONTH_POOLS = Array.of(
        Array.of("firework", "snowflake"),
        Array.of("heart"),
        Array.of("clover", "flower"),
        Array.of("egg", "flower"),
        Array.of("flower", "heart"),
        Array.of("sun", "star"),
        Array.of("firework", "sun"),
        Array.of("sun", "flower"),
        Array.of("leaf", "acorn"),
        Array.of("pumpkin", "bat"),
        Array.of("turkey", "leaf", "acorn"),
        Array.of("tree", "snowflake")
    );

    let gl, prog, objs = [], activeKey = "";

    function readCalendarContext() {
        const h1 = document.querySelector("h1");
        const title = (h1 ? h1.textContent : "").toLowerCase();
        const months = Array.of("january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december");
        let mIdx = months.findIndex(m => title.includes(m));
        if (mIdx === -1) mIdx = typeof viewMonth === "number" ? viewMonth : new Date().getMonth();

        const cells = Array.from(document.querySelectorAll(".day-cell:not(.adjacent-month)")).map(c => c.textContent.toLowerCase()).join(" ");
        const extras = [];
        if (cells.includes("thanksgiving")) extras.push("turkey");
        if (cells.includes("halloween")) extras.push("pumpkin", "bat");
        if (cells.includes("christmas")) extras.push("tree", "snowflake");
        if (cells.includes("valentine")) extras.push("heart");
        if (cells.includes("easter")) extras.push("egg");
        if (cells.includes("st. patrick")) extras.push("clover");
        if (cells.includes("new year") || cells.includes("independence")) extras.push("firework");

        const pool = Array.from(new Set([...(MONTH_POOLS.at(mIdx) || Array.of("leaf")), ...extras]));
        return { key: `${mIdx}:${pool.join(",")}`, pool };
    }

    function spawn(pool) {
        objs.forEach(o => { gl.deleteBuffer(o.pBuf); gl.deleteBuffer(o.nBuf); gl.deleteBuffer(o.cBuf); });
        objs = [];

        const aspect = gl.canvas.width / (gl.canvas.height || 1);
        const halfH = 14.0 / 1.8, halfW = halfH * aspect;
        const makeBuf = data => { const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW); return b; };

        for (let i = 0; i < 12; i++) {
            const kind = pool.at(i % pool.length);
            let geo;
            try {
                geo = createHoliday3DModel(kind);
            } catch (err) {
                console.error(`3D model error for "${kind}":`, err);
                continue;
            }
            if (!geo || !geo.count) continue;

            const scale = Math.random() * 0.70 + 0.90;
            const speed = Math.random() * 0.014 + 0.007;
            const ang = Math.random() * Math.PI * 2;
            objs.push({
                pBuf: makeBuf(geo.pos), nBuf: makeBuf(geo.norm), cBuf: makeBuf(geo.col), count: geo.count,
                scale, x: (Math.random() * 2 - 1) * (halfW + 1), y: (Math.random() * 2 - 1) * (halfH + 1), z: (Math.random() * 2 - 1) * 1.0,
                vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed,
                rx: Math.random() * 6.28, ry: Math.random() * 6.28, rz: Math.random() * 6.28,
                vrx: (Math.random() - 0.5) * 0.014, vry: (Math.random() - 0.5) * 0.016, vrz: (Math.random() - 0.5) * 0.009
            });
        }
    }

    function tick() {
        requestAnimationFrame(tick);
        const { key, pool } = readCalendarContext();
        if (key !== activeKey) { activeKey = key; spawn(pool); }

        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const aspect = gl.canvas.width / (gl.canvas.height || 1);
        const halfH = 14.0 / 1.8, halfW = halfH * aspect;
        stepHoliday3DPhysics(objs, halfW, halfH);

        const uTrans = gl.getUniformLocation(prog, "uTrans");
        const uRot = gl.getUniformLocation(prog, "uRot");
        const uScale = gl.getUniformLocation(prog, "uScale");
        const uAspect = gl.getUniformLocation(prog, "uAspect");
        const aPos = gl.getAttribLocation(prog, "aPos");
        const aNorm = gl.getAttribLocation(prog, "aNorm");
        const aCol = gl.getAttribLocation(prog, "aCol");

        gl.uniform1f(uAspect, aspect);
        objs.forEach(o => {
            gl.uniform3f(uTrans, o.x, o.y, o.z);
            gl.uniform3f(uRot, o.rx, o.ry, o.rz);
            gl.uniform1f(uScale, o.scale);

            gl.bindBuffer(gl.ARRAY_BUFFER, o.pBuf); gl.enableVertexAttribArray(aPos); gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, o.nBuf); gl.enableVertexAttribArray(aNorm); gl.vertexAttribPointer(aNorm, 3, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, o.cBuf); gl.enableVertexAttribArray(aCol); gl.vertexAttribPointer(aCol, 3, gl.FLOAT, false, 0, 0);
            gl.drawArrays(gl.TRIANGLES, 0, o.count);
        });
    }

    function init() {
        if (typeof createHoliday3DModel !== "function") { console.error("Missing createHoliday3DModel (check 3d-models.js)"); return; }
        if (typeof stepHoliday3DPhysics !== "function") { console.error("Missing stepHoliday3DPhysics (check 3d-physics.js)"); return; }

        const layer = document.createElement("div");
        layer.id = "holiday-3d-overlay";
        layer.className = "screen-only";
        layer.style.cssText = "position: fixed; inset: 0; pointer-events: none; z-index: 1; opacity: 1;";
        const canvas = document.createElement("canvas");
        canvas.style.cssText = "width: 100%; height: 100%; display: block;";
        layer.appendChild(canvas);
        document.body.appendChild(layer);

        ["header", "#preview-view", "#edit-view", "#grocery-view"].forEach(sel => {
            const el = document.querySelector(sel);
            if (el) { el.style.position = "relative"; el.style.zIndex = "2"; }
        });

        gl = canvas.getContext("webgl", { alpha: true, antialias: true, premultipliedAlpha: false });
        if (!gl) return;

        const vs = `
            attribute vec3 aPos, aNorm, aCol;
            uniform vec3 uTrans, uRot;
            uniform float uScale, uAspect;
            varying vec3 vColor;
            void main() {
                vec3 p = aPos * uScale, n = aNorm;
                float cx = cos(uRot.x), sx = sin(uRot.x), cy = cos(uRot.y), sy = sin(uRot.y), cz = cos(uRot.z), sz = sin(uRot.z);
                p = vec3(p.x, p.y*cx - p.z*sx, p.y*sx + p.z*cx);
                p = vec3(p.x*cy + p.z*sy, p.y, -p.x*sy + p.z*cy);
                p = vec3(p.x*cz - p.y*sz, p.x*sz + p.y*cz, p.z);
                n = vec3(n.x, n.y*cx - n.z*sx, n.y*sx + n.z*cx);
                n = vec3(n.x*cy + n.z*sy, n.y, -n.x*sy + n.z*cy);
                n = vec3(n.x*cz - n.y*sz, n.x*sz + n.y*cz, n.z);
                vec3 world = p + uTrans;
                gl_Position = vec4((world.x * 1.8) / uAspect, world.y * 1.8, (world.z + 10.0) / 30.0, 14.0 - world.z);
                float key = max(dot(normalize(n), normalize(vec3(0.25, 0.5, 1.0))), 0.0);
                vColor = aCol * (0.85 + 0.15 * key);
            }
        `;
        const fs = `precision mediump float; varying vec3 vColor; void main() { gl_FragColor = vec4(vColor, 1.0); }`;
        const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
        prog = gl.createProgram();
        gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs));
        gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs));
        gl.linkProgram(prog);
        gl.useProgram(prog);
        gl.enable(gl.DEPTH_TEST);

        const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; gl.viewport(0, 0, canvas.width, canvas.height); };
        resize();
        window.addEventListener("resize", resize);
        tick();
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
})();
