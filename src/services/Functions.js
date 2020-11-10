import { serve } from '../common'
import getRealm from '../realm/realm'

import axios from 'axios'
import NetInfo from "@react-native-community/netinfo";
import moment from 'moment'
import 'moment/locale/pt-br'

const iniciaSincronismo = async () => {
    let netInfo = null
    await NetInfo.fetch().then(state => { netInfo = state });
    
    if (netInfo && netInfo.isConnected) {
        await baixarProdutos()
        await baixarPessoas()
        await baixarPedidos()
        return true
    } else {
        return false
    }
}

/** INICIO CONTROLA PRODUTO */
let lastIdProduto = 0
const baixarProdutos = async () => {
    let realm = await (getRealm())
    let configuracao = realm.objects('Configuracao')[0]
    
    let dataComecou = moment().locale('pt-br').format('YYYY-MM-DD H:mm:ss')
    let data = configuracao.ultima_sincronizacao_produto ? configuracao.ultima_sincronizacao_produto : null
        
    try {
        realm.beginTransaction()
        let url = data != null ? `/${data}` : ''
        await axios.get(`${serve}api/appHibrido/getProdutos${url}`).then(async response => {
            let produtos = response.data.produtos
    
            if (produtos.length > 0) {
                await produtos.forEach(produto => {
                    gravaProduto(produto, realm)
                })
            }
    
            configuracao.ultima_sincronizacao_produto = dataComecou
        })
        realm.commitTransaction()
    }catch(e) {
        console.log("Produto" ,e)
        realm.cancelTransaction()
    }
    
    return false
};

const gravaProduto = (produto, realm) => {
    if (lastIdProduto <= 0) {
        const lastProduto = realm.objects('Produto').sorted('id', true)
        lastIdProduto = lastProduto.length > 0 ? lastProduto[0].id : 0
    }

    let produtoBanco = realm.objects('Produto').filtered(`id_numerama = ${produto.id}`)[0]
    if (produtoBanco == undefined) {              
        lastIdProduto += 1
    }

    return realm.create('Produto', {
        id: produtoBanco != undefined ? produtoBanco.id : lastIdProduto,
        id_numerama: produto.id,
        nome: produto.nome,
        qtd_estoque: parseFloat(produto.qtd_estoque),
        vlr_venda: parseFloat(produto.vlr_venda),
        ativo: parseInt(produto.ativo)
    }, 'modified')
}
/** FIM CONTROLA PRODUTO */

/** INICIO CONTROLA PESSOA */
const baixarPessoas = async () => {
    
    let realm = await (getRealm())
    let configuracao = realm.objects('Configuracao')[0]    

    let dataComecou = moment().locale('pt-br').format('YYYY-MM-DD H:mm:ss')
    let data = configuracao.ultima_sincronizacao_pessoa != undefined ? configuracao.ultima_sincronizacao_pessoa : null

    const lastPessoa = realm.objects('Pessoa').sorted('id', true)
    let lastIdPessoa = lastPessoa.length > 0 ? lastPessoa[0].id : 0     

    try {
        realm.beginTransaction()
        let url = data != null ? `/${data}` : ''
        await axios.get(`${serve}api/appHibrido/pessoa/buscar${url}`).then(async response => {
            let pessoas = response.data.pessoas

            if (pessoas.length > 0) {
                await pessoas.forEach(pessoa => {
                    let pessoaBanco = realm.objects('Pessoa').filtered(`id_numerama = ${pessoa.id}`)[0]
                    if (pessoaBanco == undefined) lastIdPessoa += 1
                    
                    let cidade = null
                    if (pessoa.cidade_id !== null) {
                        cidade = realm.objects('Cidade').filtered(`id == ${pessoa.cidade_id}`)[0]
                    }
                    
                    let pessoaCreate = {
                        ativo: parseInt(pessoa.ativo),
                        id: pessoaBanco != undefined ? pessoaBanco.id : lastIdPessoa,
                        id_numerama: pessoa.id,
                        cidade,
                        nome: pessoa.nome,
                        cpf: pessoa.cpf,
                        cnpj: pessoa.cnpj,
                        razao_social: pessoa.razao_social,
                        fantasia: pessoa.fantasia,
                        complemento: pessoa.complemento,
                        bairro: pessoa.bairro,
                        cep: pessoa.cep,
                        endereco: pessoa.endereco,
                        endereco_nro: pessoa.endereco_nro != undefined && pessoa.endereco_nro != null ? pessoa.endereco_nro.toString() : '',
                        limite_credito: parseFloat(pessoa.limite_credito),
                        tipo: parseInt(pessoa.tipo),
                        saldo_atrasado: parseFloat(pessoa.saldos.total_atrasado),
                        saldo_em_dia: parseFloat(pessoa.saldos.total_em_dia),
                        ie: pessoa.ie
                    }
    
                    realm.create('Pessoa', pessoaCreate, 'modified')
                })
            }
        })
        
        let pessoasLocal = realm.objects('Pessoa').filtered(`id_numerama == null OR data_alteracao != null`)
        if (pessoasLocal.length > 0) {
            await pessoasLocal.forEach(pessoaLocal => {
                if (pessoaLocal.id_numerama == null || (pessoaLocal.ultimaAlteracao && pessoaLocal.ultimaAlteracao >= data)) {
                    enviaPessoa(pessoaLocal, realm)
                }
            })
        }

        configuracao.ultima_sincronizacao_pessoa = dataComecou
        realm.commitTransaction()
    } catch (e) {
        console.log("Pessoa" ,e)
        realm.cancelTransaction()
    }

    return false
};

const enviaPessoa = async (pessoa, realm) => {
    let url = 'gravar'
    if (pessoa.id_numerama != null) {
        url = `update/${pessoa.id_numerama}`
    }

    await axios.post(`${serve}api/appHibrido/pessoa/${url}`, {
        ativo: pessoa.ativo,
        nome: pessoa.nome,
        email: pessoa.email,
        cpf: pessoa.cpf,
        cnpj: pessoa.cnpj,
        razao_social: pessoa.razao_social,
        fantasia: pessoa.fantasia,
        complemento: pessoa.complemento,
        bairro: pessoa.bairro,
        cep: pessoa.cep,
        endereco: pessoa.endereco,
        endereco_nro: pessoa.endereco_nro,
        tipo: pessoa.tipo,
        cidade_id: pessoa.cidade.id,
        created_at: pessoa.data_criacao,
        limite_credito: pessoa.limite_credito,
        ie: pessoa.ie,
        cadastro_externo: 1,
        cliente: 1
    }).then(resp => {
        if (resp.data.pessoa != undefined) {
            realm.write(() => {
                pessoa.id_numerama = resp.data.pessoa.id
                realm.create('Pessoa', pessoa, 'modified')
            })
        }
    })
}
/** FIM CONTROLA PESSOA */

/** INICIO CONTROLA PEDIDO */
const baixarPedidos = async () => {
    let realm = await (getRealm())
    let configuracao = realm.objects('Configuracao')[0]
    
    let dataComecou = moment().locale('pt-br').format('YYYY-MM-DD H:mm:ss')
    let data = configuracao.ultima_sincronizacao_pedido ? configuracao.ultima_sincronizacao_pedido : null

    try {
        realm.beginTransaction()
        let url = data != null ? `/${data}` : ''
        await axios.get(`${serve}api/appHibrido/pedido/buscar${url}`).then(async response => {
            let pedidos = response.data.pedidos
            
            if (pedidos.length > 0) {
                const lastPedido = realm.objects('Pedido').sorted('id', true)
                let lastId = lastPedido.length > 0 ? lastPedido[0].id : 0                
                
                await pedidos.forEach(pedido => {
                    lastId += 1
                    
                    let pessoa = null
                    if (pedido.pessoa_id != null) {
                        pessoa = realm.objects('Pessoa').filtered(`id_numerama = ${pedido.pessoa_id}`)[0]
                    }

                    let pagamentos = []
                    if (pedido.pagamentos.length > 0) {
                        pedido.pagamentos.forEach(pag => {
                            let formaPagamento = realm.objects('FormaPagamento').filtered(`id = ${pag.forma_pagamento.id}`)[0]
                            
                            if (formaPagamento == undefined) {
                                formaPagamento = realm.create("FormaPagamento", {
                                    id: pag.forma_pagamento_id,
                                    nome: pag.forma_pagamento.descricao,
                                    tipo: pag.forma_pagamento.tipo
                                })
                            }
                            
                            let pagamento = {
                                forma_pagamento: formaPagamento,
                                parcelas: [],
                                vlr_total: parseFloat(pag.valor_pago),
                                vlr_restante: parseFloat(pag.valor_pago),
                                qtd_dias: 0
                            }

                            if (pag.conta != null) {
                                pagamento.vlr_restante = parseFloat(pag.conta.vlr_restante)
                                pagamento.qtd_dias = parseInt(pag.conta.qtd_dias)

                                pag.conta.parcelas.forEach(parcela => {
                                    pagamento.parcelas.push({
                                        nro_parcela: parseInt(parcela.nro_parcela),
                                        data_vencimento: moment(parcela.data_vencimento + ' 00:00:00', "DD/MM/YYYY H:m:s").locale('pt-br').format('YYYY-MM-DD'),
                                        valor_original: parseFloat(parcela.valor),
                                    })
                                })
                            }

                            pagamentos.push(pagamento)
                        })
                    }
                    
                    let itens = []
                    if (pedido.itens.length > 0) {
                        pedido.itens.forEach(item => {
                            let produto = gravaProduto(item.produto, realm)
                            itens.push({
                                produto,
                                quantidade: parseFloat(item.quantidade),
                                vlr_unitario: parseFloat(item.vlr_unitario),
                                vlr_desconto: parseFloat(item.vlr_desconto),
                                vlr_total: parseFloat(item.vlr_total),
                            })
                        })
                    }

                    let pedidoCreate = {
                        id: lastId,
                        id_numerama: pedido.id,
                        pessoa,
                        itens,
                        pagamentos,
                        numero: pedido.numero,
                        vlr_liquido: pedido.vlr_liquido != null ? parseFloat(pedido.vlr_liquido) : 0.00,
                        vlr_bruto: pedido.vlr_bruto != null ? parseFloat(pedido.vlr_bruto) : 0.00,
                        vlr_desconto: pedido.vlr_desconto != null ? parseFloat(pedido.vlr_desconto) : 0.00,
                        estornado: parseInt(pedido.estornado),
                        data_criacao: moment(pedido.created_at, "DD/MM/YYYY H:m:s").locale('pt-br').format('YYYY-MM-DD')
                    }
    
                    realm.create('Pedido', pedidoCreate, 'modified')
                })
            }
        })

        let pedidosLocal = realm.objects('Pedido').filtered(`id_numerama == null`)
        
        if (pedidosLocal.length > 0) {
            await pedidosLocal.forEach(pedidoLocal => {
                if (pedidoLocal.id_numerama == null) {
                    enviaPedido(pedidoLocal, realm)
                }
            })
        }

        configuracao.ultima_sincronizacao_pedido = dataComecou
        realm.commitTransaction()
    } catch(e) {
        console.log("Pedido" , e)
        realm.cancelTransaction()
    }
    return false
};

const enviaPedido = async (pedido, realm) => {
    let pedidoCriar = {
        "qtdTotalSelecionados": pedido.itens.length,
        "itens_cadastrados": [],
        "tipo_documento": "PEDIDO",
        "pedido": {
            "nome": null,
            "cpf_cnpj": null,
            "pessoa_id": pedido.pessoa.id_numerama,
            "pessoa_id_propriedade_produtor": null,
            "formas_pagamento_aceitas": null,
            "local_entrega": null,
            "observacoes": null,
            "baixa_estoque": 1,
            "faturado": 1,
            "vlr_bruto": pedido.vlr_bruto,
            "vlr_acrescimo": "0",
            "vlr_desconto": pedido.vlr_desconto,
            "vlr_liquido": pedido.vlr_liquido
        },
        "valor_pago": pedido.vlr_liquido,
        "valor_restante": "0",
        "formas_pagamento": []
    }

    pedido.itens.forEach(itemFor => {
        pedidoCriar.itens_cadastrados.push({
            "produto_id": itemFor.produto.id_numerama,
            "quantidade": itemFor.quantidade,
            "comissao": 0,
            "vlr_desconto_rateado": 0,
            "vlr_acrescimo_rateado": 0,
            "item_id": null,
            "vlr_unitario": itemFor.vlr_unitario,
            "complemento_apelido_produto": null,
            "nome_grade": null,
            "vlr_desconto": itemFor.vlr_desconto,
            "vlr_total": itemFor.vlr_total,
            "tipo_estoque_id": 0,
            "garantia": 0,
            "vlr_custo": 0,
            "cod_barras": itemFor.produto.cod_barras,
            "apelido_produto": itemFor.produto.nome,
            "marcado": null,
        })
    })

    pedido.pagamentos.forEach(pag => {
        let pagamento = {
            "model": { "tipo": pag.forma_pagamento.tipo, "taxa_adicional": "0.00" },
            "forma_pagamento_id": pag.forma_pagamento.id,
            "valor_recebido_cliente": pag.vlr_total,
            "valor_pago": pag.vlr_total,
            "valor_total_parcelas": null,
            "valor_troco": 0,
            "primeira_cobranca": null,
            "qtd_parcelas": null,
            "qtd_dias": null,
            "array_parcela": [],
            "taxa_adicional": 0,
            "taxa_juros": 0,
            "multa_atraso": 0
        }
        
        if (pag.forma_pagamento.tipo != 'VISTA') {
            pagamento.valor_total_parcelas = pag.vlr_total
            pagamento.primeira_cobranca = moment(pag.parcelas[0].data_vencimento).locale('pt-br').format("DD/MM/YYYY")
            pagamento.qtd_parcelas = pag.parcelas.length
            pagamento.qtd_dias = pag.qtd_dias
            pagamento.conta_bancaria_id = 124
            pag.parcelas.forEach(parcelaFor => {
                pagamento.array_parcela.push({
                    "nro_parcela": parcelaFor.nro_parcela,
                    "nro_parcela_alteracao": null,
                    "data_vencimento": moment(parcelaFor.data_vencimento).locale('pt-br').format("DD/MM/YYYY"),
                    "valor": parcelaFor.valor_original,
                })
            })
        }
        
        pedidoCriar.formas_pagamento.push(pagamento)
    })
    
    await axios.post(`${serve}api/appHibrido/pedido/gravar`, pedidoCriar).then(async response => {
        realm.write(() => {
            pedido.id_numerama = response.data.pedido.id
            pedido.numero = response.data.pedido.numero
            realm.create('Pedido', pedido, 'modified')
        })
    }).catch(resp => console.log(resp.response))
}

export { 
    baixarProdutos, 
    baixarPessoas, 
    baixarPedidos,
    enviaPessoa,
    enviaPedido,
    iniciaSincronismo
}