importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
 apiKey: "AIzaSyDeeqY1Ftl1R0N_YO5ZYK-3T9tyXbBx5IU",
  authDomain: "materials-cadbc.firebaseapp.com",
  projectId: "materials-cadbc",
  storageBucket: "materials-cadbc.firebasestorage.app",
  messagingSenderId: "702826779823",
  appId: "1:702826779823:web:2f7b9d651755209704305a",
  measurementId: "G-W7KXX6HDFC"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// معالجة التنبيهات في الخلفية
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon.png' // شعار موقعك الذي رفعناه
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
