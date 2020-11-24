import React from 'react'
import { Title, Card } from 'react-native-paper'
import { TouchableOpacity, StyleSheet, Text, View, TouchableWithoutFeedback, Modal } from 'react-native'
import { formatMoney } from '../../components/Functions'
import Icon from 'react-native-vector-icons/FontAwesome'

export default props => {
    const modal = !props.isVisible ? false : (
        <Modal transparent={true} visible={props.isVisible} onRequestClose={props.onCancel} animationType='slide'>
            <TouchableWithoutFeedback onPress={props.onCancel}>
                <View style={styles.background}></View>
            </TouchableWithoutFeedback>

            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.textoHader}>Detalhes cliente</Text>
                    
                    <TouchableOpacity  onPress={props.onCancel}>
                        <Icon name="close" size={20} color='white'/>
                    </TouchableOpacity>
                </View>

                <Card>
                    <Card.Content>
                        <Title>Dados gerais</Title>
                        <Text style={ styles.textos }>{ `Ativo: ${props.pessoa.ativo == '1' ? 'Sim' : 'Não'}` }</Text>
                        <Text style={ styles.textos }>{ `Nome / Razão Social: ${props.pessoa.nomeRazaoSocial}` }</Text>
                        <Text style={ styles.textos }>{ `CPF/CNPJ: ${props.pessoa.cpfCnpj}` }</Text>
                        <Text style={ styles.textos }>{ `Limite crédito: ${formatMoney(props.pessoa.limite_credito)}` }</Text>
                        <Text style={ styles.textos }>{ `Saldo em atraso: ${formatMoney(props.pessoa.saldo_atrasado)}` }</Text>
                        <Text style={ styles.textos }>{ `Saldo em dia: ${formatMoney(props.pessoa.saldo_em_dia)}` }</Text>
                        <Text style={ styles.textos }>{ `Limite restante: ${props.pessoa.limite_credito <= 0 ? '0,00' : formatMoney(props.pessoa.limite_credito - (props.pessoa.saldo_atrasado + props.pessoa.saldo_em_dia))}` }</Text>
                            
                        <Title>Endereço</Title>
                        <Text style={ styles.textos }>{ `${props.pessoa.cidade.nomeEstado} - ${props.pessoa.cep}` }</Text>
                        <Text style={ styles.textos }>{ `${props.pessoa.endereco} - ${props.pessoa.endereco_nro}` }</Text>
                        <Text style={ styles.textos }>{ props.pessoa.bairro }</Text>
                        <Text style={ styles.textos }>{ props.pessoa.complemento }</Text>                        
                    </Card.Content>
                </Card>
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
    textos: {
        fontSize: 15,
        marginLeft: 10,
        marginBottom: 5
    }
    
})