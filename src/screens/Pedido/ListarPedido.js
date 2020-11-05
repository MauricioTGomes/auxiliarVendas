import React, {Component} from 'react'
import { Dimensions, Text, View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native' 
import Icon from 'react-native-vector-icons/FontAwesome'
import { DataTable, Searchbar } from 'react-native-paper';
import moment from 'moment'
import 'moment/locale/pt-br'
import OrientationLoadingOverlay from 'react-native-orientation-loading-overlay';
import Swipeable from 'react-native-gesture-handler/Swipeable'

import ModalDetalhes from '../../components/Pedido/ModalDetalhes'
import commonStyles from '../../commonStyles'
import Header from '../../components/Header'
import getRealm from '../../realm/realm';
import PesquisaPessoa from '../../components/Pessoa/PesquisaPessoa'
import { formatMoney } from '../../components/Functions'

class ListarPedido extends Component {
    state = {
        pedidos: [],
        parametrosBuscar: '',
        filtrarEstornados: false,
        showModalPesquisaPessoa: false,
        loader: true,
        pagination: {
            page: 1,
            fim: 1,
            inicio: 1,
            totalItens: 0
        },
        detalhes: {
            pedido: {},
            isVisible: false
        },
    }

    componentDidMount = async () => {
        const self = this
        setTimeout(function () {
            self.buscaPedido('', 1)
        }, 500)
    }

    filtroAtivo = () => {
        this.setState({ filtrarEstornados: !this.state.filtrarEstornados })
        this.buscaPedido('', 1)
    }

    buscaPedido = async (parametrosBuscar, page = 1) => {
        this.setState({ parametrosBuscar })
        let realm = (await getRealm())
        let pedidos = []
        
        if (this.state.parametrosBuscar.length >= 3) {
            pedidos = await realm.objects('Pedido')
                        .filtered(`estornado = "${(this.state.filtrarEstornados ? 1 : 0)}" AND (pessoa.nome CONTAINS[c] "${this.state.parametrosBuscar}" OR pessoa.razao_social CONTAINS[c] "${this.state.parametrosBuscar}" OR pessoa.fantasia CONTAINS[c] "${this.state.parametrosBuscar}")`)
                        .sorted('data_criacao', true)
        } else if(this.state.parametrosBuscar == '') {
            pedidos = await realm.objects('Pedido')
                        .filtered(`estornado = "${(this.state.filtrarEstornados ? 1 : 0)}"`)
                        .sorted('data_criacao', true)
        }
        
        let totalItens = pedidos.length
        let pageInicial = (page * 50) - 50
        
        let pagination = {
            totalItens ,
            page,
            inicio: pageInicial + 1,
            fim: totalItens < 50 ? totalItens : pageInicial + 50,
        }

        this.setState({ 
            pagination,
            pedidos: pedidos.slice(pageInicial, pageInicial + 50),
            loader: false
        })
    }

    addPedido = pessoa => {
        this.props.navigation.navigate('AddPedido', {pessoaId: pessoa.id})
        this.setState({ showModalPesquisaPessoa: false })
    }
    
    getLeftContent = (pedidoID) => {
        return (
            <TouchableOpacity style={ [commonStyles.swipeable, {backgroundColor: 'blue'}] } onPress={() => this.abreModalDetalhes(pedidoID)}>
                <Icon name='info' size={30} color='white' />
            </TouchableOpacity>
        )
    }

    abreModalDetalhes = async pedidoId => {
        let pedido = (await getRealm()).objects('Pedido').filtered(`id = "${pedidoId}"`)[0]
        this.setState({ detalhes: { pedido, isVisible: true } })
    }

    render() {
        return (
            <View style={{flex: 1}}>
                <OrientationLoadingOverlay visible={this.state.loader} color="white" indicatorSize="large" messageFontSize={24} message="Buscando pedidos..."/>

                <ModalDetalhes { ...this.state.detalhes } onCancel={() => this.setState({ detalhes: { isVisible: false, pessoa: {} } })}/>

                <Header/>
                
                <View style={{flex: 7}}>
                    <PesquisaPessoa
                        input={this.addPedido}
                        onCancel={() => this.setState({ showModalPesquisaPessoa: false })}
                        isVisible={this.state.showModalPesquisaPessoa}
                    />

                    <Searchbar
                        placeholder="Buscar pedido"
                        onChangeText={this.buscaPedido}
                        value={this.state.parametrosBuscar}
                    />

                    <ScrollView>
                        <DataTable>
                            <DataTable.Header style={ commonStyles.datatables.datatableHeader }>
                                <View style={ styles.viewRow }>
                                    <Text style={ styles.titleNome }>Cliente</Text>
                                    <View style={ [styles.textoDataProd, {marginLeft: 10}] }>
                                        <Text style={ styles.headerSubTitle }>Data</Text>
                                        <Text style={ styles.headerSubTitle }>Número</Text>
                                        <Text style={ styles.headerSubTitle }>Produtos</Text>
                                        <Text style={ styles.headerSubTitle }>Valor (R$)</Text>
                                    </View>
                                </View> 
                            </DataTable.Header>

                            {
                                this.state.pedidos.map((pedido, index) => {
                                    return (
                                        <Swipeable
                                            renderLeftActions={() => this.getLeftContent(pedido.id)} key={index}>
                                            <DataTable.Row key={index} style={ styles.rowDatatable }>
                                                <View style={ styles.viewRow }>
                                                    <Text>{ pedido.pessoa != null ? pedido.pessoa.nomeRazaoSocial : 'Não informado' }</Text>
                                                    <View style={ styles.textoDataProd }>
                                                        <Text>{ moment(pedido.data_criacao).locale('pt-br').format('DD/MM/YYYY') }</Text>
                                                        <Text>{ pedido.numero !== null ? pedido.numero : '---' }</Text>
                                                        <Text>{ pedido.itens.length }</Text>
                                                        <Text>{ formatMoney(pedido.vlr_liquido) }</Text>
                                                    </View>
                                                </View> 
                                            </DataTable.Row>
                                        </Swipeable>
                                    )
                                })
                            }

                            <DataTable.Pagination
                                page={this.state.pagination.page}
                                numberOfPages={Math.floor(this.state.pagination.totalItens / 50)}
                                onPageChange={page => this.buscaPedido(this.state.parametrosBuscar, page)}
                                label={`Mostrando de ${this.state.pagination.inicio} até ${this.state.pagination.fim} de ${this.state.pagination.totalItens} registros`}
                            />
                        </DataTable>
                    </ScrollView>
                    
                    <TouchableOpacity
                        onPress={this.filtroAtivo}
                        style={ commonStyles.filtrarButton }
                        activeOpacity={0.7}
                    >
                        <Icon name={ this.state.filtrarEstornados ? 'eye' : 'eye-slash' } size={20} color='white' />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => this.setState({ showModalPesquisaPessoa: true })}
                        style={ commonStyles.addButton }
                        activeOpacity={0.7}
                    >
                        <Icon name="plus" size={20} color='white'/>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    headerSubTitle: {
        fontSize: 10,
    },
    titleNome: {
        fontSize: 15,
    },
    rowDatatable: {
        height: 60,
        margin: 5
    },
    textoDataProd: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    viewRow: {
        width: Dimensions.get('window').width - 50
    }
})

export default ListarPedido