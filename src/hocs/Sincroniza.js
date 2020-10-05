import React, { useEffect, useState } from 'react';
import { useNetInfo } from "@react-native-community/netinfo";
import getRealm from '../realm/realm'
import { post } from '../common'

let inicialState = {timeSinc: 2000, realizandoSincronismo: false}
const sincronismo = Component => props => {
    let [state, setState] = useState(inicialState);
    let netInfo = useNetInfo()

    const iniciaSincronismo = async () => {
        if (!state.realizandoSincronismo) {
            let realm = (await getRealm())
            let pessoas = realm.objects('Pessoa').filtered("id_numerama == null")
            let pedidos = realm.objects('Pedido').filtered("id_numerama == null")

            //await post('api/produtos/pesquisa', { 'parametro': parametrosBuscar, 'filtroProdServ': '0', 'ativo': '1', 'ordena': null, 'ordem': null }, (resp) => {
            //    console.log(resp.data.data[0])
            //})
console.log(netInfo)
            if (netInfo.isConnected) {
                await baixaDados()
                state = { ...state, realizandoSincronismo: true }
            } else if ((pessoas.length > 0 || pedidos.length > 0) && netInfo.isConnected) {
                state = { ...state, realizandoSincronismo: true }
            }

        }
    }

    const baixaDados = async () => {
        await post('api/produtos/pesquisa', { 'parametro': parametrosBuscar, 'filtroProdServ': '0', 'ativo': '1', 'ordena': null, 'ordem': null }, (resp) => {
            console.log(resp.data.data[0])
        })
    }

    useEffect(() => {
        setInterval(function () {
            iniciaSincronismo()
        }, state.timeSinc)
    }, []);
    
    return <Component {...props } />;
};

export default sincronismo;