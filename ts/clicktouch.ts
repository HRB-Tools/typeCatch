export const clicktouch = ( querySelector : string, bindFunction ) : void => {
    const _querySelector : string = querySelector;
    const _function = bindFunction;

    document.querySelector(_querySelector).addEventListener('mousedown', function(){
        _function();
    });
    document.querySelector(_querySelector).addEventListener('touchstart', function(){
        _function();
    });

}