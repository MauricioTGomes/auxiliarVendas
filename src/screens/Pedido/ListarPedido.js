import React, {Component} from 'react'
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native' 
import Header from '../../components/Header'
import Icon from 'react-native-vector-icons/FontAwesome'
import { DataTable, Searchbar } from 'react-native-paper';
import getRealm from '../../realm/realm';
import PesquisaPessoa from '../../components/Pessoa/PesquisaPessoa'
import {formatMoney} from '../../components/Functions'

class ListarPedido extends Component {
    state = {
        pedidos: [],
        sorting: 'descending',
        parametrosBuscar: '',
        showModalPesquisaPessoa: false
    }

    componentDidMount = async () => {
        //let produtos = (await getRealm()).objects('Produto')
        //this.setState({ produtos })
    }

    buscaPedido = async parametrosBuscar => {
        /*this.setState({ parametrosBuscar })
        let realm = (await getRealm())
        
        let produtos = []
        if (this.state.parametrosBuscar != '') {
            produtos = realm.objects('Produto').filtered(`nome like "*${this.state.parametrosBuscar}*"`)
        } else {
            produtos = realm.objects('Produto')
        }
        this.setState({ produtos })*/
    }

    addPedido = pessoa => {
        this.props.navigation.navigate('AddPedido', {pessoa})
        this.setState({ showModalPesquisaPessoa: false })
    }

    controlaSortTable = () => this.setState({ sorting: this.state.sorting == 'descending' ? 'ascending' : 'descending' })

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
                        <DataTable style={{flex: 4}}>
                            <DataTable.Header>
                                <DataTable.Title style={{flex: 2}} sortDirection={this.state.sorting} onPress={this.controlaSortTable}>Nome</DataTable.Title>
                                <DataTable.Title style={{justifyContent: 'flex-end'}}>Estoque</DataTable.Title>
                                <DataTable.Title style={{justifyContent: 'flex-end'}}>Valor (R$)</DataTable.Title>
                            </DataTable.Header>

                            {
                                this.state.pedidos.map((pedido, index) => {
                                    return (
                                        <DataTable.Row key={index}>
                                            <DataTable.Cell>{ pedido.nome }</DataTable.Cell>
                                            <DataTable.Cell numeric>{ formatMoney(pedido.qtd_estoque) }</DataTable.Cell>
                                            <DataTable.Cell numeric>{ formatMoney(pedido.vlr_venda) }</DataTable.Cell>
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
    }
})

export default ListarPedido