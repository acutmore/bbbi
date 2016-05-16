require.config({
        baseUrl: "./src/bg",
        paths: {
          "store" : "/src/options_custom/lib",
          "util" : "/src/util",
        }
    });

require( ["auth"], function( Auth ) {
    var auth = new Auth();

    // Requests from injected scripts
    chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
        switch (request.action){
          case "login":
            auth.requestToken(sendResponse);
            return true; // return true -> indicates async callback response
          case "get_token":
            sendResponse({token: auth.getToken()});
            break;
         default:
            sendResponse();
       }
    });

});
