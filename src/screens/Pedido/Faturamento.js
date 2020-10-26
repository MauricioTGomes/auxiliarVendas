import React, { Component } from 'react'
import { 
    View,
    StyleSheet,
    Alert,
    ScrollView, 
    Dimensions,
    TouchableOpacity
} from 'react-native'
import Swipeable from 'react-native-gesture-handler/Swipeable'
import Icon from 'react-native-vector-icons/FontAwesome'
import { TextInputMask } from 'react-native-masked-text'
import { Button, Card, DataTable } from 'react-native-paper'
import { connect } from 'react-redux'

import NetInfo from "@react-native-community/netinfo";
import { enviaPedido } from '../../hocs/services/Functions'

import getRealm from '../../realm/realm'
import {formatMoney} from '../../components/Functions'
import { addForma, removeForma } from '../../store/actions/pedido'
import FormInput from '../../components/Form/Input'
import DatePicker from '../../components/Form/Datepicker'
import PesquisaFormaPagamento from '../../components/Faturamento/PesquisaFormaPagamento'
import commonStyles from '../../commonStyles'
import moment from 'moment'
import 'moment/locale/pt-br'

const formaInicial = {vlr_total: '', array_parcelas: [], qtd_dias: '', nro_parcelas: '', forma_pagamento: {}, primeira_cobranca: '', primeira_cobranca_formatada: ''}

class FormFormasPagamento extends Component {
    state = {
        forma: {...formaInicial},
        faturamento: {
            vlr_bruto: '',
            vlr_desconto: '',
            vlr_liquido: '',
            vlr_restante: 0,
            vlr_restante_formatado: '0,00'
        },
    }

    removeFormaPagamento = index => {
        this.props.removeForma(index)
        this.calcularValorRestante()
    }

    getRightContent = (index) => {
        return (
            <TouchableOpacity style={ [commonStyles.swipeable, {backgroundColor: 'red'}] } onPress={() => this.removeFormaPagamento(index)}>
                <Icon name='trash' size={30} color='white' />
            </TouchableOpacity>
        )
    }

    salvarPedido = async () => {
        let realm = (await getRealm())
        try {
            const lastPedido = realm.objects('Pedido').sorted('id', true)
            const lastId = lastPedido.length > 0 ? lastPedido[0].id : 0
            let pessoa = this.props.pedido.pessoa
            let itens = this.props.pedido.itens.map(item => {
                item.vlr_desconto = item.vlr_desconto == '' ? 0.00 : item.vlr_desconto
                return item
            })
            
            let pagamentos = this.props.pedido.formasPagamento.map(formaFor => {
                let formaReturn = { 
                    ...formaFor,
                    vlr_restante: formaFor.vlr_total,
                    parcelas: formaFor.array_parcelas
                }
                return formaReturn
            })
            let pedido = {
                id: lastId+1,
                pessoa,
                itens,
                pagamentos,
                vlr_liquido: this.state.faturamento.vlr_liquido,
                vlr_bruto: this.state.faturamento.vlr_bruto,
                vlr_desconto: this.state.faturamento.vlr_desconto == '' ? 0.00 : this.state.faturamento.vlr_desconto,
                data_criacao: moment().locale('pt-br').format('YYYY-MM-DD')
            }

            let pedidoBanco = null
            realm.write(() => {
                pedidoBanco = realm.create('Pedido', pedido, 'modified')
            })

            let netInfo = null
            await NetInfo.fetch().then(state => netInfo = state)
            if (netInfo && netInfo.isConnected) {
                enviaPedido(pedidoBanco, realm)
            }
    
            Alert.alert('Sucesso!', 'Pedido cadastrada com sucesso.', [{
                text: 'OK',
                onPress: this.props.navigation.navigate('ListarPedido'),
            }])
        } catch (e) {
            Alert.alert('Atenção!', `Erro ao cadastrar pedido. ${e}`)
        }
    }

    calcularParcelas = () => {
        let dataBase = moment(this.state.forma.primeira_cobranca).locale('pt-br')
        let valorTotal = this.state.forma.vlr_total
        let valorParcela = (this.state.forma.vlr_total / this.state.forma.nro_parcelas).toFixed(2)
        let parcelas = new Array(this.state.forma.nro_parcelas)
            .fill({
                nro_parcela: 1,
                valor_original: parseFloat(valorParcela),
                data_vencimento: dataBase.clone().format('YYYY-MM-DD'),
                data_vencimento_formatada: dataBase.clone().format('D[/]MM[/]YYYY')})
        
        parcelas.forEach((_, index) => {
            if (index + 1 === parcelas.length) valorParcela = valorTotal.toFixed(2)
            valorTotal -= valorParcela

            if (index !== 0) {
                let dataVencimento = dataBase.add({days: this.state.forma.qtd_dias}).clone()

                parcelas[index] = {
                    nro_parcela: index + 1,
                    valor_original: parseFloat(valorParcela),
                    data_vencimento: dataVencimento.format('YYYY-MM-DD'),
                    data_vencimento_formatada: dataVencimento.format('D[/]MM[/]YYYY')
                }
            }
        })

        this.setState({
            forma: {...this.state.forma, array_parcelas: parcelas}
        })
    }

    calculaValorTotal = () => {
        let faturamento = {
            ...this.state.faturamento,
            vlr_bruto: this.props.pedido.faturamento.vlr_bruto,
            vlr_liquido: this.props.pedido.faturamento.vlr_bruto,
            vlr_restante: this.props.pedido.faturamento.vlr_bruto,
            vlr_restante_formatado: formatMoney(this.props.pedido.faturamento.vlr_bruto),
        }

        if (this.state.faturamento.vlr_desconto > 0) {
            if (this.props.pedido.descontoAplicadoProduto) {
                faturamento.vlr_desconto = ''
            } else {
                faturamento.vlr_liquido = this.state.faturamento.vlr_bruto - this.state.faturamento.vlr_desconto
                if (faturamento.vlr_liquido < 0) {
                    faturamento.vlr_desconto = ''
                    faturamento.vlr_liquido = this.state.faturamento.vlr_bruto
                    Alert.alert("Atenção", "Desconto não pode ser maior que o total.")
                }
            }
        }
        this.setState({ faturamento })
    }

    calcularValorRestante = () => {
        let faturamento = this.state.faturamento
        let valorTotalFormas = 0

        this.props.pedido.formasPagamento.forEach(forma => {
            valorTotalFormas += forma.vlr_total
        })
        let vlrRestante = faturamento.vlr_bruto - valorTotalFormas

        faturamento.vlr_restante = vlrRestante
        faturamento.vlr_restante_formatado = formatMoney(vlrRestante)
        this.setState({ faturamento })
    }

    setDataPrimeiraCobranca = data => {
        let dataFormatada = moment(data).format('D[/]MM[/]YYYY')
        this.setState({ forma: {...this.state.forma, primeira_cobranca: data, primeira_cobranca_formatada: dataFormatada} })
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

        this.setState( { forma, faturamento: {...this.state.faturamento, vlr_restante: 0, vlr_restante_formatado: '0,00'} } )
    }

    setaValorForma = (vlr_total) => {
        this.setState({ forma: {...this.state.forma, vlr_total} })
        let vlrRestante = this.state.faturamento.vlr_bruto - vlr_total
        this.setState({ faturamento: {...this.state.faturamento, vlr_restante: vlrRestante, vlr_restante_formatado: formatMoney(vlrRestante)} })
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
                                    includeRawValueInChangeText
                                    onChangeText={(_, vlr_total) => this.setaValorForma(vlr_total)}
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
                                    includeRawValueInChangeText
                                    onChangeText={(_, nro_parcelas) => this.setState({ forma: {...this.state.forma, nro_parcelas} })}
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
                                    includeRawValueInChangeText
                                    onChangeText={(_, qtd_dias) => this.setState({ forma: {...this.state.forma, qtd_dias} })}
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
                        <Icon name='calculator' size={25} color='white'/> Calcular parcelas
                    </Button>
                </View>

                <View style={ styles.containerParcelas }>
                    <Card>
                        <Card.Title title="Parcelas" titleStyle={styles.textTitleCard}/>
                        
                        <Card.Content>
                            <ScrollView>
                                <DataTable>
                                    <DataTable.Header>
                                        <DataTable.Title>Nro</DataTable.Title>
                                        <DataTable.Title>Vencimento</DataTable.Title>
                                        <DataTable.Title>Valor (R$)</DataTable.Title>
                                    </DataTable.Header>

                                    {
                                        this.state.forma.array_parcelas != undefined ? 
                                        this.state.forma.array_parcelas.map((parcela, index) => {
                                            return (
                                                <DataTable.Row underlayColor='blue' rippleColor='red' key={index}>
                                                    <DataTable.Cell>{ parcela.nro_parcela }</DataTable.Cell>
                                                    <DataTable.Cell>{ parcela.data_vencimento_formatada }</DataTable.Cell>
                                                    <DataTable.Cell>{ formatMoney(parcela.valor_original)}</DataTable.Cell>
                                                </DataTable.Row>
                                            )
                                        }) :
                                        false
                                    }
                                </DataTable>
                            </ScrollView>
                        </Card.Content>
                    </Card>
                </View>

                <View>
                    <Button 
                        disabled={ this.state.forma.array_parcelas === undefined || this.state.forma.array_parcelas.length <= 0 } 
                        style={ styles.button } 
                        mode="contained" color="green"
                        onPress={() => this.addForma()}
                    >
                        <Icon name='plus' size={25} color='white'/>
                        Adicionar forma
                    </Button>
                </View>
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
                                    includeRawValueInChangeText
                                    onChangeText={(_, vlr_total) => this.setaValorForma(vlr_total)}
                                />
                            }
                        />
                    </View>
                </View>

                <View style={  commonStyles.containerInputTotal }>
                    <Button 
                        disabled={ this.state.forma.vlr_total == 0 } style={ styles.button }
                        mode="contained" color="green"
                        onPress={() => this.addForma()}
                    >
                        <Icon name='plus' size={25} color='white'/>
                        Adicionar forma
                    </Button>
                </View>
            </>
        )
    }

    componentDidMount() {
        this.calculaValorTotal()
    }

    render() {
        return (
            <View>
                <ScrollView>
                    <Card style={ styles.card }>
                        <Card.Title title="Faturamento" titleStyle={styles.textTitleCard}/>
                        
                        <Card.Content>
                            <View style={ commonStyles.containerLinha }>
                                <View style={ commonStyles.containerInput }>
                                    <FormInput
                                        label='Total (R$)'
                                        value={this.props.pedido.faturamento.vlr_bruto_formatado}
                                        disabled
                                        render={props => 
                                            <TextInputMask
                                                {...props}
                                                type='money'
                                                options={commonStyles.optionsInputMoney}
                                            />
                                        }
                                    />
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
                                                includeRawValueInChangeText
                                                onChangeText={(_, vlr_desconto) => this.setState({ faturamento: {...this.state.faturamento, vlr_desconto} }, this.calculaValorTotal)}
                                            />
                                        }
                                    />
                                </View>
                            </View>

                            <View style={ commonStyles.containerLinha }>
                                <View style={ commonStyles.containerInput }>
                                    <FormInput
                                        label='Liquido (R$)'
                                        disabled value={this.state.faturamento.vlr_liquido}
                                        render={props => 
                                            <TextInputMask
                                                {...props}
                                                type='money'
                                                options={commonStyles.optionsInputMoney}
                                            />
                                        }
                                    />
                                </View>
                                
                                <View style={ commonStyles.espacoInputs }></View>

                                <View style={ commonStyles.containerInput }>
                                    <FormInput
                                        label='Restate (R$)'
                                        disabled value={this.state.faturamento.vlr_restante_formatado}
                                        render={props => 
                                            <TextInputMask
                                                {...props}
                                                type='money'
                                                options={commonStyles.optionsInputMoney}
                                            />
                                        }
                                    />
                                </View>
                            </View>

                            <Card style={ styles.card }>
                                <Card.Title title="Forma" titleStyle={styles.textTitleCard}/>
                                
                                <Card.Content>
                                    <PesquisaFormaPagamento
                                        disabled={this.state.faturamento.vlr_restante_formatado == '0,00'}
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

                            <View style={ styles.containerParcelas }>
                                <Card>
                                    <Card.Title title="Formas cadastradas" titleStyle={styles.textTitleCard}/>
                                    
                                    <Card.Content>
                                        <ScrollView>
                                            <DataTable style={ commonStyles.datatables.formaPagamento.containerDatatable }>
                                                <DataTable.Header>
                                                    <DataTable.Title style={ commonStyles.datatables.formaPagamento.colunaUm }>Nome</DataTable.Title>
                                                    <DataTable.Title>Valor (R$)</DataTable.Title>
                                                    <DataTable.Title>Parcelas</DataTable.Title>
                                                </DataTable.Header>

                                                {
                                                    this.props.pedido.formasPagamento.map((forma, index) => {
                                                        return (
                                                            <Swipeable 
                                                                renderRightActions={() => this.getRightContent(index)}
                                                                key={index}
                                                            >
                                                                <DataTable.Row underlayColor='blue' rippleColor='red' key={index}>
                                                                    <DataTable.Cell  style={ commonStyles.datatables.formaPagamento.colunaUm }>{ forma.forma_pagamento.nome }</DataTable.Cell>
                                                                    <DataTable.Cell>{ formatMoney(forma.vlr_total) }</DataTable.Cell>
                                                                    <DataTable.Cell>{ forma.array_parcelas == undefined ? '----' : forma.array_parcelas.length }</DataTable.Cell>
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

                            <View>
                                <Button 
                                    disabled={ this.props.pedido.formasPagamento.length <= 0 || this.state.faturamento.vlr_restante > 0 } 
                                    style={ styles.button } 
                                    mode="contained" color="green"
                                    onPress={() => this.salvarPedido()}
                                >
                                    <Icon name='plus' size={25} color='white'/>
                                    Emitir pedido
                                </Button>
                            </View>

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
        height: 50,
        marginLeft: 25,
        marginTop: 20
    },
    containerParcelas: {
        width: '100%',
        maxHeight: Dimensions.get('window').height / 2,
    },
})

const mapStateToProps = (state) => {
    return {
        pedido: state.pedido
    }
}  

const mapDispatchToProps = { addForma, removeForma }


export default connect(mapStateToProps, mapDispatchToProps)(FormFormasPagamento)