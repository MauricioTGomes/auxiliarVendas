export const ADD_ITEM = 'ADD_ITEM'
export const ADD_PESSOA = 'ADD_PESSOA'
export const REMOVER_ITEM = 'REMOVER_ITEM'
export const DADOS_FATURAMENTO = 'DADOS_FATURAMENTO'
export const ADD_FORMA = 'ADD_FORMA'
export const REMOVER_FORMA = 'REMOVER_FORMA'
export const LIMPA_FORM = 'LIMPA_FORM'

export function limparForm() {
    return {
        type: LIMPA_FORM
    }
}

export function addForma(forma) {
    return {
        type: ADD_FORMA,
        payload: forma
    }
}

export function removeForma(index) {
    return {
        type: REMOVER_FORMA,
        payload: index
    }
}

export function addItem(item) {
    return {
        type: ADD_ITEM,
        payload: item
    }
}

export function removeItem(index) {
    return {
        type: REMOVER_ITEM,
        payload: index
    }
}

export function addPessoa(pessoa) {
    return {
        type: ADD_PESSOA,
        payload: pessoa
    }
}

export function controlaDadosFaturamento(dados) {
    return {
        type: DADOS_FATURAMENTO,
        payload: dados
    }
}