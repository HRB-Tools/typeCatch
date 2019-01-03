// CSV Splitter -> returns a two dimensional array
export const resultArray = function (value) {
    let temp = value.split('\n'), arr = [];
    if (temp.length >= 1) {
        temp.forEach(function (element) {
            arr.push(element.split(';'));
        });
    }
    return arr;
};
export const csvArray = function (arr) {
    let csvArray = [];
    arr.forEach(element => csvArray.push(element.join(';')));
    return csvArray.join('\n');
};
//# sourceMappingURL=csv.js.map