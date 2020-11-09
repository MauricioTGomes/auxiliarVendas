import {Dimensions} from 'react-native'

export default {
    optionsInputMoney: {
        precision: 2,
        separator: ',',
        delimiter: '.',
        unit: '',
        suffixUnit: ''
    },
    optionsInputPositive: {
        precision: 0,
        separator: '',
        delimiter: '',
        unit: '',
        suffixUnit: ''
    },
    input: {
        marginTop: 15,
        marginBottom: 15,
        width: '100%',
    },
    containerForm: {
        flex: 1,
        margin: 15
    },
    buttons: {
        margin: 20,
        marginRight: 20,
        flexDirection: 'row',
        justifyContent: 'flex-end'
    },
    containerLinha: {
        flexDirection: 'row',
        marginBottom: 10
    },
    containerInput: {
        width: '47%'
    },
    espacoInputs: {
        width: '5%'
    },
    swipeable: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 5,
        justifyContent: 'flex-end',
        paddingHorizontal: 20
    },
    addButton: {
        position: 'absolute',
        right: 30,
        bottom: 50,
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'green'
    },
    filtrarButton: {
        position: 'absolute',
        right: 30,
        bottom: 105,
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'blue'
    },
    datatables: {
        faturamentoPrazo: {
            containerDatatable: {
                flex: 4
            },
            colunaUm: {
                flex: 1,
                justifyContent: 'flex-start'
            },
            colunaDois: {
                flex: 2,
                justifyContent: 'center'
            },
            colunaTres: {
                flex: 1,
                justifyContent: 'flex-end'
            },
        },
        datatableHeader: {
            padding: 5,
            height: 50,
            backgroundColor: 'rgba(0, 0, 0, 0.1)'
        },
        formaPagamento: {
            containerDatatable: {
                flex: 5
            },
            colunaUm: {
                flex: 2,
                justifyContent: 'flex-start'
            },
            colunaDois: {
                flex: 2,
                justifyContent: 'flex-start'
            },
            colunaTres: {
                flex: 1,
                justifyContent: 'flex-end'
            },
        },
        itens: {
            containerDatatable: {
                flex: 4
            },
            colunaUm: {
                flex: 3,
                justifyContent: 'flex-start'
            },
            colunaDois: {
                flex: 1,
                justifyContent: 'flex-end'
            }
        },
        produtos: {
            rowDatatable: {
                height: 60,
                margin: 5
            },
            titleNome: {
                fontSize: 15,
            },
            titleEstVlr: {
                fontSize: 10,
                textAlign: 'right',
            },
            viewRow: {
                width: Dimensions.get('window').width - 50
            },
            textoValorEstoque: {
                flexDirection: 'row',
                justifyContent: 'space-between'
            },
        }
    },
    modalPesquisa: {
        header: {
            backgroundColor: '#504dff',
            textAlign: 'center',
            padding: 15,
            flexDirection: 'row',
            justifyContent: 'space-between'
        },
        textoHader: {
            color: 'black',
            fontSize: 18,
        },
    }
}