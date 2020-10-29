import React, { Component } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import {connect} from 'react-redux'
import { TextInputMask } from 'react-native-masked-text'
import {Button, DataTable, Card } from 'react-native-paper'
import Icon from 'react-native-vector-icons/FontAwesome'
import Swipeable from 'react-native-gesture-handler/Swipeable'

import FormInput from '../../components/Form/Input'
import PesquisaProduto from '../../components/Produto/PesquisaProduto'
import { formatMoney, formatForCalc } from '../../components/Functions'
import { limparForm, addPessoa, addItem, removeItem, controlaDadosFaturamento } from '../../store/actions/pedido'
import commonStyles from '../../commonStyles'
import getRealm from '../../realm/realm'

const itemInicial = {produto: {}, index: null, produto_id: null, quantidade: '0,00', vlr_unitario: '0,00', vlr_desconto: '0,00', vlr_total: 0}

class AddPedido extends Component {
    state = {
        item: { ...itemInicial },
        editando: false,
        vlrTotalForm: '0,00',
        limiteCreditoDisponivel: 0
    }

    efetuaCalculoValorItem = ({vlr_unitario, quantidade, vlr_desconto}) => {
        return (formatForCalc(vlr_unitario) * formatForCalc(quantidade)) - formatForCalc(vlr_desconto)
    }

    calculaValorItem = async () => {
        let itemTemp = this.state.item
        itemTemp.vlr_total = this.efetuaCalculoValorItem(itemTemp)
        this.setState({ item: itemTemp })
    }

    adicionaItem = () => {
        let itemTemp = this.state.item
        
        if (this.state.editando) {
            this.props.removeItem(itemTemp.index)
        }

        this.props.addItem(itemTemp)
        this.setState({ item: itemInicial, editando: false })
        this.calculaValorTotalForm()
    }

    calculaValorTotalForm = () => {
        let vlrTotalForm = 0
        let temDesconto = false

        if (this.props.pedido.itens.length > 0) {
            this.props.pedido.itens.forEach(item => {
                vlrTotalForm += this.efetuaCalculoValorItem(item)
                temDesconto = !temDesconto && item.vlr_desconto > 0 ? true : temDesconto
            })
        }
        this.props.controlaDadosFaturamento({
            valorTotal: vlrTotalForm,
            descontoAplicado: temDesconto
        })
        this.setState({ vlrTotalForm: formatMoney(vlrTotalForm) })
    }

    setaProdutoPesquisado = produto => this.setState({ item: { ...itemInicial, produto, produto_id: produto.id, vlr_unitario: formatMoney(produto.vlr_venda) } })

    editarItem = indexItem => {
        let item = this.props.pedido.itens[indexItem]
        item.index = indexItem
        this.setState({ item, editando: true })
    }

    getRightContent = (index) => {
        return (
            <TouchableOpacity style={ [commonStyles.swipeable, {backgroundColor: 'green'}] } onPress={() => this.editarItem(index)}>
                <Icon name='pencil' size={30} color='white' />
            </TouchableOpacity>
        )
    }

    deletarItem = indexItem => {
        this.props.removeItem(indexItem)
        this.calculaValorTotalForm()
    }

    getLeftContent = (index) => {
        return (
            <TouchableOpacity style={ [commonStyles.swipeable, {backgroundColor: 'red'}] } onPress={() => this.deletarItem(index)}>
                <Icon name='trash' size={30} color='white' />
            </TouchableOpacity>
        )
    }

    async componentDidMount() {
        await this.props.limparForm()
        let pessoa = (await getRealm()).objects('Pessoa').filtered(`id = "${this.props.route.params.pessoaId}"`)[0]
        this.props.addPessoa(pessoa)
        let limite = this.props.pedido.pessoa.limite_credito - this.props.pedido.pessoa.saldo_atrasado - this.props.pedido.pessoa.saldo_em_dia
        this.setState({ limiteCreditoDisponivel: limite })
        this.calculaValorTotalForm()
    }

    render() {
        return (
            <View style={commonStyles.containerForm}>
                <Text style={ styles.nomeCliente }>{ this.props.pedido.pessoa.nomeFantasia } - { this.props.pedido.pessoa.cpfCnpj }</Text>
                <Text style={ styles.limiteCredito }>Limite disponível: { this.props.pedido.pessoa.limite_credito <= 0 ? 'Ilimitado' : formatMoney(this.state.limiteCreditoDisponivel) }</Text>
                
                <ScrollView>
                    <View>
                        <PesquisaProduto
                            value={ this.state.item.produto_id != null ? this.state.item.produto.nome : 'Buscar produto..' }
                            input={this.setaProdutoPesquisado}
                        />

                        <View style={ commonStyles.containerLinha }>
                            <View style={ commonStyles.containerInput }>
                                <FormInput
                                    label='Unitário (R$)'
                                    disabled={this.state.item.produto_id == null}
                                    value={this.state.item.vlr_unitario}
                                    render={props => 
                                        <TextInputMask
                                            {...props}
                                            type='money'
                                            options={commonStyles.optionsInputMoney}
                                            onChangeText={(vlr_unitario) => this.setState({ item: {...this.state.item, vlr_unitario} }, this.calculaValorItem)}
                                        />
                                    }
                                />
                            </View>

                            <View style={ commonStyles.espacoInputs }></View>

                            <View style={ commonStyles.containerInput }>
                                <FormInput
                                    label='Quantidade'
                                    disabled={this.state.item.produto_id == null}
                                    value={this.state.item.quantidade}
                                    render={props => 
                                        <TextInputMask
                                            {...props}
                                            type='money'
                                            options={commonStyles.optionsInputMoney}
                                            onChangeText={(quantidade) => this.setState({ item: {...this.state.item, quantidade} }, this.calculaValorItem)}
                                        />
                                    }
                                />
                            </View>
                        </View>

                        <View style={ commonStyles.containerLinha }>
                            <View style={ commonStyles.containerInput }>
                                <FormInput
                                    label='Desconto (R$)'
                                    disabled={this.state.item.produto_id == null}
                                    value={this.state.item.vlr_desconto}
                                    render={props => 
                                        <TextInputMask
                                            {...props}
                                            type='money'
                                            options={commonStyles.optionsInputMoney}
                                            onChangeText={(vlr_desconto) => this.setState({ item: {...this.state.item, vlr_desconto}}, this.calculaValorItem)}
                                        />
                                    }
                                />
                            </View>

                            <View style={ commonStyles.espacoInputs }></View>

                            <View style={  commonStyles.containerLinha }>
                                <Text style={ styles.textTotal }>{`R$ ${formatMoney(this.state.item.vlr_total)}`}</Text>
                                <Button 
                                    disabled={ this.state.item.vlr_total <= 0 } style={ styles.button }
                                    mode="contained" color="green"
                                    onPress={this.adicionaItem}
                                >
                                    <Icon name='plus' size={25} color='white'/>
                                </Button>
                            </View>
                        </View>

                        <View style={ styles.containerItens }>
                            <Card>
                                <Card.Title title="Produtos" titleStyle={styles.textTitleCard}/>
                                
                                <Card.Content>
                                    <ScrollView>
                                        <DataTable style={ commonStyles.datatables.itens.containerDatatable }>
                                            <DataTable.Header>
                                                <DataTable.Title style={ commonStyles.datatables.itens.colunaUm }>Nome</DataTable.Title>
                                                <DataTable.Title style={ commonStyles.datatables.itens.colunaDois }>Total (R$)</DataTable.Title>
                                            </DataTable.Header>

                                            {
                                                this.props.pedido.itens.map((item, index) => {
                                                    return (
                                                        <Swipeable 
                                                            renderRightActions={() => this.getRightContent(index)}
                                                            renderLeftActions={() => this.getLeftContent(index)}
                                                            key={index}
                                                        >
                                                            <DataTable.Row
                                                                underlayColor='blue'
                                                                rippleColor='red'>
                                                                <DataTable.Cell style={ commonStyles.datatables.itens.colunaUm }>
                                                                    <View>
                                                                        <Text>{ item.produto.nome }</Text>
                                                                        <Text>{item.vlr_unitario} * {item.quantidade} - {item.vlr_desconto}</Text>
                                                                    </View>
                                                                </DataTable.Cell>
                                                                
                                                                <DataTable.Cell style={ commonStyles.datatables.itens.colunaDois }>{ formatMoney(item.vlr_total) }</DataTable.Cell>
                                                            </DataTable.Row>
                                                        </Swipeable>
                                                    )
                                                })
                                            }
                                        </DataTable>
                                    </ScrollView>

                                    <Text style={styles.textDatatableFooter}>{this.state.vlrTotalForm}</Text>
                                </Card.Content>
                            </Card>
                        </View>
                    
                        <View>
                            <Button mode="contained" color='blue'
                                onPress={() => this.props.navigation.navigate('Faturamento')}
                                disabled={this.state.vlrTotalForm == '0,00'}
                            >
                                <Icon name='money' size={25} color='white'/> Faturar
                            </Button>
                        </View>
                    </View>
                </ScrollView>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    textTotal: {
        color: 'black',
        fontSize: 20,
        marginTop: 40,
        marginLeft: 5
    },
    button: {
        height: 40,
        marginLeft: 20,
        marginTop: 35
    },
    containerItens: {
        width: '100%',
        maxHeight: Dimensions.get('window').height / 2,
    },
    textTitleCard: {
        fontSize: 15,
        textAlign: 'center'
    },
    textDatatableFooter: {
        fontSize: 25,
        textAlign: 'center',
        borderTopWidth: 2
    },
    nomeCliente: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10
    },
    limiteCredito: {
        fontSize: 15,
        textAlign: 'center',
        marginLeft: 10,
        marginRight: 10
    }
})

const mapStateToProps = (state) => {
    return {
        pedido: state.pedido,
    }
}  

const mapDispatchToProps = { limparForm, addItem, addPessoa, removeItem, controlaDadosFaturamento }

export default connect(mapStateToProps, mapDispatchToProps)(AddPedido)