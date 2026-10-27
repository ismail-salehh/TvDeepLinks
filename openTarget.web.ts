/// <reference lib="dom" />

import { Linking } from 'react-native';

// webOS can't open custom URL schemes; apps are launched by id through the
// Luna applicationManager service. Replace these with the real app ids.
const WEBOS_APP_IDS: Record<string, string> = {
  TvPhotoGallery: 'com.example.tvphotogallery',
  TvQuiz: 'com.example.tvquiz',
  TvArticles: 'com.example.tvarticles',
};

declare global {
  interface Window {
    PalmServiceBridge?: new () => {
      onservicecallback: (message: string) => void;
      call: (uri: string, params: string) => void;
    };
  }
}

const launchOnWebOS = (id: string, url: string) =>
  new Promise<void>((resolve, reject) => {
    const bridge = new window.PalmServiceBridge!();
    bridge.onservicecallback = message => {
      const response = JSON.parse(message);
      response.returnValue ? resolve() : reject(response);
    };
    bridge.call(
      'luna://com.webos.applicationManager/launch',
      JSON.stringify({ id, params: { url } }),
    );
  });

export const openTarget = (name: string, url: string) =>
  window.PalmServiceBridge && WEBOS_APP_IDS[name]
    ? launchOnWebOS(WEBOS_APP_IDS[name], url)
    : Linking.openURL(url);
