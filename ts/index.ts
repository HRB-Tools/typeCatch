import {fileresult} from './fileio';
import {clicktouch} from './clicktouch';
import {createLohnarten} from './lohnarten';
import {intmath as µ} from './intmath';
import {filedownload} from './filedownload';

document.onreadystatechange = function () {
  if (document.readyState == 'complete') {
    init();
  }
};
const wederJahrNochVorjahr = int => (
    (int != (new Date()).getFullYear()) &&
    (int != (new Date()).getFullYear() - 2000) &&
    (int != (new Date()).getFullYear() - 2001)
  ),
  getInputs = (): HTMLInputElement[] => Array.from(document.querySelectorAll('#azubis input, #rentner input')),
  rentnerUndAzubis = () => getInputs().filter(el => el.value).map(el => parseInt(el.value)),
  enterAndNext = el => evt => {
  if (evt.keyCode === 13 || evt.which === 13 || evt.keycode === 13) {
    evt.preventDefault();
    const newInput = el.cloneNode(false);
    newInput.value = '';
    newInput.addEventListener('keypress', evt => enterAndNext(newInput)(evt));
    el.parentElement.appendChild(newInput);
    newInput.focus();
  }
  },
  stundenkontoOderKeins = /(?:^[0-9]{1,}(?:,[0-9]+)?$)|(?:^kein$)/,
  zero = str => isNaN(parseInt(str)) ? 0 : str,
  floatify = value => µ.plus.fl('0', zero(value)),
  splitUp885 = row => ([
    ...row.slice(0, 6), µ.round.fl('' + µ.div.fl(zero(row[5]), '2'), 2), µ.roundDown.fl('' + µ.div.fl(zero(row[5]), '2'), 2), ...row.slice(8)
  ]),
  getStundenkonto = row => stundenkonten => µ.plus.fl(stundenkonten[row[0]], '0'),
  nurStundenkonten = (row): (string | number)[] => (
    row
      .filter(word => stundenkontoOderKeins.test(word))
      .filter(word => wederJahrNochVorjahr(parseInt(word)))
  ),
  arbeitOderStunden = row => isNaN(row[9]) ? row[8] : row[9],
  ersatz = row => isNaN(row[9]) ? 0 : row[10],
  LA801_885 = row => initialValue => row.slice(1, 6).reduce((acc, val) => µ.plus.fl(`${acc}`, `${val}`), initialValue),
  LA797 = row => ([
    797,
    µ.minus.fl(`${arbeitOderStunden(row)}`, `${LA801_885(row)(ersatz(row))}`),
    row[0]
  ]);
function init() {
  clicktouch('#csv', load);
  getInputs().forEach(el => el.addEventListener('keypress', evt => enterAndNext(el)(evt)));
}

function writeStundendatei(stundendatei: any[], targetObj: Object) {
  for (let i = 0, len = stundendatei.length; i < len; i += 4) {   // 5 Zeilen pro Eintrag
    targetObj[stundendatei[i]] = stundendatei[i + 3];
  }
}

function writeStundenkonten(source, target) {
  for (const [idx, row] of target.entries()) {
    idx && (row[9] = getStundenkonto(row)(source)); // skip first
  }
}

async function load() {
  let lohndatei = await fileresult();
  const stundendatei = await fileresult();
  lohndatei = String(lohndatei).split('\n').map(row => row.split('!') || []);
  const titles: string[] = ['Mitarbeiter Nr.', '801', '803', '805', '820', '885', '886', '887', 'Arbeitsstunden', 'Stundenkonto', 'Ersatz'];
  const lohnarten: any[][] = [titles].concat(createLohnarten(lohndatei)
    .map(row => row.map(cell => floatify(cell)))
    .map(row => splitUp885(row))
    .slice(1)
    .filter(row => !(rentnerUndAzubis().includes(row[0]))));
  const obj = {};
  /** Schreibt die erfassten Stunden in ein Objekt mit dem Schlüssel als Index **/
  writeStundendatei(nurStundenkonten(String(stundendatei).split(/\s/)), obj);

  writeStundenkonten(obj, lohnarten);

  const csv: string = lohnarten.map(row => {
    return row.slice(1, 8)
      .map((value, idx) => {
        if (value) return [lohnarten[0].slice(1, 8)[idx], value, row[0]].join(';');
      })
      .filter(el => el)
      .join('\r\n')
      .concat('\r\n' + LA797(row).join(';'));
  }).slice(1).join('\r\n').replace(/ /g, '').replace(/\./g, ',').replace(/\r\n\r\n/g, '\r\n');
  filedownload(csv, 'Stundenkonten.txt');
}
