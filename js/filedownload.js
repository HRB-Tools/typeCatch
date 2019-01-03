export const filedownload = function (arr, filename) {
    let blob = new Blob([arr], { type: 'text/csv; charset=utf-8' });
    let link = document.createElement("a");
    let url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
// new comment 
//# sourceMappingURL=filedownload.js.map