import React, { useEffect, useState } from 'react';
import { useNetInfo } from "@react-native-community/netinfo";
import getRealm from '../realm/realm'

let inicialState = {timeSinc: 20000, realizandoSincronismo: false}
const sincronismo = Component => props => {
    let [state, setState] = useState(inicialState);
    let netInfo = useNetInfo()

    const iniciaSincronismo = async () => {
        if (!state.realizandoSincronismo) {
            let realm = (await getRealm())
            let pessoas = realm.objects('Pessoa').filtered("id_numerama == null")
            let pedidos = realm.objects('Pedido').filtered("id_numerama == null")

            if ((pessoas.length > 0 || pedidos.length > 0) && netInfo.isConnected) {
                state = { ...state, realizandoSincronismo: true }

            }            
        }
    }

    useEffect(() => {
        setInterval(function () {
            iniciaSincronismo()
        }, state.timeSinc)
    }, []);
    
    return <Component {...props } />;
};

export default sincronismo;