import React, { useEffect, useState } from 'react';
import { TouchableWithoutFeedback, StyleSheet, View, Image, Keyboard, BackHandler, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as API from '../../api/apiMethods';
import { Layout, Text, Icon, Input, Button, CheckBox, Tooltip } from '@ui-kitten/components';
import Board from '../main/board';
import { colors, labels, spacing } from '../../style/base';
import { Linking } from 'react-native';

const AlertIcon = (props) => (
    <Icon {...props} name='alert-circle-outline'/>
);

const Registration = ({navigation}) => {
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [errorPath, setErrorPath] = useState('');
    const [secureTextEntry, setSecureTextEntry] = useState(true);
    const [termsChecked, setTermsChecked] = useState(false);
    const [termsVisible, setTermsVisible] = useState(false);

    const toggleSecureEntry = () => {
        setSecureTextEntry(!secureTextEntry);
    };
    
    const renderEyeIcon = (props) => (
        <TouchableWithoutFeedback onPress={toggleSecureEntry}>
            <Icon {...props} name={secureTextEntry ? 'eye-off' : 'eye'}/>
        </TouchableWithoutFeedback>
    );

    const renderPersonIcon = (props) => (
        <View>
            <Icon {...props} name={'person'}/>
        </View>
    );

    const renderEmailIcon = (props) => (
        <View>
            <Icon {...props} name={'email'}/>
        </View>
    );

    const TermsNoteButton = () => {
        return (
            <TouchableOpacity style={{ marginBottom: 15 }} onPress={() => setTermsVisible(true)}>
                <Text style={{ color: 'grey', fontWeight: 'bold' }}>Warunki użytkowania  </Text>
            </TouchableOpacity>
        );
    }

    const renderNameCaption = () => {
        return (
        <View style={styles.captionContainer}>
            {AlertIcon(styles.captionIcon)}
            <Text style={styles.captionText}>{errorPath === 'name' ? errorMessage : ''}</Text>
        </View>
        )
    }
    
    const renderEmailCaption = () => {
        return (
        <View style={styles.captionContainer}>
            {AlertIcon(styles.captionIcon)}
            <Text style={styles.captionText}>{errorPath === 'email' ? errorMessage : ''}</Text>
        </View>
        )
    }

    const renderPasswordCaption = () => {
        return (
        <View style={styles.captionContainer}>
            {AlertIcon(styles.captionIcon)}
            <Text style={styles.captionText}>{errorPath === 'password' ? errorMessage : ''}</Text>
        </View>
        )
    }

    async function connect(){
        Keyboard.dismiss();
        try {
            const response = await API.register({
                name: name,
                email: email,
                password: password
            });
            if (response.status === 200) {
                setErrorPath(''),
                navigation.navigate('Login');
			}
        } catch (error) {
            if (error.response.status === 400) {
                setErrorPath(error.response.data.path),
                setErrorMessage(error.response.data.message)
            }
        }
    }

    return(
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <Layout style={{flex: 1, justifyContent: 'center', backgroundColor: colors.appLightBackground,}}>
                {termsVisible ?
                    <View style={{ alignSelf: 'flex-start', marginTop: 60 }}>
                        <Text style={{ ...labels.qsp, textAlign: 'center', fontWeight: 'bold', marginHorizontal: 50, marginBottom: spacing.md }}>Warunki użytkowania aplikacji Applant &copy;</Text>
                        <ScrollView>
                            <Text style={{ ...labels.qsm, textAlign: 'center', marginHorizontal: spacing.md }}>
                                1. Dostęp i korzystanie z aplikacji Applant jest uzależnione od ukończenia procedury rejestracji za pomocą nazwy użytkownika, adresu e-mail i hasła.{"\n"}
                                2. Rejestracja zostaje zakończona z chwilą poprawnego uzupełnienia wumaganych pól w formularzu rejestracji.{"\n"}
                                3. Właściciel aplikacji zastrzega sobie prawo do wprowadzania zmian w zakresie usług i funkcji oferowanych w aplikacji Applant.{"\n"}
                                4. Korzystanie z aplikacji Applant możliwe jest na urządzeniach posiadających system operacyjny Android 11 lub nowszy.{"\n"}
                                5. Do pełnego działania wszystkich funkcji aplikacja Applant wymaga pozwolenia na korzystanie z lokalizacji.{"\n"}
                                6. Korzystanie z tej aplikacji jest dozwolone wyłącznie w celach osobistych i niekomercyjnych. Zabronione jest jej rozpowszechnianie lub przekształcanie w całości lub częściowo.{"\n"}
                                7. Korzystając z aplikacji użytkownik zobowiązuje się do odpowiedniego zachowania w konwersacjach z innymi użytkownikami – rozmowę z szacunkiem, bez wulgaryzmów i w oparciu o kulturę osobistą. 
                                W przeciwnym razie administrator po zgłoszeniu konta użytkownika może je usunąć lub zawiesić do niego dostęp.{"\n\n"}
                                {/* <Text><a href='kontakt.kpp@gmail.com'>kontak.kpp@gmail.com</a></Text> */}
                                <Text style={{ color: colors.greenDark }}
                                    onPress={() => Linking.openURL('mailto:applant.appplant@gmail.com')}>
                                    applant.appplant@gmail.com
                                </Text>
                            </Text>
                        </ScrollView>
                        <Button style={{marginHorizontal: spacing.md, marginBottom: spacing.sm}} onPress={() => setTermsVisible(false)}>POWRÓT</Button>
                    </View> : 
                    <>
                    <Image
                        source={require('../../assets/background1.png')}
                        style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                        }}
                    />
                    <TouchableOpacity style={{position: 'absolute', left: 20, top: 40}} onPress={() => navigation.navigate('Login')}>
                        <Icon fill='white' name={'arrow-back'} style={{width: 35, height:35}}/>
                    </TouchableOpacity>
                    <Text style={{color: 'black', fontSize: 50, fontFamily: 'Quicksand', alignSelf: 'center', marginBottom: 20}}>Witaj!</Text>
                    <Text style={{color: 'black', fontSize: 20, fontFamily: 'Quicksand', alignSelf: 'center'}}>Zarejestruj się w Applant</Text>
                    <View 
                    style={{
                        marginHorizontal: 20, 
                        paddingHorizontal: 10, 
                        justifyContent: "center", 
                        backgroundColor: "#F1F1F1", 
                        paddingVertical: 30,
                        marginVertical: 70,
                        borderRadius: 10,
                        elevation: 20,
                    }}
                    >
                    <Input
                        value={name}
                        placeholder='Nazwa użytkownika'
                        status={errorPath === 'name' ? 'danger' : 'basic'}
                        caption={errorPath === 'name' ? renderNameCaption : <></>}
                        accessoryRight={renderPersonIcon}
                        onChangeText={nextValue => setName(nextValue)}
                        style={{marginBottom: errorPath === 'name' ? 0 : 18}}
                    />
                    <Input
                        value={email}
                        placeholder='Email'
                        status={errorPath === 'email' ? 'danger' : 'basic'}
                        caption={errorPath === 'email' ? renderEmailCaption : <></>}
                        accessoryRight={renderEmailIcon}
                        onChangeText={nextValue => setEmail(nextValue)}
                        style={{marginBottom: errorPath === 'email' ? 0 : 18}}
                    />
                    <Input
                        value={password}
                        placeholder='Hasło'
                        status={errorPath === 'password' ? 'danger' : 'basic'}
                        caption={errorPath === 'password' ? renderPasswordCaption : <></>}
                        accessoryRight={renderEyeIcon}
                        secureTextEntry={secureTextEntry}
                        onChangeText={nextValue => setPassword(nextValue)}
                        style={{marginBottom: errorPath === 'password' ? 0 : 18}}
                    />
                    <View style={{alignSelf: 'flex-end', flexDirection: 'row'}}>
                        <Tooltip
                            anchor={TermsNoteButton}
                            visible={tooltipVisible}
                            onBackdropPress={() => setTooltipVisible(false)}>
                            Dostępne wkrótce!
                        </Tooltip>
                        
                        <CheckBox
                            style={{width: 20, height: 20, marginRight: 5}}
                            checked={termsChecked}
                            onChange={nextChecked => setTermsChecked(nextChecked)}>
                        </CheckBox>
                    </View>
                    <Button disabled={!termsChecked} onPress={() => connect()}>ZAREJESTRUJ</Button>
                    </View>
                    <View style={{bottom: 20, position: 'absolute', flexDirection: 'row', alignSelf: 'center'}}>
                        <Text style={{
                            padding: 3,
                            backgroundColor: 'rgba(245,245,245, 0.5)',
                            borderTopLeftRadius: 5,
                            borderBottomLeftRadius: 5,
                            fontSize: 17, 
                            color: 'black', 
                            fontFamily: 'Quicksand'
                        }}> Posiadasz konto? </Text> 
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={{
                                padding: 3,
                                backgroundColor: 'rgba(245,245,245, 0.5)',
                                borderTopRightRadius: 5,
                                borderBottomRightRadius: 5,
                                fontWeight:'bold', 
                                fontSize: 17, 
                                color: 'black', 
                                fontFamily: 'Quicksand'
                            }}>Zaloguj się</Text>
                        </TouchableOpacity> 
                    </View>
                    </>
                }
            </Layout>
        </TouchableWithoutFeedback>
    )
};

const styles = StyleSheet.create({
    captionContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
    },
    captionIcon: {
        width: 10,
        height: 10,
        marginRight: 5
    },
    captionText: {
        fontSize: 12,
        fontWeight: "400",
        alignSelf: 'flex-start',
        color: "grey",
    }
});

export default Registration;

