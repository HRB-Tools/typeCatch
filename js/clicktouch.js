export const clicktouch = (querySelector, bindFunction) => {
    const _querySelector = querySelector;
    const _function = bindFunction;
    document.querySelector(_querySelector).addEventListener('mousedown', function () {
        _function();
    });
    document.querySelector(_querySelector).addEventListener('touchstart', function () {
        _function();
    });
};
//# sourceMappingURL=clicktouch.js.map