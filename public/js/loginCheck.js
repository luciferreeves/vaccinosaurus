checkForLogin();
function checkForLogin() {
  if (localStorage.getItem("UID")) {
    if (
      window.location.pathname !== "/account" &&
      window.location.pathname !== "/"
    ) {
      window.location = `${window.location.origin}/account`;
    }
    if (document.getElementById("notifyMeButton")) {
      document.getElementById("notifyMeButton").innerHTML = "My Account";
      document.getElementById("logout-button").style.display = "block";
    }
  } else {
    if (
      window.location.pathname !== "/notify" &&
      window.location.pathname !== "/"
    ) {
      window.location = `${window.location.origin}/notify`;
    }
  }
}
