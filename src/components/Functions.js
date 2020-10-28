const formatMoney = (valor, c = 2, d = ',', t = '.') => {
    var n = valor,
        c = isNaN(c = Math.abs(c)) ? 2 : c,
        d = d == undefined ? "." : d,
        t = t == undefined ? "," : t,
        s = n < 0 ? "-" : "",
        i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
        j = (j = i.length) > 3 ? j % 3 : 0;
    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};

const formatForCalc = valor => {
    if (valor == undefined || valor == null || valor == '' || valor == '0,00' || typeof valor != 'string') {
        return 0
    }
    
    return parseFloat(valor.split('.').join("").replace(',', '.'))
}

export { formatMoney, formatForCalc }