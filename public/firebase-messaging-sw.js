// This a service worker file for receiving push notifitications.
// See `Access registration token section` @ https://firebase.google.com/docs/cloud-messaging/js/client#retrieve-the-current-registration-token

// Scripts for firebase and firebase messaging
importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js");

// Initialize the Firebase app in the service worker by passing the generated config
const firebaseConfig = {
  apiKey: "AIzaSyAleNl2HtQ1eikuCF1M6bpJw0i7fkOwhDM",
  authDomain: "caminhantesapp.firebaseapp.com",
  projectId: "caminhantesapp",
  storageBucket: "caminhantesapp.appspot.com",
  messagingSenderId: "758289832430",
  appId: "1:758289832430:web:ff9bbabaa7cebb852dd6ff",
};

firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
const messaging = firebase.messaging();

// Handle incoming messages while the app is not in focus (i.e in the background, hidden behind other tabs, or completely closed).
messaging.onBackgroundMessage(function (payload) {
  console.log("Received background message ", payload);
});
