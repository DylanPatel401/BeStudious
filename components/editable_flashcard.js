import { View, StyleSheet, ScrollView, SafeAreaView,Text, TextInput,TouchableHighlight } from 'react-native';
import React, {useEffect, useState} from 'react';
import { btnView, colors, txt } from '../styles/style';


const EditableFlashcardComponent = () => {
    const [term, onChangeTerm] = React.useState('');
    const [definition, onChangeDefinition] = React.useState('');

    const [number, onChangeNumber] = React.useState('');

    const [flashcards, setFlashcards] = useState();

    const AddFlashcard = () => {
        return(
            <View style={styles.studySetCard}>
                <TextInput
                    style={styles.flashcardTerm}
                    onChangeText={onChangeTerm}
                    value={term}
                    placeholder='Term'
                    numberOfLines={2}
                />
                <View style={{borderBottomColor: 'black',borderBottomWidth: StyleSheet.hairlineWidth,}}/>
                
                <View style={styles.studySetCard}>
                        {/*allows for editable text box*/}
                <TextInput
                    style={styles.flashcardDefinition}
                    onChangeText={onChangeDefinition}
                    placeholder='Definition'
                    value={definition}/>
                </View>
            </View>            
        );

    }

    return(
        <View style={{flex:1}}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.studySetsContainer}>
                    {/* Placeholder study sets */}
                <AddFlashcard/>
            </ScrollView>

        </View>
    );
};


const styles = StyleSheet.create({
    space: {
        width: 50, 
        height: 20,
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    accountIcon: {
        padding: 5,
    },
    banner: {
        marginTop: 20,
        marginBottom: 5,
    },
    bannerText: {
        fontSize: 30,
        fontWeight: 'bold',
    },
    studySetsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        marginBottom: 0,
    },
    studySetCard: {
        flex:3,       
        marginRight: 10,
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
        elevation: 3,
    },
    studySetImage: {
        width: '100%',
        height: '70%',
        resizeMode: 'cover',
    },
    studySetTitle: {
        alignSelf: 'center',
        padding: 20,
        fontWeight: 'bold',
        fontSize: 20,
    },    
    flashcardTerm: {
        alignSelf: 'center',
        padding: 30,
        fontWeight: 'bold',
        fontSize: 18,
        height: '20%',
        width: '90%',
        margin: 15,
        borderWidth: 1,
        padding: 10,
    },
    flashcardDefinition: {
        height: '20%',
        width: '90%',
        alignSelf: 'center',
        padding: 30,
        fontWeight: 'bold',
        fontSize: 18,
        margin: 15,
        borderWidth: 1,
        padding: 10,
    }
});

export default EditableFlashcardComponent;
