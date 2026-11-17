function createHoliday3DModel(type) {
    const m = createSmoothMeshBuilder();
    const builders = window.HOLIDAY_3D_BUILDERS || {};
    const buildFn = builders[type] || builders.leaf;
    if (typeof buildFn === "function") buildFn(m);
    return m.build();
}
