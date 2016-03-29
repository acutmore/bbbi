getToken((t) => { request.token = t; });

var spin = (function(){

  var spinner = $('<div class="bbbi-spinner"></div>');
  spinner.hide();
  $('body').append(spinner);

  return function(show){
    if (show) spinner.show();
    else spinner.hide();
  };

})();

function getToken(consumer){
  chrome.runtime.sendMessage({action: "get_token"}, (response) => {
    consumer(response.token);
  });
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
  return new Promise( (resolve, reject) => {
    chrome.runtime.sendMessage({action: "login"}, (response) => {
      request.token = response.token;
      resolve(response.token);
    });
  });
}

function updateIssue(issueNumber, update, reload){
  if (issueNumber != null){

    var headers = new Headers();
    headers.append("Content-Type", "application/json");

    var url = getURL("/" + issueNumber);

    return request(url, {
        method: 'PUT',
        body: JSON.stringify(update)
      },
      headers
    ).then((issue) => {
      if (reload)
         location.reload();
      else {
        return issue;
      }
    });
  }

  return Promise.reject('no issue number');
}

function getURL(path){
  return "https://api.bitbucket.org/1.0/repositories" + document.location.pathname + path;
}
