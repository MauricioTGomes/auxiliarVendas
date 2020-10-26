import React, { Component } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import {connect} from 'react-redux'
import { TextInputMask } from 'react-native-masked-text'
import {Button, DataTable, Card } from 'react-native-paper'
import Icon from 'react-native-vector-icons/FontAwesome'
import Swipeable from 'react-native-gesture-handler/Swipeable'

import FormInput from '../../components/Form/Input'
import PesquisaProduto from '../../components/Produto/PesquisaProduto'
import {formatMoney} from '../../components/Functions'
import { limparForm, addPessoa, addItem, removeItem, controlaDadosFaturamento } from '../../store/actions/pedido'
import commonStyles from '../../commonStyles'

const itemInicial = {produto: {}, index: null, produto_id: null, quantidade: '', vlr_unitario: '', vlr_desconto: '', vlr_total: 0, vlr_unitario: ''}

class AddPedido extends Component {
    state = {
        item: { ...itemInicial },
        editando: false,
        vlrTotalForm: '0,00'
    }

    efetuaCalculoValorItem = ({vlr_unitario, quantidade, vlr_desconto}) => {
        let formatForCalc = vlr => vlr == '' ? 0 : vlr
        return (formatForCalc(vlr_unitario) * quantidade) - formatForCalc(vlr_desconto)
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

    setaProdutoPesquisado = produto => {
        let itemTemp = {
            ...itemInicial,
            produto,
            produto_id: produto.id,
            vlr_unitario: produto.vlr_venda,
            vlr_total: produto.vlr_venda
        }
        this.setState({ item: itemTemp })
    }

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
        this.props.addPessoa(this.props.route.params.pessoa)
        this.calculaValorTotalForm()
    }

    render() {
        return (
            <View style={commonStyles.containerForm}>
                <View>
                    <Text>{this.props.route.params.pessoa.tipo == 1 ? this.props.route.params.pessoa.nome : this.props.route.params.pessoa.razao_social}</Text>
                </View>

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
                                            includeRawValueInChangeText
                                            onChangeText={(_, vlr_unitario) => this.setState({ item: {...this.state.item, vlr_unitario} }, this.calculaValorItem)}
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
                                            includeRawValueInChangeText
                                            onChangeText={(_, quantidade) => this.setState({ item: {...this.state.item, quantidade} }, this.calculaValorItem)}
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
                                            includeRawValueInChangeText
                                            onChangeText={(_, vlr_desconto) => this.setState({ item: {...this.state.item, vlr_desconto}}, this.calculaValorItem)}
                                        />
                                    }
                                />
                            </View>

                            <View style={ commonStyles.espacoInputs }></View>

                            <View style={  commonStyles.containerInputTotal }>
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
                                                <DataTable.Title>Total (R$)</DataTable.Title>
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
                                                                        <Text>{formatMoney(item.vlr_unitario)} * {formatMoney(item.quantidade)} - {formatMoney(item.vlr_desconto)}</Text>
                                                                    </View>
                                                                </DataTable.Cell>
                                                                
                                                                <DataTable.Cell>{ formatMoney(item.vlr_total) }</DataTable.Cell>
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
                            <Button 
                                mode="contained"
                                color='blue'
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
    containerInputTotal: {
        flexDirection: 'row',
        width: '50%',
        margin: 20,
        justifyContent: 'flex-start',
    },
    textTotal: {
        color: 'black',
        fontSize: 20,
        marginTop: 12
    },
    button: {
        height: 40,
        marginLeft: 25,
        marginTop: 10
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
        fontSize: 15,
        textAlign: 'center',
        borderTopWidth: 2
    },
})

const mapStateToProps = (state) => {
    return {
        pedido: state.pedido,
    }
}  

const mapDispatchToProps = { limparForm, addItem, addPessoa, removeItem, controlaDadosFaturamento }

export default connect(mapStateToProps, mapDispatchToProps)(AddPedido)