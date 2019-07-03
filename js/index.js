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
    if (evt.keyCode === 13 || evt.which === 13 || evt.keycode === 13) {
        evt.preventDefault();
        const newInput = el.cloneNode(false);
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
            // console.log(String(txt).split(/\s/)
            //   .filter(word => /(?:^[0-9]{2,}(?:,[0-9]+)?$)|(?:^kein$)/.test(word))
            //   .filter(word => parseInt(word) != (new Date()).getFullYear() && parseInt(word) != (new Date()).getFullYear() - 2000 && parseInt(word) != (new Date()).getFullYear() - 2001)
            // );
            const arr = String(txt).split(/\s/)
                .filter(word => /(?:^[0-9]{2,}(?:,[0-9]+)?$)|(?:^kein$)/.test(word))
                .filter(word => parseInt(word) != (new Date()).getFullYear() && parseInt(word) != (new Date()).getFullYear() - 2000 && parseInt(word) != (new Date()).getFullYear() - 2001), obj = {};
            for (let i = 0; i < arr.length; i += 4) { // 5 Zeilen pro Eintrag
                obj[arr[i]] = arr[i + 3];
            }
            for (const [idx, row] of lohnarten.entries()) {
                idx && (row[9] = µ.plus.fl(obj[row[0]], '0')); // skip first
            }
            const lohn = lohnarten.map((row, idx) => {
                return row.slice(1, 8)
                    .map((el, idx) => {
                    if (el)
                        return [lohnarten[0].slice(1, 8)[idx], el, row[0]].join(';');
                })
                    .filter(el => el)
                    .join('\r\n')
                    .concat('\r\n' + [797, µ.minus.fl(`${isNaN(row[9]) ? row[8] : row[9]}`, `${row.slice(1, 6).reduce((acc, val) => µ.plus.fl(`${acc}`, `${val}`), isNaN(row[9]) ? 0 : row[10])}`), row[0]].join(';'));
            }).slice(1);
            const csv = lohn.join('\r\n').replace(/ /g, '').replace(/\./g, ',').replace(/\r\n\r\n/g, '\r\n');
            filedownload(csv, 'Stundenkonten.txt');
        });
    });
}
//# sourceMappingURL=index.js.map