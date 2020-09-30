import React, {Component} from 'react'
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native' 
import Header from '../../components/Header'
import Icon from 'react-native-vector-icons/FontAwesome'
import { DataTable, Searchbar } from 'react-native-paper';
import moment from 'moment'
import 'moment/locale/pt-br'

import getRealm from '../../realm/realm';
import PesquisaPessoa from '../../components/Pessoa/PesquisaPessoa'
import {formatMoney} from '../../components/Functions'

class ListarPedido extends Component {
    state = {
        pedidos: [],
        parametrosBuscar: '',
        showModalPesquisaPessoa: false
    }

    componentDidMount = async () => {
        let pedidos = (await getRealm()).objects('Pedido')
        this.setState({ pedidos })
    }

    buscaPedido = async parametrosBuscar => {
        this.setState({ parametrosBuscar })
        let realm = (await getRealm())
        
        let pedidos = []
        if (this.state.parametrosBuscar != '') {
            pedidos = realm.objects('Pedido')
                        .filtered(`pessoa.nome like "*${this.state.parametrosBuscar}*" OR pessoa.razao_social like "*${this.state.parametrosBuscar}*" OR pessoa.fantasia like "*${this.state.parametrosBuscar}*"`)
                        .sorted('data_criacao')
        } else {
            pedidos = realm.objects('Pedido')
        }
        this.setState({ pedidos })
    }

    addPedido = pessoa => {
        this.props.navigation.navigate('AddPedido', {pessoa})
        this.setState({ showModalPesquisaPessoa: false })
    }

    render() {
        return (
            <View style={{flex: 1}}>
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
                        <DataTable style={styles.datatable}>
                            <DataTable.Header>
                                <DataTable.Title style={styles.datatableCellUm}>Data</DataTable.Title>
                                <DataTable.Title style={styles.datatableCellDois}>Nome</DataTable.Title>
                                <DataTable.Title style={styles.datatableCellTres}>Produtos</DataTable.Title>
                                <DataTable.Title style={styles.datatableCellQuatro}>Valor (R$)</DataTable.Title>
                            </DataTable.Header>

                            {
                                this.state.pedidos.map((pedido, index) => {
                                    return (
                                        <DataTable.Row key={index}>
                                            <DataTable.Cell style={styles.datatableCellUm}>{ moment(pedido.data_criacao).locale('pt-br').format('D/MM/YYYY') }</DataTable.Cell>
                                            <DataTable.Cell style={styles.datatableCellDois}>{ pedido.pessoa.tipo == 2 ? pedido.pessoa.razao_social : pedido.pessoa.nome }</DataTable.Cell>
                                            <DataTable.Cell style={styles.datatableCellTres} numeric>{ pedido.itens.length }</DataTable.Cell>
                                            <DataTable.Cell style={styles.datatableCellQuatro} numeric>{ formatMoney(pedido.vlr_liquido) }</DataTable.Cell>
                                        </DataTable.Row>
                                    )
                                })
                            }
                        </DataTable>
                    </ScrollView>
                    
                    <TouchableOpacity
                        onPress={() => this.setState({ showModalPesquisaPessoa: true })}
                        style={styles.addButton}
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
    addButton: {
        position: 'absolute',
        right: 30,
        bottom: 30,
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'blue'
    },
    datatable: {
        flex: 6
    },
    datatableCellUm: {
        flex: 2
    },
    datatableCellDois: {
        flex: 2
    },
    datatableCellTres: {
        flex: 1,
        justifyContent: 'flex-end'
    },
    datatableCellQuatro: {
        flex: 1,
        justifyContent: 'flex-end'
    },
})

export default ListarPedido