wakeUpBackground().then(getToken).then((t) => { request.token = t; });

var spin = (function(){

  var spinner = $('<div class="bbbi-spinner"></div>');
  spinner.hide();
  $('body').append(spinner);

  return function(show){
    if (show) spinner.show();
    else spinner.hide();
  };

})();

function sendMessageToBackend(action){
  return new Promise(function(resolve, reject){
    chrome.runtime.sendMessage({action}, resolve);
  });
}

function wakeUpBackground(){
  return sendMessageToBackend('WAKEUP').then( r => {
    return r == null ? wakeUpBackground() : Promise.resolve();
  });
}

function getToken(){
  return sendMessageToBackend('get_token').then((r) => r.token);
}

function request(url, init, headers, no_retry){

  if (headers == null) headers = new Headers();
  if (init == null) init = {};

  headers.set("Authorization", "Bearer " + request.token);
  init.headers = headers;

  spin(true);
  return fetch(url, init).then((response) => {
    spin(false);
    if (response.ok){
      return response.json();
    }
    else if (response.status == 401 && !no_retry){
      // Token invalid / expired
      return login().then(() => {
          return request(url, init, headers, no_retry);
      });
    }
    else {
      throw new Error("unknown request response state");
    }
  }).catch((e) => {
    spin(false);
    return Promise.reject(e);
  });
}

function login(){
  return sendMessageToBackend('login').then((response) => {
      request.token = response.token;
      return response.token;
  });
}

function updateIssue(issueNumber, update){
  if (issueNumber != null){

    var headers = new Headers();
    headers.append("Content-Type", "application/json");

    var url = getURL("/" + issueNumber);

    return request(url, {
        method: 'PUT',
        body: JSON.stringify(update)
      },
      headers
    );
  }

  return Promise.reject('no issue number');
}

function getURL(path){
  return "https://api.bitbucket.org/1.0/repositories" + document.location.pathname + path;
}
