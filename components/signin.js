import {
    GoogleSignin,
    statusCodes,
  } from '@react-native-google-signin/google-signin';
import { Register } from '../atomics/api/GlobalFunctions';
import { saveToken } from '../securestore/ExpoSecureStore';

  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfos = await GoogleSignin.signIn();
      const userInfo = userInfos.data
      console.log(userInfo)
      console.log(userInfos)
      const response = await Register(null, null, null, {
        email: userInfo.user.email,
        name: userInfo.user.name,
        id: userInfo.user.id,
        photo: userInfo.user.photo,
      });
      if(response[0].result==1){
        let userToken = response[2]?.userToken;
        let userInfos = response[3]?.userName;
        await saveToken(userInfos,userToken);
        return 1;
      }else{
        let userToken = userInfo.user.id;
        let userInfos = userInfo.user.name;
        await saveToken(userInfos,userToken);
        return 1;
      }
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('Kullanıcı girişi iptal edildi');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('İşlem devam ediyor');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('Play Services mevcut değil');
      } else {
        console.log('Diğer hata:', error);
      }
      throw error;
    }
  };

  export default signIn;
