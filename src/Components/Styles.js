import {StyleSheet} from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent:'center',
        padding: 20,
        backgroundColor: 'white',
    },
    icon:{
        height: 160, 
        width: 160, 
        alignSelf: 'center', 
        marginBottom: 32
        //width: 350,
        //height: 250,
        //borderRadius:50,
    },
    subtitle:{
        fontSize:16,
        color:'white',
    },
    title: {
        fontSize: 20,
        color: 'white',
        fontWeight:'bold',
    },
    input:{
        height:40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 20,
        paddingLeft: 10,
    },
    buttonContainer: {
        marginBottom: 10,
    },
    buttonlogin:{
        backgroundColor:'gold',
        borderRadius:5,
        padding:10,
        paddingHorizontal:100,
// borderStyle:'solid',
// borderWidth:1,
    },
    buttonregister:{
        backgroundColor:'#4f86c6',
        borderRadius:5,
        padding:10,
        paddingHorizontal:100,
// borderStyle:'solid',
// borderWidth:1,
    },
    textbutton:{
        fontSize:16,
        fontWeight:'bold',
        color:'white',
    }
});