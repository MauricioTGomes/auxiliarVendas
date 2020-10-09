import axios from 'axios'
import { Alert } from 'react-native'


//let api = 'http://localhost:8000/';
//if (process.env.NODE_ENV !== 'development') {
export let serve = 'https://app.numerama.com.br/'//'192.168.56.1:3000/'
//}

export function post(url, data, functionSuccess) {
    axios.post(serve + url, data).then(response => {
        functionSuccess(response)
    }).catch(err => {
        let mensagem = err.response.data.message
        if (err.response.status == '404') {
            mensagem = "Página não existe"
        }
        Alert.alert("Atenção!", "Erro ao realizar operação! \r" + mensagem)
    })
}

export function get(url, functionSuccess) {
    axios.get(serve + url).then(response => {
        functionSuccess(response)
    }).catch(err => {
        let mensagem = err.response.data.message
        if (err.response.status == '404') {
            mensagem = "Página não existe"
        }
        Alert.alert("Atenção!", "Erro ao realizar operação! \r" + mensagem)
    })
}