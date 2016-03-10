var settings = new Store("settings");

chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
    if (request.action == "login"){
      requestToken(sendResponse);
      return true; // return true -> indicates async callback response
    }
    else if (request.action == "get_token")
       sendResponse({token: getToken()});
    else
      sendResponse();
});

function getToken(){
  return settings.get('token');
}

function setToken(token, refresh_token, callback){
  if (token != null){
    settings.set('token', token);

    if (refresh_token != null)
      settings.set('refresh_token', refresh_token);

    if (callback)
      callback({token: token});
  }
}

function getURLParameter(url, name) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(url)||[,""])[1].replace(/\+/g, '%20'))||null;
}

function getTokenFromCode(code){
  return fetch('https://positiveanalogue.com/bbbi/api_get_token.php?client_id=nQmYkA3EhLEWUexuzp&code=' + code)
    .then(function(response) {
    	return response.json();
    });
}

function getTokenFromRefreshToken(refresh_token){
  return fetch('https://positiveanalogue.com/bbbi/api_get_token.php?client_id=nQmYkA3EhLEWUexuzp&refresh_token=' + refresh_token)
    .then(function(response) {
      return response.json();
    });
}

function requestToken(callback) {
  var cached_refresh_token = settings.get('refresh_token');

  if (cached_refresh_token != null){
    getTokenFromRefreshToken(cached_refresh_token)
    .then(function(response){
      settings.set('refresh_token', null);
      var t = response.access_token;

      if (t != null){
        setToken(t, response.refresh_token, callback);
      }
      else
        login(callback, true);
    })
    .catch (function(err){
      settings.set('refresh_token', null);
      login(callback, true);
    });
  }
  else
    login(callback);
}

function login(callback, fallback){

  var response_type = fallback ? 'token' : 'code';

  chrome.identity.launchWebAuthFlow({
    'url': 'https://bitbucket.org/site/oauth2/authorize?client_id=nQmYkA3EhLEWUexuzp&response_type=' + response_type,
    'interactive': true
    },
    function(url) {

      if (fallback){
        setToken(getURLParameter(url, 'access_token'), callback);
      }
      else {
        // Extract code from url parameters
        var c = getURLParameter(url, 'code');

        getTokenFromCode(c).then(function(response){
          setToken(response.access_token, response.refresh_token, callback);
        }).catch(function(){
          login(callback, true);
        });
      }
    }
  );
}
