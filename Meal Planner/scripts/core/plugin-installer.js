window.CorePluginInstaller = (function () {
    const DB_NAME = "ModularPlannerPackages";
    const STORE_NAME = "packages";
    const virtualFiles = new Map();

    function openDB() {
        return new Promise((resolve, reject) => {
            const req = indexedDB.open(DB_NAME, 1);
            req.onupgradeneeded = () => req.result.createObjectStore(STORE_NAME, { keyPath: "id" });
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }

    async function getAllPackages() {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, "readonly");
            const req = tx.objectStore(STORE_NAME).getAll();
            req.onsuccess = () => resolve(req.result || []);
            req.onerror = () => reject(req.error);
        });
    }

    async function savePackage(id, filesObj, source = "zip") {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, "readwrite");
            tx.objectStore(STORE_NAME).put({ id, files: filesObj, source, updatedAt: Date.now() });
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }

    async function removePackage(id) {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, "readwrite");
            tx.objectStore(STORE_NAME).delete(id);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }

    function registerVirtualFiles(pluginId, filesObj) {
        Object.entries(filesObj).forEach(([relPath, text]) => {
            const mime = relPath.endsWith(".css") ? "text/css" : "application/javascript";
            const blobUrl = URL.createObjectURL(new Blob([text], { type: mime }));
            virtualFiles.set(`scripts/plugins/${pluginId}/${relPath}`, blobUrl);
        });
    }

    function resolveVirtualUrl(logicalPath) {
        return virtualFiles.get(logicalPath) || null;
    }

    async function installFromBuffer(buffer, sourceLabel = "zip", includeTemplates = false) {
        const fileMap = await window.CoreZipReader.extractFiles(buffer);
        const grouped = window.CoreZipReader.groupIntoPlugins(fileMap, includeTemplates);
        const ids = Object.keys(grouped);
        if (!ids.length) throw new Error("No plugin folder containing plugin.js found in archive.");

        for (const id of ids) {
            await savePackage(id, grouped[id], sourceLabel);
        }
        return ids;
    }

    async function installFromFile(file, includeTemplates = false) {
        const buf = await file.arrayBuffer();
        return await installFromBuffer(buf, `zip:${file.name}`, includeTemplates);
    }

    async function installFromUrl(url, includeTemplates = false) {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Download failed (${res.status})`);
        const buf = await res.arrayBuffer();
        return await installFromBuffer(buf, url, includeTemplates);
    }

    async function preloadVirtualPackages() {
        const pkgs = await getAllPackages();
        pkgs.forEach(pkg => registerVirtualFiles(pkg.id, pkg.files || {}));
        return pkgs.map(pkg => pkg.id);
    }

    return {
        getAllPackages,
        removePackage,
        resolveVirtualUrl,
        installFromFile,
        installFromUrl,
        preloadVirtualPackages
    };
})();
