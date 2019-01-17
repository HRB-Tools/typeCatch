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
  let file = fileresult();
  let file2 = fileresult();
  file.then(function(csv) {
    let text = csv
    let arr = []
    if (typeof(text) == 'string') {
      let rows = text.split('\n')
      for (let i = 0; i < rows.length; i++) {
        if (rows[i] !== undefined && rows[i].length > 0) {
          arr.push(rows[i].split('!'))
        }
      }
    }
    return arr;
  }).then(function(arr) {
    let headers : string[] = ['Mitarbeiter Nr.', 'Arbeit', 'Ersatz', 'Stdkto.', 'U', 'F', 'B', 'K', '10', 'Nacht1', 'Nacht2', 'Nacht3', 'Sonnt.', 'Feier.', 'Überstd.', 'Leer']
    console.log(arr, headers)
    let lohnarten: any[][] = createLohnarten(arr)
    lohnarten[0] = ['Mitarbeiter Nr.', '801', '803', '805', '820', '885', '886', '887', 'Arbeitsstunden', 'Stundenkonto', 'Ersatz']
    for (let i = 1; i < lohnarten.length; i++) {
      lohnarten[i][6] = µ.round.fl('' + µ.div.fl(lohnarten[i][5], '2'), 2)
      lohnarten[i][7] = µ.roundDown.fl('' + µ.div.fl(lohnarten[i][5], '2'), 2)
      lohnarten[i][10] = !isNaN(µ.plus.fl('0', arr[i-1][2])) ? µ.plus.fl('0', arr[i-1][2]) : 0
      for (let j = 0; j < lohnarten[i].length; j++) {
        if (typeof(lohnarten[i][j]) == 'string') {
          lohnarten[i][j] = µ.plus.fl('0', lohnarten[i][j]) // Konvertierung in Float
        }
      }
    }
    return [arr, lohnarten]
  }).then(function(args) {
    file2.then(function(txt) {
      let arr: any[]
      if (typeof(txt) == 'string') {
        arr = txt.split('\r\n')
      }
      let stdObject = new Object()
      for ( let i = 0; i < arr.length; i++ ){
        arr[i] = arr[i].split(';')
        stdObject[arr[i][0]] = arr[i].slice(1)
      }
      let lohnarten = args[1]
      for ( let j = 1; j < lohnarten.length; j++ ){
        for ( let k in stdObject ){
          if ( stdObject[k].includes(`${lohnarten[j][0]+''}`) ){
            lohnarten[j][9] = parseFloat(k)
          }
        }
      }
      console.log(lohnarten)
      // csv = csv.replace(/\./g, ',')
      // filedownload(csv, 'Stundenkonten.txt')
    })
  });
}