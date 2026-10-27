import { Linking } from 'react-native';

export const openTarget = (_name: string, url: string) => Linking.openURL(url);
