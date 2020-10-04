class Parcela {}
  
Parcela.schema = {
    name: 'Parcela',
    properties: {
        nro_parcela: 'int',
        data_vencimento: 'date',
        valor_original: 'double',
    },
};

export default Parcela