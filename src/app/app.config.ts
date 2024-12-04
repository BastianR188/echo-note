import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { initializeApp, initializeApp as initializeApp_alias, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, getFirestore as getFirestore_alias, provideFirestore } from '@angular/fire/firestore';
import { getStorage, getStorage as getStorage_alias, provideStorage } from '@angular/fire/storage';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(), provideFirebaseApp(() => initializeApp({"projectId":"memoflow-65786","appId":"1:138143599983:web:86b847ff63810ef84c2c9a","databaseURL":"https://memoflow-65786-default-rtdb.europe-west1.firebasedatabase.app","storageBucket":"memoflow-65786.appspot.com"
      ,"apiKey":"AIzaSyDHZqPuJ3PZ3auol1Gu_XXoTr5z1bbPRb4","authDomain":"memoflow-65786.firebaseapp.com","messagingSenderId":"138143599983"})), provideFirestore(() => getFirestore()), provideStorage(() => getStorage()),
  ]
};



