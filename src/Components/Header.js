import {Image,ImageBackground, Text} from "react-native";
import {styles} from "./Styles";
import React from "react";
import { LOGO_BASE64 } from "../../assets/logo";


export default class Header extends React.Component{
    /*constructor(props) {
        super(props);
    }*/

    render(){
        return(
            <ImageBackground style={styles.container}>
                <Image style={styles.icon} source={{ uri: LOGO_BASE64 }}></Image>
            </ImageBackground>
        )
    }
}