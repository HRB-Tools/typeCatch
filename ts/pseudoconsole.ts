export const plog = function (expr) {
  let tbox = document.createElement('div');
  tbox.setAttribute("style", "margin: 100px 100px 100px 900px; width: 38%; height: 76%; background-color: white");
  let eString = `${expr}`;
  tbox.innerHTML = eString;
  document.body.appendChild(tbox);
};

export const htmlog = function (arr) {
  let div = document.createElement('div');
  div.setAttribute("style", "margin: 100px 100px 100px 900px; width: 38%; height: 76%; background-color: white");
  let html = bubbledown(arr);
  div.innerHTML = html;
  document.body.appendChild(div);
};

export const arrlog = function (arr, headers = []) {
  let div = document.createElement('div');
  div.setAttribute('style', 'width: 60%; margin: 100px, 100px, 100px, 900px;');
  let html: string = '<table>';
  if (headers.length > 0) {
    html += '<tr>';
    for (let k = 0; k < headers.length; k++) {
      html += '<th>' + headers[k] + '</th>';
    }
    html += '</tr>';
  }
  if (arr[0][0].isArray) {
    plog('>2');
    return undefined;
  } // no more than 2 layers
  for (let i = 0; i < arr.length; i++) {
    html += '<tr>';
    for (let j = 0; j < arr[i].length; j++) {
      html += '<td>' + arr[i][j] + '</td>';
    }
    html += '</tr>';
  }
  html += '</table>';
  div.innerHTML = html;
  document.body.appendChild(div);
};


function bubbledown(parent) {
  if (!parent[0].isArray) {
    let lastParent = '';
    for (let i = 0; i < parent.length; i++) {
      lastParent += '<li>' + parent[i] + '</li>';
    }
    return lastParent;
  } else {
    let html: string = '';
    for (let i = 0; i < parent.length; i++) {
      html += '<ul>' + bubbledown(parent[i]) + '</ul>';
    }
    return html;
  }
}
