import React, {Component} from 'react'
import { Keyboard } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import FormInput from './Input'
import { TextInputMask } from 'react-native-masked-text'

export default class Datepicker extends Component {
    state = {
        showDatePicker: false
    }

    setaData = (data) => {
        this.setState({showDatePicker: false})
        this.props.input(data)
    }

    abrirModal = () => {
        Keyboard.dismiss()
        this.setState({ showDatePicker: true })
    }

    render() {
        return (
            <>
                <FormInput
                    label={this.props.label}
                    value={this.props.value}
                    render={props => 
                        <TextInputMask
                            {...props}
                            onFocus={this.abrirModal}
                            type='datetime'
                            options={ {format: 'DD/MM/YYYY'} }
                        />
                    }
                />
                {
                    this.state.showDatePicker ? 
                    <DateTimePicker 
                        onChange={(_, date) => this.setaData(date)} 
                        mode='date' 
                        value={ new Date() }/> : 
                    false
                }
            </>
        )
    }
}