class Produto {}
  
Produto.schema = {
    name: 'Produto',
    primaryKey: 'id',
    properties: {
        id: { type: 'int', indexed: true },
        id_numerama: 'int?' ,
        nome: 'string',
        qtd_estoque: 'double?',
        vlr_venda: 'double?',
    },
};

export default Produto