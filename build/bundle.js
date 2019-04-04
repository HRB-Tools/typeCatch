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
            let headers = ['Mitarbeiter Nr.', 'Arbeit', 'Ersatz', 'Stdkto.', 'U', 'F', 'B', 'K', '10', 'Nacht1', 'Nacht2', 'Nacht3', 'Sonnt.', 'Feier.', 'Überstd.', 'Leer'];
            console.log(arr, headers);
            let lohnarten = createLohnarten(arr);
            // lohnarten.forEach(row => {
            //   row[6] = µ.round.fl('' + µ.div.fl(zero(row[5]), '2'), 2)
            //   row[7] = µ.roundDown.fl('' + µ.div.fl(zero(row[5]), '2'), 2)
            //   row[10] = µ.plus.fl('0', zero(arr[i - 1][2]))
            //   row.forEach(item => {
            //     if (typeof (item) == 'string') {
            //       item = µ.plus.fl('0', zero(item))
            //     }
            //   })
            // })
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
