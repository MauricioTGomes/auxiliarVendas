
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
}

class FormaPagamentoSchema {
    static schema = {
        name: 'FormaPagamento',
        primaryKey: 'id',
        properties: {
            id: { type: 'int', indexed: true },
            id_numerama: 'int?' ,
            nome: 'string',
            tipo: 'string',
        },
    };
}

class ParcelaSchema {
    static schema = {
        name: 'Parcela',
        properties: {
            nro_parcela: 'int',
            data_vencimento: 'date',
            valor_original: 'double',
        },
    };
}

class PagamentoSchema {
    static schema = {
        name: 'Pagamento',
        properties: {
            forma_pagamento: {type: 'FormaPagamento?'},
            parcelas:  {type: 'list', objectType: 'Parcela'},
            vlr_total: 'double',
            qtd_dias: 'int?'
        },
    };
}

class ItemSchema {
    static schema = {
        name: 'Item',
        properties: {
            produto: {type: 'Produto'},
            quantidade: 'double',
            vlr_unitario: 'double',
            vlr_desconto: 'double?',
            vlr_total: 'double',
        },
    };
}

class PedidoSchema {
    static schema = {
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
        },
    };
}

export {CidadeSchema, PessoaSchema, ProdutoSchema, FormaPagamentoSchema, ParcelaSchema, PagamentoSchema, ItemSchema, PedidoSchema}