import { fileresult } from './fileio';
import { clicktouch } from './clicktouch';
import { createLohnarten } from './lohnarten';
import { intmath as µ } from './intmath';
import { filedownload } from './filedownload';
document.onreadystatechange = function () {
    if (document.readyState == 'complete') {
        init();
    }
};
function init() {
    clicktouch('#csv', load);
}
function load() {
    let file = fileresult();
    let file2 = fileresult();
    file.then(function (csv) {
        if (typeof (csv) == 'string') {
            return csv.split('\n').map(row => row.split('!') || []);
        }
    }).then(function (arr) {
        const zero = str => isNaN(parseInt(str)) ? 0 : str;
        let headers = ['Mitarbeiter Nr.', 'Arbeit', 'Ersatz', 'Stdkto.', 'U', 'F', 'B', 'K', '10', 'Nacht1', 'Nacht2', 'Nacht3', 'Sonnt.', 'Feier.', 'Überstd.', 'Leer'];
        console.log(arr, headers);
        let lohnarten = createLohnarten(arr);
        lohnarten.forEach((row, i) => {
            row[6] = µ.round.fl('' + µ.div.fl(zero(row[5]), '2'), 2);
            row[7] = µ.roundDown.fl('' + µ.div.fl(zero(row[5]), '2'), 2);
            row[10] = arr[i] ? µ.plus.fl('0', zero(arr[i][2])) : 0;
            // row.forEach(item => {
            //   if (typeof (item) == 'string') {
            //     row[i] = µ.plus.fl('0', zero(item))
            //   }
            // })
        });
        lohnarten[0] = ['Mitarbeiter Nr.', '801', '803', '805', '820', '885', '886', '887', 'Arbeitsstunden', 'Stundenkonto', 'Ersatz'];
        return [arr, lohnarten];
    }).then(function (args) {
        file2.then(function (txt) {
            let arr, obj = {};
            if (typeof (txt) == 'string') {
                arr = txt.split('\r\n');
            }
            for (let i = 0; i < arr.length; i += 5) {
                obj[arr[i]] = arr[i + 4];
            }
            console.log(obj);
            let lohnarten = args[1];
            for (let j = 1; j < lohnarten.length; j++) {
                lohnarten[j][9] = obj[lohnarten[j][0]];
            }
            console.log(lohnarten);
            let csv = lohnarten.map(row => row.join(';')).join('\r\n').replace(/ /g, '').replace(/\./g, ',');
            console.log(csv);
            // csv = csv.replace(/\./g, ',')
            filedownload(csv, 'Stundenkonten.txt');
        });
    });
}
//# sourceMappingURL=index.js.map