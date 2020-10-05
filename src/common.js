import axios from 'axios'
import { Alert } from 'react-native'


//let api = 'http://localhost:8000/';
//if (process.env.NODE_ENV !== 'development') {
    let api = 'https://app.numerama.com.br/'//'192.168.56.1:3000/'
//}

export function post(url, data, functionSuccess) {
    axios.post(api + url, data).then(response => {
        functionSuccess(response)
    }).catch(err => {
        Alert.alert("Atenção!", err.response.data.message)
    })
}

export function get(url, data, functionSuccess) {
    axios.get(api + url).then(response => {
        functionSuccess(response)
    }).catch(err => {
        Alert.alert("Atenção!", err.response.data.message)
    })
}