import {Text, TouchableOpacity, View} from "react-native";
import {styles} from "./Styles";
import React from "react";


export default class Sandbox extends React.Component{
    constructor(props) {
        super(props);
    }

    handleLogin = async () => {
        console.log(this.props.navigation);
        this.props.navigation.navigate('Login');
    };

    render(){
        return(
            <View style={styles.buttonContainer}>
                <View style={styles.buttonrow}>
                    <TouchableOpacity style={styles.buttonlogin} onPress={this.handleLogin}>
                        <Text style={styles.textbutton}>Login</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.buttonrow}>
                    <TouchableOpacity style={styles.buttonregister}>
                        <Text style={styles.textbutton}>Register</Text>
                    </TouchableOpacity>
                </View>

            </View>
        )
    }
}