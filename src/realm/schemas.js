class CidadeSchema {
    static schema = {
        name: 'Cidade',
        primaryKey: 'id',
        properties: {
            id: { type: 'int', indexed: true },
            nome: 'string',
            uf: 'string',
            codigo_ibge: 'int',
        },
    };
}

class ProdutoSchema {
    static schema = {
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
}

class PessoaSchema {
    static schema = {
        name: 'Pessoa',
        primaryKey: 'id',
        properties: {
            id: { type: 'int', indexed: true },
            id_numerama: 'int?' ,
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
            endereco_nro: 'int?',
            limite_credito: 'double?',
            tipo: 'int',
            created_at: 'date?',
            updated_at: 'date?'
        },
    };
}


export {CidadeSchema, PessoaSchema, ProdutoSchema}