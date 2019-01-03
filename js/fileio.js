// Creates a File Input element, activates it and returns the result if nonempty
export const fileresult = function () {
    return new Promise(function (resolve, reject) {
        let fileInput = document.createElement('input'), reader = new FileReader();
        fileInput.setAttribute('type', 'file');
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);
        fileInput.addEventListener('change', function () { reader.readAsText(this.files[0]); });
        reader.addEventListener('loadend', function () {
            if (this.result !== '') {
                resolve(this.result);
            }
            else {
                reject(this.result);
            }
        });
        fileInput.click();
    });
};
//# sourceMappingURL=fileio.js.map