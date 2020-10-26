class Pedido {}
  
Pedido.schema = {
    name: 'Pedido',
    primaryKey: 'id',
    properties: {
        id: { type: 'int', indexed: true },
        id_numerama: 'int?',
        itens: {type: 'Item[]'},
        pagamentos: {type: 'Pagamento[]'},
        pessoa: {type: 'Pessoa'},
        numero: 'int?',
        vlr_liquido: 'double',
        vlr_bruto: 'double',
        vlr_desconto: 'double?',
        estornado: {type: 'int?', default: 0},
        data_criacao: 'date?',
        estornado: 'int?'
    },
};

export default Pedido