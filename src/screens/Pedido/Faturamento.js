import React, { Component } from 'react'
import { 
    View,
    StyleSheet,
    Alert,
    ScrollView, 
    TouchableOpacity
} from 'react-native'
import Swipeable from 'react-native-gesture-handler/Swipeable'
import Icon from 'react-native-vector-icons/FontAwesome'
import { TextInputMask } from 'react-native-masked-text'
import { Button, Card, DataTable } from 'react-native-paper'
import { connect } from 'react-redux'
import OrientationLoadingOverlay from 'react-native-orientation-loading-overlay';

import NetInfo from "@react-native-community/netinfo";
import { enviaPedido } from '../../services/Functions'

import getRealm from '../../realm/realm'
import { formatMoney, formatForCalc } from '../../components/Functions'
import { addForma, removeForma } from '../../store/actions/pedido'
import FormInput from '../../components/Form/Input'
import DatePicker from '../../components/Form/Datepicker'
import PesquisaFormaPagamento from '../../components/Faturamento/PesquisaFormaPagamento'
import commonStyles from '../../commonStyles'
import moment from 'moment'
import 'moment/locale/pt-br'

const formaInicial = {vlr_total: '0,00', array_parcelas: [], qtd_dias: '', nro_parcelas: '', forma_pagamento: {}, primeira_cobranca: '', primeira_cobranca_formatada: ''}

class FormFormasPagamento extends Component {
    state = {
        loader: false,
        forma: {...formaInicial},
        faturamento: {
            vlr_bruto: '0,00',
            vlr_desconto: '0,00',
            vlr_liquido: '0,00',
            vlr_restante: '0,00',
        },
    }

    removeFormaPagamento = index => {
        this.props.removeForma(index)
        this.calculaValorTotal()
    }

    getRightContent = (index) => {
        return (
            <TouchableOpacity style={ [commonStyles.swipeable, {backgroundColor: 'red'}] } onPress={() => this.removeFormaPagamento(index)}>
                <Icon name='trash' size={25} color='white' />
            </TouchableOpacity>
        )
    }

    salvarPedido = async () => {
        this.setState({ loader: true })
        let realm = (await getRealm())
        try {
            const lastPedido = realm.objects('Pedido').sorted('id', true)
            const lastId = lastPedido.length > 0 ? lastPedido[0].id : 0
            
            let pessoa = this.props.pedido.pessoa
            let itens = this.props.pedido.itens.map(item => {
                return {
                    ...item,
                    vlr_desconto: formatForCalc(item.vlr_desconto),
                    vlr_unitario: formatForCalc(item.vlr_unitario),
                    quantidade: formatForCalc(item.quantidade),
                    vlr_total: item.vlr_total
                }
            })
            let valoresPrazo = 0

            let pagamentos = this.props.pedido.formasPagamento.map(formaFor => {
                if (['PRAZO', 'BOLETO'].includes(formaFor.forma_pagamento.tipo)) valoresPrazo += formatForCalc(formaFor.vlr_total)

                return { 
                    ...formaFor,
                    vlr_restante: formatForCalc(formaFor.vlr_total),
                    vlr_total: formatForCalc(formaFor.vlr_total),
                    parcelas: formaFor.array_parcelas.map(parcelaFor => { return { ...parcelaFor, valor_original: formatForCalc(parcelaFor.valor_original) } })
                }
            })

            let limite = pessoa.limite_credito - pessoa.saldo_atrasado - pessoa.saldo_em_dia
            if (valoresPrazo > limite && limite > 0) {
                this.setState({ loader: false })
                Alert.alert('Atenção!', `Cliente sem crédito para vendas a prazo.`)
                return false
            }

            let pedido = {
                id: lastId+1,
                pessoa,
                itens,
                pagamentos,
                vlr_liquido: formatForCalc(this.state.faturamento.vlr_liquido),
                vlr_bruto: formatForCalc(this.state.faturamento.vlr_bruto),
                vlr_desconto: formatForCalc(this.state.faturamento.vlr_desconto),
                data_criacao: moment().format('YYYY-MM-DD'),
                estornado: 0
            }

            let pedidoBanco = null
            realm.write(() => {
                pedidoBanco = realm.create('Pedido', pedido, 'modified')
                
                if (valoresPrazo > 0) {
                    let pessoaBanco = realm.objects('Pessoa').filtered(`id = "${pessoa.id}"`)[0]
                    pessoaBanco.saldo_em_dia = (pessoaBanco.saldo_em_dia != undefined ? pessoaBanco.saldo_em_dia : 0) + valoresPrazo
                    realm.create('Pessoa', pessoaBanco, 'modified')
                }
            })
            
            let netInfo = null
            await NetInfo.fetch().then(state => netInfo = state)
            if (netInfo && netInfo.isConnected) {
                await enviaPedido(pedidoBanco, realm)
            }
    
            this.setState({ loader: false })
            Alert.alert('Sucesso!', 'Pedido cadastrada com sucesso.', [{
                text: 'OK',
                onPress: this.props.navigation.navigate('ListarPedido'),
            }])
        } catch (e) {
            this.setState({ loader: false })
            Alert.alert('Atenção!', `Erro ao cadastrar pedido. ${e}`)
        }
    }

    calcularParcelas = () => {
        let dataBase = moment(this.state.forma.primeira_cobranca).locale('pt-br')
        let valorTotal = formatForCalc(this.state.forma.vlr_total)
        let valorParcela = (valorTotal / this.state.forma.nro_parcelas).toFixed(2)
        let parcelas = new Array(parseInt(this.state.forma.nro_parcelas)).fill({
                nro_parcela: 1,
                valor_original: formatMoney(valorParcela),
                data_vencimento: dataBase.clone().format('YYYY-MM-DD'),
                data_vencimento_formatada: dataBase.clone().format('D[/]MM[/]YYYY')
            })
            
        parcelas.forEach((_, index) => {
            if (index + 1 === parcelas.length) valorParcela = valorTotal.toFixed(2)
            valorTotal -= valorParcela

            if (index !== 0) {
                let dataVencimento = dataBase.add({days: this.state.forma.qtd_dias}).clone()

                parcelas[index] = {
                    nro_parcela: index + 1,
                    valor_original: formatMoney(valorParcela),
                    data_vencimento: dataVencimento.format('YYYY-MM-DD'),
                    data_vencimento_formatada: dataVencimento.format('D[/]MM[/]YYYY')
                }
            }
        })

        this.setState({ forma: {...this.state.forma, array_parcelas: parcelas} })
    }

    calculaValorTotal = async () => {
        let vlrBrutoFormatado = formatMoney(this.props.pedido.faturamento.vlr_bruto)
        let faturamento = { 
            ...this.state.faturamento, vlr_bruto: vlrBrutoFormatado, vlr_liquido: vlrBrutoFormatado, vlr_restante: vlrBrutoFormatado,
        }

        let vlrDescontoFormatado = formatForCalc(this.state.faturamento.vlr_desconto)
        if (vlrDescontoFormatado > 0) {
            let valorTotalFormas = 0
            if (this.props.pedido.formasPagamento.length > 0) {
                await this.props.pedido.formasPagamento.forEach(forma => valorTotalFormas += formatForCalc(forma.vlr_total))
            }

            if (this.props.pedido.descontoAplicadoProduto) {
                faturamento.vlr_desconto = '0,00'
            } else {
                console.log(vlrDescontoFormatado)
                faturamento.vlr_liquido = formatForCalc(this.state.faturamento.vlr_bruto) - vlrDescontoFormatado
                
                if (faturamento.vlr_liquido < 0) {
                    faturamento.vlr_desconto = '0,00'
                    faturamento.vlr_liquido = this.state.faturamento.vlr_bruto
                    Alert.alert("Atenção", "Desconto não pode ser maior que o total.")
                } else {
                    faturamento.vlr_restante = formatMoney(faturamento.vlr_liquido - valorTotalFormas)
                    faturamento.vlr_liquido = formatMoney(faturamento.vlr_liquido)
                }
            }
        }
        this.setState({ faturamento })
    }

    calcularValorRestante = () => {
        let faturamento = this.state.faturamento
        let valorTotalFormas = 0

        this.props.pedido.formasPagamento.forEach(forma => valorTotalFormas += formatForCalc(forma.vlr_total))
        let vlrRestante = formatForCalc(faturamento.vlr_bruto) - valorTotalFormas

        faturamento.vlr_restante = formatMoney(vlrRestante)
        this.setState({ faturamento })
    }

    setDataPrimeiraCobranca = data => {
        let dataFormatada = moment(data).format('D[/]MM[/]YYYY')
        if (moment(data).format('YYYY[-]MM[-]D') > moment().format('YYYY[-]MM[-]D')) {
            this.setState({ forma: {...this.state.forma, primeira_cobranca: data, primeira_cobranca_formatada: dataFormatada} })
        } else {
            Alert.alert('Atenção!', `A data inicial não pode ser menor que ${moment().format('D[/]MM[/]YYYY')}`)
        }
    }

    addForma = async () => {
        let forma = this.state.forma
        this.props.addForma(forma)
        forma = formaInicial
        await this.calcularValorRestante()
        forma.vlr_total = this.state.faturamento.vlr_restante
        this.setState({ forma })
    }

    setaForma = forma_pagamento => {
        let forma = {...formaInicial, forma_pagamento}
        forma.vlr_total = this.state.faturamento.vlr_restante
        forma.qtd_dias = 30
        forma.nro_parcelas = 1

        this.setState( { forma, faturamento: {...this.state.faturamento, vlr_restante: '0,00'} } )
    }

    setaValorForma = (vlr_total) => {
        this.setState({ forma: {...this.state.forma, vlr_total} })
        let vlrRestante = formatForCalc(this.state.faturamento.vlr_bruto) - formatForCalc(vlr_total)
        this.setState({ faturamento: {...this.state.faturamento, vlr_restante: formatMoney(vlrRestante)} })
    }

    getFormPrazo = () => {
        return (
            <>
                <View style={ commonStyles.containerLinha }>
                    <View style={ commonStyles.containerInput }>
                        <FormInput
                            label='Valor (R$)'
                            value={this.state.forma.vlr_total}
                            render={props => 
                                <TextInputMask
                                    {...props}
                                    type='money'
                                    options={commonStyles.optionsInputMoney}
                                    onChangeText={(vlr_total) => this.setaValorForma(vlr_total)}
                                />
                            }
                        />
                    </View>
                    
                    <View style={ commonStyles.espacoInputs }></View>

                    <View style={ commonStyles.containerInput }>
                        <FormInput
                            label='Número parcelas'
                            value={this.state.forma.nro_parcelas}
                            render={props => 
                                <TextInputMask
                                    {...props}
                                    type='money'
                                    options={ commonStyles.optionsInputPositive }
                                    onChangeText={(nro_parcelas) => this.setState({ forma: {...this.state.forma, nro_parcelas} })}
                                />
                            }
                        />
                    </View>
                </View>

                <View style={ commonStyles.containerLinha }>
                    <View style={ commonStyles.containerInput }>
                        <FormInput
                            label='Dias entre parcelas'
                            value={this.state.forma.qtd_dias}
                            render={props => 
                                <TextInputMask
                                    {...props}
                                    type='money'
                                    options={ commonStyles.optionsInputPositive }
                                    onChangeText={(qtd_dias) => this.setState({ forma: {...this.state.forma, qtd_dias} })}
                                />
                            }
                        />
                    </View>

                    <View style={ commonStyles.espacoInputs }></View>

                    <View style={ commonStyles.containerInput }>
                        <DatePicker 
                            label='Data base'
                            value={this.state.forma.primeira_cobranca_formatada}
                            input={(primeira_cobranca) => this.setDataPrimeiraCobranca(primeira_cobranca)}/>
                    </View>
                </View>

                <View style={ commonStyles.containerLinha }>
                    <Button 
                        mode="contained"
                        color='blue'
                        onPress={() => this.calcularParcelas()}
                        disabled={parseInt(this.state.forma.nro_parcelas) <= 0 || parseInt(this.state.forma.qtd_dias) <= 0 || this.state.forma.primeira_cobranca === ''}
                    >
                        <Icon name='calculator' size={25} color='white'/>  Calcular parcelas
                    </Button>
                </View>

                <View style={ styles.containerParcelas }>
                    <Card>
                        <Card.Title title="Parcelas" titleStyle={styles.textTitleCard}/>
                        
                        <Card.Content>
                            <DataTable>
                                <DataTable.Header style={ commonStyles.datatables.faturamentoPrazo.containerDatatable }>
                                    <DataTable.Title style={ commonStyles.datatables.faturamentoPrazo.colunaUm }>Nro</DataTable.Title>
                                    <DataTable.Title style={ commonStyles.datatables.faturamentoPrazo.colunaDois }>Vencimento</DataTable.Title>
                                    <DataTable.Title style={ commonStyles.datatables.faturamentoPrazo.colunaTres }>Valor (R$)</DataTable.Title>
                                </DataTable.Header>

                                {
                                    this.state.forma.array_parcelas != undefined ? this.state.forma.array_parcelas.map((parcela, index) => {
                                        return (
                                            <DataTable.Row underlayColor='blue' rippleColor='red' key={index} style={ commonStyles.datatables.faturamentoPrazo.containerDatatable }>
                                                <DataTable.Cell style={ commonStyles.datatables.faturamentoPrazo.colunaUm }>{ parcela.nro_parcela }</DataTable.Cell>
                                                <DataTable.Cell style={ commonStyles.datatables.faturamentoPrazo.colunaDois }>{ parcela.data_vencimento_formatada }</DataTable.Cell>
                                                <DataTable.Cell style={ commonStyles.datatables.faturamentoPrazo.colunaTres }>{ parcela.valor_original }</DataTable.Cell>
                                            </DataTable.Row>
                                        )
                                    }) : false
                                }
                            </DataTable>
                        </Card.Content>
                    </Card>
                </View>

                <Button style={ styles.btnAddFormaPrazo } disabled={ this.state.forma.array_parcelas === undefined || this.state.forma.array_parcelas.length <= 0 } mode="contained" color="green" onPress={() => this.addForma()} > 
                    Adicionar forma  <Icon name='plus' size={25} color='white'/>
                </Button>
            </>
        )
    }

    getFormVista = () => {
        return (
            <>
                <View style={ commonStyles.containerLinha }>
                    <View style={ commonStyles.containerInput }>
                        <FormInput
                            label='Valor (R$)'
                            value={this.state.forma.vlr_total}
                            render={props => 
                                <TextInputMask
                                    {...props}
                                    type='money'
                                    options={commonStyles.optionsInputMoney}
                                    onChangeText={(vlr_total) => this.setaValorForma(vlr_total)}
                                />
                            }
                        />
                    </View>
                </View>

                <Button disabled={ this.state.forma.vlr_total == 0 } mode="contained" color="green" onPress={() => this.addForma()} > 
                    Adicionar forma  <Icon name='plus' size={25} color='white'/>
                </Button>
            </>
        )
    }

    componentDidMount() {
        this.calculaValorTotal()
    }

    render() {
        return (
            <View>
                <OrientationLoadingOverlay visible={this.state.loader} color="white" indicatorSize="large" messageFontSize={24} message="Salvando pedido..."/>
                <ScrollView>
                    <Card style={ styles.card }>
                        <Card.Title title="Faturamento" titleStyle={styles.textTitleCard}/>
                        
                        <Card.Content>
                            <View style={ commonStyles.containerLinha }>
                                <View style={ commonStyles.containerInput }>
                                    <FormInput label='Total (R$)' value={this.props.pedido.faturamento.vlr_bruto_formatado} disabled />
                                </View>

                                <View style={ commonStyles.espacoInputs }></View>

                                <View style={ commonStyles.containerInput }>
                                    <FormInput
                                        label='Desconto (R$)'
                                        disabled={this.props.pedido.descontoAplicadoProduto}
                                        value={this.state.faturamento.vlr_desconto}
                                        render={props => 
                                            <TextInputMask
                                                {...props}
                                                type='money'
                                                options={commonStyles.optionsInputMoney}
                                                onChangeText={(vlr_desconto) => this.setState({ faturamento: {...this.state.faturamento, vlr_desconto} }, this.calculaValorTotal)}
                                            />
                                        }
                                    />
                                </View>
                            </View>

                            <View style={ commonStyles.containerLinha }>
                                <View style={ commonStyles.containerInput }>
                                    <FormInput label='Liquido (R$)' disabled value={this.state.faturamento.vlr_liquido} />
                                </View>
                                
                                <View style={ commonStyles.espacoInputs }></View>

                                <View style={ commonStyles.containerInput }>
                                    <FormInput label='Restate (R$)' disabled value={this.state.faturamento.vlr_restante} />
                                </View>
                            </View>

                            <Card style={ styles.card }>
                                <Card.Title title="Forma" titleStyle={styles.textTitleCard}/>
                                
                                <Card.Content>
                                    <PesquisaFormaPagamento
                                        disabled={this.state.faturamento.vlr_restante == '0,00'}
                                        value={ this.state.forma.forma_pagamento.id != undefined ? this.state.forma.forma_pagamento.nome : 'Buscar forma pagamento..' }
                                        input={this.setaForma}
                                    />

                                    {   
                                        this.state.forma.forma_pagamento.tipo !== undefined ? 
                                        (
                                            this.state.forma.forma_pagamento.tipo == 'VISTA' ? 
                                            this.getFormVista() : 
                                            this.getFormPrazo()
                                        ) :
                                        false
                                    }
                                </Card.Content>
                            </Card>

                            <View style={ styles.containerFormas }>
                                <Card>
                                    <Card.Title title="Formas cadastradas" titleStyle={styles.textTitleCard}/>
                                    
                                    <Card.Content>
                                        <ScrollView>
                                            <DataTable style={ commonStyles.datatables.formaPagamento.containerDatatable }>
                                                <DataTable.Header>
                                                    <DataTable.Title style={ commonStyles.datatables.formaPagamento.colunaUm }>Nome</DataTable.Title>
                                                    <DataTable.Title style={ commonStyles.datatables.formaPagamento.colunaDois }>Valor (R$)</DataTable.Title>
                                                    <DataTable.Title style={ commonStyles.datatables.formaPagamento.colunaTres }>Parcelas</DataTable.Title>
                                                </DataTable.Header>

                                                {
                                                    this.props.pedido.formasPagamento.map((forma, index) => {
                                                        return (
                                                            <Swipeable 
                                                                renderRightActions={() => this.getRightContent(index)}
                                                                key={index}
                                                            >
                                                                <DataTable.Row underlayColor='blue' rippleColor='red' key={index}>
                                                                    <DataTable.Cell style={ commonStyles.datatables.formaPagamento.colunaUm }>{ forma.forma_pagamento.nome }</DataTable.Cell>
                                                                    <DataTable.Cell style={ commonStyles.datatables.formaPagamento.colunaDois }>{ forma.vlr_total }</DataTable.Cell>
                                                                    <DataTable.Cell style={ commonStyles.datatables.formaPagamento.colunaTres }>{ forma.array_parcelas == undefined ? '----' : forma.array_parcelas.length }</DataTable.Cell>
                                                                </DataTable.Row>
                                                            </Swipeable>
                                                        )
                                                    })
                                                }
                                            </DataTable>
                                        </ScrollView>
                                    </Card.Content>
                                </Card>
                            </View>

                            <Button
                                disabled={ this.props.pedido.formasPagamento.length <= 0 || formatForCalc(this.state.faturamento.vlr_restante) > 0 } 
                                mode="contained" color="green"
                                onPress={() => this.salvarPedido()}
                                style={ styles.button }
                            >
                                Gravar pedido   <Icon name='check' size={20} color='white' /> 
                            </Button>
                        </Card.Content>
                    </Card>
                </ScrollView>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    card: {
        marginTop: 10
    },
    textTitleCard: {
        fontSize: 15,
        textAlign: 'center'
    },
    button: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 50,
        marginTop: 20
    },
    containerParcelas: {
        width: '100%'
    },
    containerFormas: {
        marginTop: 10,
        width: '100%',

    },
    btnAddFormaPrazo: {
        marginTop: 10
    }
})

const mapStateToProps = (state) => {
    return {
        pedido: state.pedido
    }
}  

const mapDispatchToProps = { addForma, removeForma }


export default connect(mapStateToProps, mapDispatchToProps)(FormFormasPagamento)