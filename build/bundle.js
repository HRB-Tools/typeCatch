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
                .map(row => row.map(cell => intmath.plus.fl('0', zero(cell))))
                .map(row => [...row.slice(0, 6), intmath.round.fl('' + intmath.div.fl(zero(row[5]), '2'), 2), intmath.roundDown.fl('' + intmath.div.fl(zero(row[5]), '2'), 2), ...row.slice(8)])
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
                    idx && (row[9] = intmath.plus.fl(obj[row[0]], '0')); // skip first
                }
                const lohn = lohnarten.map((row, idx) => {
                    return row.slice(1, 8)
                        .map((el, idx) => {
                        if (el)
                            return [lohnarten[0].slice(1, 8)[idx], el, row[0]].join(';');
                    })
                        .filter(el => el)
                        .join('\r\n')
                        .concat('\r\n' + [797, intmath.minus.fl(`${isNaN(row[9]) ? row[8] : row[9]}`, `${row.slice(1, 6).reduce((acc, val) => intmath.plus.fl(`${acc}`, `${val}`), isNaN(row[9]) ? 0 : row[10])}`), row[0]].join(';'));
                }).slice(1);
                const csv = lohn.join('\r\n').replace(/ /g, '').replace(/\./g, ',').replace(/\r\n\r\n/g, '\r\n');
                filedownload(csv, 'Stundenkonten.txt');
            });
        });
    }

}());
