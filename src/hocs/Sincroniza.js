import React, { useEffect, useState } from 'react';
import NetInfo from "@react-native-community/netinfo";
import { baixarProdutos, baixarPessoas, baixarPedidos } from './services/Functions'

let inicialState = {timeSinc: 2000, realizandoSincronismo: false}
const sincronismo = Component => props => {
    let [state, setState] = useState(inicialState);

    const iniciaSincronismo = async () => {
        if (!state.realizandoSincronismo) {
            let netInfo = null
            await NetInfo.fetch().then(state => {
                netInfo = state
            });
            
            if (netInfo && netInfo.isConnected) {
                state = { ...state, realizandoSincronismo: true }
                await baixarProdutos()
                await baixarPessoas()
                await baixarPedidos()
                state = { ...state, realizandoSincronismo: false }
            }
        }
    }

    useEffect(() => {
        //iniciaSincronismo()
    }, []);
    
    return <Component {...props } />;
};

export default sincronismo;