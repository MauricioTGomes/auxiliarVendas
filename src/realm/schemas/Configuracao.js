class Configuracao {
    get nomeEstado() {
        return this.nome + ' - ' + this.uf;
    }
}
  
Configuracao.schema = {
    name: 'Configuracao',
    primaryKey: 'id',
    properties: {
        id: { type: 'int', indexed: true },
        ultima_sincronizacao_produto: 'string?',
        ultima_sincronizacao_pessoa: 'string?',
        ultima_sincronizacao_pedido: 'string?',
    },
};

export default Configuracao