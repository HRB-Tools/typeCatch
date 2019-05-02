import {
  fileresult
} from './fileio';
import {
  clicktouch
} from './clicktouch';
import {
  createLohnarten
} from './lohnarten';
import {
  intmath as µ
} from './intmath';
import {
  filedownload
} from './filedownload';
import { 
  plog, htmlog, arrlog
} from './pseudoconsole';

document.onreadystatechange = function() {
  if (document.readyState == 'complete') {
    init();
  }
}

function init() {
  clicktouch('#csv', load);
}

function load() {
  const lohndatei = fileresult(), stundendatei = fileresult();
  lohndatei.then(function (csv) {
    if (typeof (csv) == 'string') {
      return csv.split('\n').map(row => row.split('!') || [])
    }
  }).then(function(arr) {
    const zero = str => isNaN(parseInt(str)) ? 0 : str,
        lohnarten: any[][] = [['Mitarbeiter Nr.', '801', '803', '805', '820', '885', '886', '887', 'Arbeitsstunden', 'Stundenkonto', 'Ersatz']]
            .concat(
                createLohnarten(arr)
                    .map(row => row.map(cell => µ.plus.fl('0', zero(cell))))
                    .map(row => [...row.slice(0, 6), µ.round.fl('' + µ.div.fl(zero(row[5]), '2'), 2), µ.roundDown.fl('' + µ.div.fl(zero(row[5]), '2'), 2), ...row.slice(8)])
                    .slice(1)
            )
    return lohnarten
  }).then(function (lohnarten) {
    stundendatei.then(function (txt) {
      const arr = String(txt).split('\r\n'),
          obj = {}
      // 5 Zeilen pro Eintrag
      for (let i = 0; i < arr.length; i += 5) {
        obj[arr[i]] = arr[i + 4]
      }
      for (const [idx, row] of lohnarten.entries()) {
        idx && (row[9] = µ.plus.fl(obj[row[0]], '0'))
      }
      console.table(lohnarten)
      const lohn: string[] = []
      lohnarten.forEach((row, idx) => {
        if (idx) {
          row.slice(1, 7).forEach((el, idx) => {
            lohn.push([lohnarten[0].slice(1, 7)[idx], el, row[0]].join(';'))
          })
          if (!isNaN(row[9])) {
            lohn.push([797, µ.minus.fl('' + row[9], '' + row.slice(1, 6).reduce((accumulator, currentValue) => µ.plus.fl('' + accumulator, '' + currentValue))), row[0]].join(';'))
          }
        }
      })
      const csv = lohn.join('\r\n').replace(/ /g, '').replace(/\./g, ',')
      console.table(csv)
      filedownload(csv, 'Stundenkonten.txt')
    })
  });
}