class Item {}
  
Item.schema = {
    name: 'Item',
    properties: {
        produto: {type: 'Produto'},
        quantidade: 'double',
        vlr_unitario: 'double',
        vlr_desconto: 'double?',
        vlr_total: 'double',
    },
};

export default Item