(function () {
    'use strict';

    // Creates a File Input element, activates it and returns the result if nonempty
    const fileresult = function () {
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

    const clicktouch = (querySelector, bindFunction) => {
        const _querySelector = querySelector;
        const _function = bindFunction;
        document.querySelector(_querySelector).addEventListener('mousedown', function () {
            _function();
        });
        document.querySelector(_querySelector).addEventListener('touchstart', function () {
            _function();
        });
    };

    const createLohnarten = (array) => [[]].concat(array.map(row => [parseInt(row[0]), row[9] || 0, row[11] || 0, row[12] || 0, row[13] || 0, row[10] || 0, , , row[1] || 0, , row[2] || 0]));

    const intmath = {
        toInt: function (decimal) {
            let decimalNumber = decimal + ''; // Since type assertions in function signature don't work :/
            let US = decimalNumber.indexOf('.') > decimalNumber.indexOf(',');
            let int = US ? decimalNumber.indexOf('.') > 0 ? parseInt(decimalNumber.split('.')[0]) : parseInt(decimalNumber) : decimalNumber.indexOf(',') > 0 ? parseInt(decimalNumber.split(',')[0]) : parseInt(decimalNumber);
            let frac = US ? decimalNumber.indexOf('.') > 0 ? decimalNumber.split('.')[1] : '' : decimalNumber.indexOf(',') > 0 ? decimalNumber.split(',')[1] : '';
            let radixPoint = frac.length;
            let bigInt = int * Math.pow(10, radixPoint);
            let sign = decimalNumber.indexOf("-") == 0 ? 1 : 0;
            return {
                i: bigInt +
                    (sign == 0 ?
                        frac.length > 0 ?
                            parseInt(frac) :
                            0 :
                        frac.length > 0 ?
                            -1 * parseInt(frac) :
                            0),
                r: radixPoint,
                s: sign
            };
        },
        round: {
            fl(val, significant) {
                if (intmath.toInt(val).r > significant) {
                    let integer = intmath.toInt(val).i;
                    if (integer % 10 > 4) {
                        integer += 10; // Aufrunden = Abrunden + 1 Differenz in der naechsten Stelle
                    }
                    integer -= (integer % 10);
                    return integer / Math.pow(10, intmath.toInt(val).r);
                }
                else
                    return parseFloat(val);
            }
        },
        roundDown: {
            fl(val, significant) {
                if (intmath.toInt(val).r > significant) {
                    let integer = intmath.toInt(val).i;
                    integer -= (integer % 10);
                    return integer / Math.pow(10, intmath.toInt(val).r);
                }
                else
                    return parseFloat(val);
            }
        },
        plus: {
            int(val1, val2) {
                return (val1, val2) => {
                    return (intmath.toInt(val1).i * Math.pow(10, intmath.toInt(val2).r) +
                        intmath.toInt(val2).i * Math.pow(10, intmath.toInt(val1).r));
                };
            },
            r(val1, val2) {
                return (val1, val2) => {
                    return intmath.toInt(val1).r + intmath.toInt(val2).r;
                };
            },
            fl(val1, val2) {
                let s1 = intmath.toInt(val1).s, s2 = intmath.toInt(val2).s;
                let s12 = 2 * s1 + s2; // [ 00, 01, 10, 11 ]
                let integer = this.int()(val1, val2);
                let radix = this.r()(val1, val2);
                switch (s12) {
                    case 0:
                        return integer / Math.pow(10, radix); // a + b = a + b
                    case 1:
                        return intmath.minus.fl(val1, val2.slice(1)); // a + (-b) = a - b
                    case 2:
                        return intmath.minus.fl(val2, val1.slice(1)); // -a + b = b - a
                    case 3:
                        return intmath.plus.fl(val1.slice(1), val2.slice(1)) * -1; // -a + (-b) = - (a+b)
                }
            }
        },
        minus: {
            int(val1, val2) {
                return (val1, val2) => {
                    return (intmath.toInt(val1).i * Math.pow(10, intmath.toInt(val2).r) -
                        intmath.toInt(val2).i * Math.pow(10, intmath.toInt(val1).r));
                };
            },
            r(val1, val2) {
                return (val1, val2) => {
                    return intmath.toInt(val1).r + intmath.toInt(val2).r;
                };
            },
            fl(val1, val2) {
                let s1 = intmath.toInt(val1).s, s2 = intmath.toInt(val2).s;
                let s12 = 2 * s1 + s2; // [ 00, 01, 10, 11 ]
                let integer = this.int()(val1, val2);
                let radix = this.r()(val1, val2);
                switch (s12) {
                    case 0:
                        return integer / Math.pow(10, radix); // a - b = a - b
                    case 1:
                        return intmath.plus.fl(val1, val2.slice(1)); // a - (-b) = a + b
                    case 2:
                        return intmath.plus.fl(val2, val1.slice(1)) * -1; // -a - b = - ( a + b )
                    case 3:
                        return intmath.minus.fl(val2.slice(1), val1.slice(1)); // Aufruf ohne Vorzeichen -a - (-b) = b - a
                }
            }
        },
        div: {
            int(val1, val2) {
                return (val1, val2) => {
                    return (Math.abs(intmath.toInt(val1).i) / Math.abs(intmath.toInt(val2).i));
                };
            },
            r(val1, val2) {
                return (val1, val2) => {
                    return intmath.toInt(val1).r - intmath.toInt(val2).r;
                };
            },
            fl(val1, val2) {
                let s1 = intmath.toInt(val1).s, s2 = intmath.toInt(val2).s;
                let sign = (s1 + s2) % 2 == 0 ? false : true;
                let integer = this.int()(val1, val2);
                let radix = this.r()(val1, val2);
                if (sign === false) {
                    return integer / Math.pow(10, radix);
                }
                else
                    return (integer / Math.pow(10, radix)) * -1;
            }
        },
        mul: {
            int(val1, val2) {
                return (val1, val2) => {
                    return (Math.abs(intmath.toInt(val1).i) * Math.abs(intmath.toInt(val2).i));
                };
            },
            r(val1, val2) {
                return (val1, val2) => {
                    return intmath.toInt(val1).r + intmath.toInt(val2).r;
                };
            },
            fl(val1, val2) {
                let s1 = intmath.toInt(val1).s, s2 = intmath.toInt(val2).s;
                let sign = (s1 + s2) % 2 == 0 ? false : true;
                let integer = this.int()(val1, val2);
                let radix = this.r()(val1, val2);
                if (sign === false) {
                    return integer / Math.pow(10, radix);
                }
                else
                    return (integer / Math.pow(10, radix)) * -1;
            }
        }
    };

    const filedownload = function (arr, filename) {
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

    var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    document.onreadystatechange = function () {
        if (document.readyState == 'complete') {
            init();
        }
    };
    const wederJahrNochVorjahr = int => ((int != (new Date()).getFullYear()) &&
        (int != (new Date()).getFullYear() - 2000) &&
        (int != (new Date()).getFullYear() - 2001)), getInputs = () => Array.from(document.querySelectorAll('#azubis input, #rentner input')), rentnerUndAzubis = () => getInputs().filter(el => el.value).map(el => parseInt(el.value)), enterAndNext = el => evt => {
        if (evt.keyCode === 13 || evt.which === 13 || evt.keycode === 13) {
            evt.preventDefault();
            const newInput = el.cloneNode(false);
            newInput.value = '';
            newInput.addEventListener('keypress', evt => enterAndNext(newInput)(evt));
            el.parentElement.appendChild(newInput);
            newInput.focus();
        }
    }, stundenkontoOderKeins = /(?:^[0-9]{1,}(?:,[0-9]+)?$)|(?:^kein$)/, zero = str => isNaN(parseInt(str)) ? 0 : str, floatify = value => intmath.plus.fl('0', zero(value)), splitUp885 = row => ([
        ...row.slice(0, 6), intmath.round.fl('' + intmath.div.fl(zero(row[5]), '2'), 2), intmath.roundDown.fl('' + intmath.div.fl(zero(row[5]), '2'), 2), ...row.slice(8)
    ]), getStundenkonto = row => stundenkonten => intmath.plus.fl(stundenkonten[row[0]], '0'), nurStundenkonten = (row) => (row
        .filter(word => stundenkontoOderKeins.test(word))
        .filter(word => wederJahrNochVorjahr(parseInt(word)))), arbeitOderStunden = row => isNaN(row[9]) ? row[8] : row[9], ersatz = row => isNaN(row[9]) ? 0 : row[10], LA801_885 = row => initialValue => row.slice(1, 6).reduce((acc, val) => intmath.plus.fl(`${acc}`, `${val}`), initialValue), LA797 = row => ([
        797,
        intmath.minus.fl(`${arbeitOderStunden(row)}`, `${LA801_885(row)(ersatz(row))}`),
        row[0]
    ]);
    function init() {
        clicktouch('#csv', load);
        getInputs().forEach(el => el.addEventListener('keypress', evt => enterAndNext(el)(evt)));
    }
    function writeStundendatei(stundendatei, targetObj) {
        for (let i = 0, len = stundendatei.length; i < len; i += 4) { // 5 Zeilen pro Eintrag
            targetObj[stundendatei[i]] = stundendatei[i + 3];
        }
    }
    function writeStundenkonten(source, target) {
        for (const [idx, row] of target.entries()) {
            idx && (row[9] = getStundenkonto(row)(source)); // skip first
        }
    }
    function load() {
        return __awaiter(this, void 0, void 0, function* () {
            let lohndatei = yield fileresult();
            const stundendatei = yield fileresult();
            lohndatei = String(lohndatei).split('\n').map(row => row.split('!') || []);
            const titles = ['Mitarbeiter Nr.', '801', '803', '805', '820', '885', '886', '887', 'Arbeitsstunden', 'Stundenkonto', 'Ersatz'];
            const lohnarten = [titles].concat(createLohnarten(lohndatei)
                .map(row => row.map(cell => floatify(cell)))
                .map(row => splitUp885(row))
                .slice(1)
                .filter(row => !(rentnerUndAzubis().includes(row[0]))));
            const obj = {};
            writeStundendatei(nurStundenkonten(String(stundendatei).split(/\s/)), obj);
            writeStundenkonten(obj, lohnarten);
            const csv = lohnarten.map(row => {
                return row.slice(1, 8)
                    .map((value, idx) => {
                    if (value)
                        return [lohnarten[0].slice(1, 8)[idx], value, row[0]].join(';');
                })
                    .filter(el => el)
                    .join('\r\n')
                    .concat('\r\n' + LA797(row).join(';'));
            }).slice(1).join('\r\n').replace(/ /g, '').replace(/\./g, ',').replace(/\r\n\r\n/g, '\r\n');
            filedownload(csv, 'Stundenkonten.txt');
        });
    }

}());
