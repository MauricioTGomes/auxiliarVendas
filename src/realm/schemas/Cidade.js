class Cidade {
    get nomeEstado() {
        return this.nome + ' - ' + this.uf;
    }
}
  
Cidade.schema = {
    name: 'Cidade',
    primaryKey: 'id',
    properties: {
        id: { type: 'int', indexed: true },
        nome: 'string',
        uf: 'string',
        codigo_ibge: 'int',
    },
};

export default Cidade