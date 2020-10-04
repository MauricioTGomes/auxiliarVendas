class Pagamento {}
  
Pagamento.schema = {
    name: 'Pagamento',
    properties: {
        forma_pagamento: {type: 'FormaPagamento?'},
        parcelas:  {type: 'list', objectType: 'Parcela'},
        vlr_total: 'double',
        qtd_dias: 'int?'
    },
};

export default Pagamento