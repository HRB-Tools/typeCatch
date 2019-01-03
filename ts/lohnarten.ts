export const createLohnarten = ( array ) => {
    let arr = []
    arr[0] = []
    for ( let i = 0; i < array.length; i++ ){
      let k = array[i]
      arr.push([parseInt(k[0]), isNaN(parseInt(k[9])) ? 0 : k[9], isNaN(parseInt(k[11])) ? 0 : k[11], isNaN(parseInt(k[12])) ? 0 : k[12], isNaN(parseInt(k[13])) ? 0 : k[13], isNaN(parseInt(k[10])) ? 0 : k[10],,, isNaN(parseInt(k[1])) ? 0 : k[1]]) 
    }
    return arr
}