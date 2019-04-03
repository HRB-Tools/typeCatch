import { fileresult } from './fileio';
import { clicktouch } from './clicktouch';
import { createLohnarten } from './lohnarten';
import { intmath as µ } from './intmath';
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
        lohnarten[0] = ['Mitarbeiter Nr.', '801', '803', '805', '820', '885', '886', '887', 'Arbeitsstunden', 'Stundenkonto', 'Ersatz'];
        for (let i = 1; i < lohnarten.length; i++) {
            lohnarten[i][6] = µ.round.fl('' + µ.div.fl(zero(lohnarten[i][5]), '2'), 2);
            lohnarten[i][7] = µ.roundDown.fl('' + µ.div.fl(zero(lohnarten[i][5]), '2'), 2);
            lohnarten[i][10] = µ.plus.fl('0', zero(arr[i - 1][2]));
            for (let j = 0; j < lohnarten[i].length; j++) {
                if (typeof (lohnarten[i][j]) == 'string') {
                    lohnarten[i][j] = µ.plus.fl('0', zero(lohnarten[i][j])); // Konvertierung in Float
                }
            }
        }
        console.log(lohnarten);
        return [arr, lohnarten];
    }).then(function (args) {
        file2.then(function (txt) {
            let arr;
            if (typeof (txt) == 'string') {
                arr = txt.split('\r\n');
            }
            let stdObject = {};
            for (let i = 0; i < arr.length; i++) {
                arr[i] = arr[i].split(';');
                stdObject[arr[i][0]] = arr[i].slice(1);
            }
            let lohnarten = args[1];
            for (let j = 1; j < lohnarten.length; j++) {
                for (let k in stdObject) {
                    if (stdObject[k].includes(`${lohnarten[j][0] + ''}`)) {
                        lohnarten[j][9] = parseFloat(k);
                    }
                }
            }
            // csv = csv.replace(/\./g, ',')
            // filedownload(csv, 'Stundenkonten.txt')
        });
    });
}
//# sourceMappingURL=index.js.map