import { StyleSheet, Dimensions } from "react-native";

let deviceHeight = Dimensions.get('window').height;
let deviceWidth = Dimensions.get('window').width;


//global styles
const colors =  StyleSheet.create({
    background: 'white',
    primary: 'black',
    secondary: '#363636',

    //bar colors
    topBar: 'black',
    bottomBar: '#363636',
    barText: 'white',

    //button colors
    buttonBg: 'teal',

});


const txt = StyleSheet.create({
    regularText: {fontFamily: 'lexend-regular', fontSize:  16, color: 'black'},
    smallText: {fontFamily: 'lexend-regular', fontSize:  14, color: 'black'},
    mediumText: {fontFamily: 'lexend-regular', fontSize:  22, color: 'black'},
})

const btnView = StyleSheet.create({
    main: {flex:1, backgroundColor: colors.secondary},
    //input not button
    inputBox: {height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingLeft:10}

})

export {txt, colors, btnView}