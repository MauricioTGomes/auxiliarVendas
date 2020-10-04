class FormaPagamento {}
  
FormaPagamento.schema = {
    name: 'FormaPagamento',
    primaryKey: 'id',
    properties: {
        id: { type: 'int', indexed: true },
        id_numerama: 'int?' ,
        nome: 'string',
        tipo: 'string',
    },
};

export default FormaPagamento