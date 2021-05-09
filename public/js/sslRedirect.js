const currentURL = window.location.href;
if (!currentURL.includes("https") && !currentURL.includes("localhost")) {
  const newURL = currentURL.replace("http", "https");
  window.location = newURL;
}
