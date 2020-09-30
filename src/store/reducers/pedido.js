import {formatMoney} from '../../components/Functions'
import {
    ADD_ITEM,
    REMOVER_ITEM,
    ADD_PESSOA,
    DADOS_FATURAMENTO,
    ADD_FORMA,
    REMOVER_FORMA,
    LIMPA_FORM
} from '../actions/pedido'

let newState = {
    itens: [],
    pessoa: {},
    itens: [],
    descontoAplicadoProduto: false,
    faturamento: {
        vlr_bruto_formatado: '0,00',
        vlr_bruto: '',
        vlr_desconto: '',
        vlr_liquido: '',
    },
    formasPagamento: []
}

export default function(state = newState, action) {
    switch(action.type) {
        case ADD_FORMA:
            state.formasPagamento.push(action.payload)
            return state
        case REMOVER_FORMA:
            let formasPagamento = state.formasPagamento
            formasPagamento.splice(action.payload, 1)

            return {
                ...state,
                formasPagamento
            }
        case ADD_ITEM:
            state.itens.push(action.payload)
            return state
        case REMOVER_ITEM:
            let itens = state.itens 
            itens.splice(action.payload, 1)

            return {
                ...state,
                itens
            }
        case ADD_PESSOA:
            state.pessoa = action.payload
            return state
        case DADOS_FATURAMENTO:
            state.faturamento.vlr_bruto_formatado = formatMoney(action.payload.valorTotal)
            state.faturamento.vlr_bruto = action.payload.valorTotal
            state.descontoAplicadoProduto = action.payload.descontoAplicado
            return state
        case LIMPA_FORM:
            return state = {
                itens: [],
                pessoa: {},
                itens: [],
                descontoAplicadoProduto: false,
                faturamento: {
                    vlr_bruto_formatado: '0,00',
                    vlr_bruto: '',
                    vlr_desconto: '',
                    vlr_liquido: '',
                },
                formasPagamento: []
            }
        default:
            return state
    }
}