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

    const createLohnarten = (array) => {
        // let arr = []
        // arr[0] = []
        // for ( let i = 0; i < array.length; i++ ){
        //   let k = array[i]
        //     arr.push([parseInt(k[0]), isNaN(parseInt(k[9])) ? 0 : k[9], isNaN(parseInt(k[11])) ? 0 : k[11], isNaN(parseInt(k[12])) ? 0 : k[12], isNaN(parseInt(k[13])) ? 0 : k[13], isNaN(parseInt(k[10])) ? 0 : k[10], , , isNaN(parseInt(k[1])) ? 0 : k[1]])
        // }
        return [[]].concat(array.map(row => [parseInt(row[0]), row[9] || 0, row[11] || 0, row[12] || 0, row[13] || 0, row[10] || 0, , , row[1] || 0]));
    };

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
                row[6] = intmath.round.fl('' + intmath.div.fl(zero(row[5]), '2'), 2);
                row[7] = intmath.roundDown.fl('' + intmath.div.fl(zero(row[5]), '2'), 2);
                row[10] = arr[i] ? intmath.plus.fl('0', zero(arr[i][2])) : 0;
                row.forEach(item => {
                    if (typeof (item) == 'string') {
                        row[i] = intmath.plus.fl('0', zero(item));
                    }
                });
            });
            lohnarten[0] = ['Mitarbeiter Nr.', '801', '803', '805', '820', '885', '886', '887', 'Arbeitsstunden', 'Stundenkonto', 'Ersatz'];
            console.log(lohnarten);
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
                // csv = csv.replace(/\./g, ',')
                // filedownload(csv, 'Stundenkonten.txt')
            });
        });
    }

}());
