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
// @ts-ignore
const rentnerUndAzubis = () => Array.from(document.querySelectorAll('#azubis input, #rentner input')).filter(el => el.value).map(el => parseInt(el.value));
const enterAndNext = el => evt => {
    console.log(el.parentElement, evt.keycode);
    if (evt.keyCode === 13 || evt.which === 13 || evt.keycode === 13) {
        evt.preventDefault();
        console.log(el.parentElement);
        const newInput = el.cloneNode(false);
        console.log(newInput);
        newInput.value = '';
        newInput.addEventListener('keypress', evt => enterAndNext(newInput)(evt));
        el.parentElement.appendChild(newInput);
        newInput.focus();
    }
};
function init() {
    clicktouch('#csv', load);
    document.querySelectorAll('#rentner input, #azubis input').forEach(el => el.addEventListener('keypress', evt => enterAndNext(el)(evt)));
}
function load() {
    const lohndatei = fileresult(), stundendatei = fileresult();
    lohndatei.then(function (csv) {
        if (typeof (csv) == 'string') {
            return csv.split('\n').map(row => row.split('!') || []);
        }
    }).then(function (arr) {
        const zero = str => isNaN(parseInt(str)) ? 0 : str, lohnarten = [['Mitarbeiter Nr.', '801', '803', '805', '820', '885', '886', '887', 'Arbeitsstunden', 'Stundenkonto', 'Ersatz']]
            .concat(createLohnarten(arr)
            .map(row => row.map(cell => µ.plus.fl('0', zero(cell))))
            .map(row => [...row.slice(0, 6), µ.round.fl('' + µ.div.fl(zero(row[5]), '2'), 2), µ.roundDown.fl('' + µ.div.fl(zero(row[5]), '2'), 2), ...row.slice(8)])
            .slice(1)
            .filter(row => !(rentnerUndAzubis().includes(row[0]))));
        return lohnarten;
    }).then(function (lohnarten) {
        stundendatei.then(function (txt) {
            const arr = String(txt).split('\r\n'), obj = {};
            // 5 Zeilen pro Eintrag
            for (let i = 0; i < arr.length; i += 5) {
                obj[arr[i]] = arr[i + 4];
            }
            for (const [idx, row] of lohnarten.entries()) {
                idx && (row[9] = µ.plus.fl(obj[row[0]], '0'));
            }
            console.table(lohnarten);
            const lohn = [];
            lohnarten.forEach((row, idx) => {
                if (idx) {
                    row.slice(1, 8).forEach((el, idx) => {
                        el && lohn.push([lohnarten[0].slice(1, 8)[idx], el, row[0]].join(';'));
                    });
                    if (!isNaN(row[9])) {
                        // @ts-ignore
                        console.table([row[9], row.slice(1, 6).reduce((accumulator, currentValue) => µ.plus.fl('' + accumulator, '' + currentValue), row[10])]);
                        lohn.push([797, µ.minus.fl('' + row[9], '' + row.slice(1, 6).reduce((accumulator, currentValue) => µ.plus.fl('' + accumulator, '' + currentValue), row[10])), row[0]].join(';'));
                    }
                    else {
                        console.table([row[8], row.slice(1, 6).reduce((accumulator, currentValue) => µ.plus.fl('' + accumulator, '' + currentValue))]);
                        lohn.push([797, µ.minus.fl('' + row[8], '' + row.slice(1, 6).reduce((accumulator, currentValue) => µ.plus.fl('' + accumulator, '' + currentValue))), row[0]].join(';'));
                    }
                }
            });
            const csv = lohn.join('\r\n').replace(/ /g, '').replace(/\./g, ',');
            // console.table(csv)
            filedownload(csv, 'Stundenkonten.txt');
        });
    });
}
//# sourceMappingURL=index.js.map