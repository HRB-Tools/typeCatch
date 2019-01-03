export const intmath = {
  toInt: function(decimal: any) {
    let decimalNumber: string = decimal + '' // Since type assertions in function signature don't work :/
    let US: boolean = decimalNumber.indexOf('.') > decimalNumber.indexOf(',');
    let int: number = US ? decimalNumber.indexOf('.') > 0 ? parseInt(decimalNumber.split('.')[0]) : parseInt(decimalNumber) : decimalNumber.indexOf(',') > 0 ? parseInt(decimalNumber.split(',')[0]) : parseInt(decimalNumber);
    let frac =
      US ? decimalNumber.indexOf('.') > 0 ? decimalNumber.split('.')[1] : '' : decimalNumber.indexOf(',') > 0 ? decimalNumber.split(',')[1] : '';
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
    fl(val: string, significant: number) {
      if (intmath.toInt(val).r > significant) {
        let integer = intmath.toInt(val).i
        if (integer % 10 > 4) {
          integer += 10 // Aufrunden = Abrunden + 1 Differenz in der naechsten Stelle
        }
        integer -= (integer % 10)
        return integer / Math.pow(10, intmath.toInt(val).r)
      }
      else return parseFloat(val)
    }
  },
  
  roundDown: {
    fl(val: string, significant: number) {
      if (intmath.toInt(val).r > significant) {
        let integer = intmath.toInt(val).i
        integer -= (integer % 10)
        return integer / Math.pow(10, intmath.toInt(val).r)
      }
      else return parseFloat(val)
    }
  },

  plus: {
    int(val1: string, val2: string) {
      return (val1, val2) => {
        return (
          intmath.toInt(val1).i * Math.pow(10, intmath.toInt(val2).r) +
          intmath.toInt(val2).i * Math.pow(10, intmath.toInt(val1).r)
        );
      };
    },
    r(val1: string, val2: string) {
      return (val1, val2) => {
        return intmath.toInt(val1).r + intmath.toInt(val2).r;
      };
    },
    fl(val1: string, val2: string) {
      let s1 = intmath.toInt(val1).s,
        s2 = intmath.toInt(val2).s;
      let s12: number = 2 * s1 + s2; // [ 00, 01, 10, 11 ]
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
    int(val1: string, val2: string) {
      return (val1, val2) => {
        return (
          intmath.toInt(val1).i * Math.pow(10, intmath.toInt(val2).r) -
          intmath.toInt(val2).i * Math.pow(10, intmath.toInt(val1).r)
        );
      };
    },
    r(val1: string, val2: string) {
      return (val1, val2) => {
        return intmath.toInt(val1).r + intmath.toInt(val2).r;
      };
    },
    fl(val1: string, val2: string) {
      let s1 = intmath.toInt(val1).s,
        s2 = intmath.toInt(val2).s;
      let s12: number = 2 * s1 + s2; // [ 00, 01, 10, 11 ]
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
    int(val1: string, val2: string) {
      return (val1, val2) => {
        return (
          Math.abs(intmath.toInt(val1).i) / Math.abs(intmath.toInt(val2).i)
        );
      };
    },
    r(val1: string, val2: string) {
      return (val1, val2) => {
        return intmath.toInt(val1).r - intmath.toInt(val2).r;
      };
    },
    fl(val1: string, val2: string) {
      let s1 = intmath.toInt(val1).s,
        s2 = intmath.toInt(val2).s;
      let sign = (s1 + s2) % 2 == 0 ? false : true;
      let integer = this.int()(val1, val2);
      let radix = this.r()(val1, val2);
      if (sign === false) {
        return integer / Math.pow(10, radix);
      } else return (integer / Math.pow(10, radix)) * -1;
    }
  },

  mul: {
    int(val1: string, val2: string) {
      return (val1, val2) => {
        return (
          Math.abs(intmath.toInt(val1).i) * Math.abs(intmath.toInt(val2).i)
        );
      };
    },
    r(val1: string, val2: string) {
      return (val1, val2) => {
        return intmath.toInt(val1).r + intmath.toInt(val2).r;
      };
    },
    fl(val1: string, val2: string) {
      let s1 = intmath.toInt(val1).s,
        s2 = intmath.toInt(val2).s;
      let sign = (s1 + s2) % 2 == 0 ? false : true;
      let integer = this.int()(val1, val2);
      let radix = this.r()(val1, val2);
      if (sign === false) {
        return integer / Math.pow(10, radix);
      } else return (integer / Math.pow(10, radix)) * -1;
    }
  }
};