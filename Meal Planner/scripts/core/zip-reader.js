window.CoreZipReader = (function () {
    async function inflateRaw(compressedBytes) {
        if (typeof DecompressionStream === "undefined") {
            throw new Error("Browser does not support DecompressionStream.");
        }
        const stream = new Blob([compressedBytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
        return await new Response(stream).arrayBuffer();
    }

    async function extractFiles(arrayBuffer) {
        const view = new DataView(arrayBuffer);
        const bytes = new Uint8Array(arrayBuffer);
        const decoder = new TextDecoder("utf-8");

        // Locate End of Central Directory (EOCD) signature 0x06054b50
        let eocdOffset = -1;
        for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) {
            if (view.getUint32(i, true) === 0x06054b50) {
                eocdOffset = i;
                break;
            }
        }
        if (eocdOffset < 0) throw new Error("Invalid or corrupted .zip archive.");

        const totalEntries = view.getUint16(eocdOffset + 10, true);
        let cdOffset = view.getUint32(eocdOffset + 16, true);
        const files = new Map();

        for (let n = 0; n < totalEntries; n++) {
            if (view.getUint32(cdOffset, true) !== 0x02014b50) break;
            const method = view.getUint16(cdOffset + 10, true);
            const compSize = view.getUint32(cdOffset + 20, true);
            const nameLen = view.getUint16(cdOffset + 28, true);
            const extraLen = view.getUint16(cdOffset + 30, true);
            const commentLen = view.getUint16(cdOffset + 32, true);
            const localHeaderOffset = view.getUint32(cdOffset + 42, true);

            const rawName = decoder.decode(bytes.subarray(cdOffset + 46, cdOffset + 46 + nameLen));
            cdOffset += 46 + nameLen + extraLen + commentLen;

            if (rawName.endsWith("/") || rawName.startsWith("__MACOSX/")) continue;

            const lNameLen = view.getUint16(localHeaderOffset + 26, true);
            const lExtraLen = view.getUint16(localHeaderOffset + 28, true);
            const dataStart = localHeaderOffset + 30 + lNameLen + lExtraLen;
            const slice = bytes.subarray(dataStart, dataStart + compSize);

            let outBuf;
            if (method === 0) outBuf = slice.slice().buffer;
            else if (method === 8) outBuf = await inflateRaw(slice);
            else continue;

            files.set(rawName, decoder.decode(outBuf));
        }
        return files;
    }

    function groupIntoPlugins(fileMap, includeTemplates = false) {
        const plugins = {};
        for (const [path, content] of fileMap.entries()) {
            const parts = path.split("/").filter(Boolean);
            const pIdx = parts.lastIndexOf("plugin.js");
            if (pIdx < 1) continue;
            const folder = parts[pIdx - 1];
            if (!includeTemplates && folder.startsWith("_")) continue;
            const prefix = parts.slice(0, pIdx).join("/") + "/";
            plugins[folder] = {};
            for (const [fPath, fText] of fileMap.entries()) {
                if (fPath.startsWith(prefix)) {
                    plugins[folder][fPath.slice(prefix.length)] = fText;
                }
            }
        }
        return plugins;
    }

    return { extractFiles, groupIntoPlugins };
})();
