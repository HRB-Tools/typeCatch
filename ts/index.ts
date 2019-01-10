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
    arrlog(arr, headers)
    let lohnarten: any[][] = createLohnarten(arr)
    lohnarten[0] = ['Mitarbeiter Nr.', '801', '803', '805', '820', '885', '886', '887', '797', 'Summe']
    let sum
    for (let i = 1; i < lohnarten.length; i++) {
      sum = µ.plus.fl(µ.plus.fl(µ.plus.fl(lohnarten[i][5], lohnarten[i][1]), µ.plus.fl(lohnarten[i][2], lohnarten[i][3])), lohnarten[i][4])
      lohnarten[i][6] = µ.round.fl('' + µ.div.fl(lohnarten[i][5], '2'), 2)
      lohnarten[i][7] = µ.roundDown.fl('' + µ.div.fl(lohnarten[i][5], '2'), 2)
      lohnarten[i][9] = sum
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
        arr = txt.split('\n')
      }
      let stundenkonten: any[] = new Array(arr.length)
      for (let i = 0; i < arr.length; i++) {
        let split = arr[i].split(';')
        stundenkonten[i] = split
      }
      let indices = stundenkonten.map(el => el.slice(0, -1).toString())
      let lohnarten = args[1]
      let csv: string = ''
      for (let j = 1; j < lohnarten.length; j++) {
        // Falls Stundenkonto -> Geleistete Std - Stundenvorgabe, ansonsten geleistete Stunden
        let id: number = indices.indexOf('' + lohnarten[j][0])
        csv += lohnarten[j][0] + ';' + ( (id < 0) ? lohnarten[j][8] : µ.minus.fl('' + lohnarten[j][8], '' + stundenkonten[id][1]) ) + ';797\r\n'
        for (let k = 1; k < lohnarten[j].length - 2; k++) {
          csv += lohnarten[j][0] + ';' + lohnarten[j][k] + ';' + lohnarten[0][k] + '\r\n'
        }
      }
      csv = csv.replace(/\./g, ',')
      filedownload(csv, 'Stundenkonten.txt')
    })
  });
}