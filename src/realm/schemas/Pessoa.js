class Pessoa {
    get nomeFantasia() {
        return this.tipo == 1 ? this.nome : this.fantasia;
    }

    get cpfCnpj() {
        return this.tipo == 1 ? this.cpf : this.cnpj
    }
}
  
Pessoa.schema = {
    name: 'Pessoa',
    primaryKey: 'id',
    properties: {
        id: { type: 'int', indexed: true },
        id_numerama: 'int?',
        cidade: {type: 'Cidade?'},
        nome: 'string?',
        cpf: 'string?',
        cnpj: 'string?',
        razao_social: 'string?',
        fantasia: 'string?',
        complemento: 'string?',
        bairro: 'string?',
        cep: 'string?',
        endereco: 'string?',
        endereco_nro: 'string?',
        limite_credito: 'double?',
        tipo: 'int',
        data_criacao: 'date?',
    },
};

export default Pessoa