const firebaseConfig = {
  apiKey: "AIzaSyDFSOXNMBmF4yXEFuowvdl_y-M0LbZoTGg",
  authDomain: "vaccinosaurus.firebaseapp.com",
  projectId: "vaccinosaurus",
  storageBucket: "vaccinosaurus.appspot.com",
  messagingSenderId: "349629911678",
  appId: "1:349629911678:web:f7a12eaccd9e0b5bc87e2f",
};

firebase.initializeApp(firebaseConfig);

function myAccount() {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      if (window.location.pathname !== "/account") {
        window.location = `${window.location.origin}/account`;
      }
    } else {
      if (window.location.pathname !== "/notify") {
        window.location = `${window.location.origin}/notify`;
      }
    }
  });
}

function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase
    .auth()
    .signInWithPopup(provider)
    .then((result) => {
      /** @type {firebase.auth.OAuthCredential} */
      var credential = result.credential;
      var token = credential.accessToken;
      var user = result.user;
      window.localStorage.setItem("UID", user.uid);
      window.location = `${window.location.origin}/account`;
    })
    .catch((error) => {
      var errorMessage = error.message;
      alert(errorMessage);
    });
}

function logout() {
  firebase
    .auth()
    .signOut()
    .then(() => {
      window.localStorage.clear();
      window.location = `${window.location.origin}`;
    })
    .catch((error) => {
      alert("Error: Unable to log out.");
    });
}
