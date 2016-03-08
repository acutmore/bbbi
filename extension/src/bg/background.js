var settings = new Store("settings");

chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
    if (request.action == "login")
      return login(sendResponse); // return true -> indicates async response
    else if (request.action == "get_token")
       sendResponse({token: getToken()});
    else
      sendResponse();
});

function getToken(){
  return settings.get('token');
}

function login(callback){
  chrome.identity.launchWebAuthFlow({
    'url': 'https://bitbucket.org/site/oauth2/authorize?client_id=nQmYkA3EhLEWUexuzp&response_type=token',
    'interactive': true
    },
    function(url) {
      // Extract token from url parameters
      var t = url.substring(url.indexOf("access_token=") + "access_token=".length);
      t = t.substring(0, t.indexOf('&'));
      t = window.decodeURIComponent(t);
      settings.set("token", t);
      if (callback)
        callback({token: t});
    }
  );
  return true;

}
