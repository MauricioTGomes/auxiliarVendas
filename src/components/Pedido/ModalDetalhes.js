import React from 'react'
import { DataTable, Title, Card } from 'react-native-paper'
import { TouchableOpacity, ScrollView, StyleSheet, Text, View, TouchableWithoutFeedback, Modal } from 'react-native'
import { formatMoney } from '../../components/Functions'
import moment from 'moment'
import 'moment/src/locale/pt-br'
import commonStyles from '../../commonStyles'
import Icon from 'react-native-vector-icons/FontAwesome'

export default props => {
    const modal = !props.isVisible ? false : (
        <Modal transparent={true} visible={props.isVisible} onRequestClose={props.onCancel} animationType='slide'>
            <TouchableWithoutFeedback onPress={props.onCancel}>
                <View style={styles.background}></View>
            </TouchableWithoutFeedback>

            <View style={styles.container}>
                <View style={ commonStyles.modalPesquisa.header }>
                    <Text style={ commonStyles.modalPesquisa.textoHader }>Detalhes pedido</Text>
                    
                    <TouchableOpacity  onPress={props.onCancel}>
                        <Icon name="close" size={20} color='white'/>
                    </TouchableOpacity>
                </View>
                
                <ScrollView>
                    <Card>
                        <Card.Content>
                                <Title>Dados gerais</Title>
                                <Text style={ styles.textos }>{ `Pedido pendente: ${props.pedido.id_numerama != null ? 'Não' : 'Sim'}` }</Text>
                                <Text style={ styles.textos }>{ `Data de criação: ${moment(props.pedido.data_criacao, "YYYY-MM-DD").locale('pt-br').format("DD/MM/YYYY")}` }</Text>
                                <Text style={ styles.textos }>{ `Cliente: ${props.pedido.pessoa != null ? (props.pedido.pessoa.nomeRazaoSocial + ' - ' + props.pedido.pessoa.cpfCnpj) : 'Não informado'}` }</Text>
                                <Text style={ styles.textos }>{ `Número: ${props.pedido.numero == null ? '---' : props.pedido.numero}` }</Text>
                                <Text style={ styles.textos }>{ `Estornado: ${props.pedido.estornado == 1 ? 'Sim' : 'Não'}` }</Text>
                                <Text style={ styles.textos }>{ `Valor bruto (R$): ${formatMoney(props.pedido.vlr_bruto)}` }</Text>
                                <Text style={ styles.textos }>{ `Valor desconto (R$): ${formatMoney(props.pedido.vlr_desconto)}` }</Text>
                                <Text style={ styles.textos }>{ `Valor liquido (R$): ${formatMoney(props.pedido.vlr_liquido)}` }</Text>
                                
                                <Title>Produtos</Title>
                                <DataTable style={ commonStyles.datatables.itens.containerDatatable }>
                                    <DataTable.Header style={ commonStyles.datatables.datatableHeader }>
                                        <DataTable.Title style={ commonStyles.datatables.itens.colunaUm }>Nome</DataTable.Title>
                                        <DataTable.Title>Total (R$)</DataTable.Title>
                                    </DataTable.Header>
                                    {
                                        props.pedido.itens.length > 0 ?
                                            props.pedido.itens.map((item, index) => {
                                                return (
                                                    <DataTable.Row underlayColor='blue' rippleColor='red' key={index}>
                                                        <DataTable.Cell style={ commonStyles.datatables.itens.colunaUm }>
                                                            <View>
                                                                <Text>{ item.produto.nome }</Text>
                                                                <Text>{formatMoney(item.vlr_unitario)} * {formatMoney(item.quantidade)} - {formatMoney(item.vlr_desconto)}</Text>
                                                            </View>
                                                        </DataTable.Cell>
                                                        
                                                        <DataTable.Cell>{ formatMoney(item.vlr_total) }</DataTable.Cell>
                                                    </DataTable.Row>
                                                )
                                            }) : 
                                        
                                        <DataTable.Row underlayColor='blue' rippleColor='red'>
                                            <DataTable.Cell>Nenhum item cadastrado.</DataTable.Cell>
                                        </DataTable.Row>
                                    }
                                </DataTable>

                                <Title>Pagamentos</Title>
                                <DataTable style={ commonStyles.datatables.formaPagamento.containerDatatable }>
                                <DataTable.Header  style={ commonStyles.datatables.datatableHeader }>
                                    <DataTable.Title style={ commonStyles.datatables.formaPagamento.colunaUm }>Nome</DataTable.Title>
                                    <DataTable.Title style={ commonStyles.datatables.formaPagamento.colunaDois }>Valor (R$)</DataTable.Title>
                                    <DataTable.Title style={ commonStyles.datatables.formaPagamento.colunaTres }>Parcelas</DataTable.Title>
                                </DataTable.Header>
                                {
                                    
                                    props.pedido.pagamentos.length > 0 ?
                                    props.pedido.pagamentos.map((forma, index) => {
                                        return (
                                            <DataTable.Row underlayColor='blue' rippleColor='red' key={index}>
                                                <DataTable.Cell style={ commonStyles.datatables.formaPagamento.colunaUm }>{ forma.forma_pagamento.nome }</DataTable.Cell>
                                                <DataTable.Cell style={ commonStyles.datatables.formaPagamento.colunaDois }>{ formatMoney(forma.vlr_total) }</DataTable.Cell>
                                                <DataTable.Cell style={ commonStyles.datatables.formaPagamento.colunaTres }>{ !['PRAZO', 'BOLETO'].includes(forma.forma_pagamento.tipo) ? '----' : forma.parcelas.length }</DataTable.Cell>
                                            </DataTable.Row>
                                        )
                                    }) :
                                    <DataTable.Row underlayColor='blue' rippleColor='red'>
                                        <DataTable.Cell>Nenhuma forma encontrada.</DataTable.Cell>
                                    </DataTable.Row>
                                }
                            </DataTable>
                        </Card.Content>
                    </Card>
                </ScrollView>
            </View>

            <TouchableWithoutFeedback onPress={props.onCancel}>
                <View style={styles.background}></View>
            </TouchableWithoutFeedback>
        </Modal>
    )

    return modal
}


const styles = StyleSheet.create({
    background: {
        flex: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.7)'
    },
    container: {
        backgroundColor: 'black'
    },
    textos: {
        fontSize: 15,
        marginLeft: 10,
        marginBottom: 5
    }
    
})