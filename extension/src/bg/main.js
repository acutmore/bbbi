require.config({
        baseUrl: "./src/bg",
        paths: {
          "store" : "/src/options_custom/lib"
        }
    });

require( [ "store/store", "auth" ], function(  Store, Auth ) {
    var settings = new Store("settings");
    var auth = new Auth();

    // Requests from injected scripts
    ///////////////////////////////////////////////////////////////////////////
    chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
        if (request.action == "login"){
          auth.requestToken(sendResponse);
          return true; // return true -> indicates async callback response
        }
        else if (request.action == "get_token")
          sendResponse({token: auth.getToken()});
        else
          sendResponse();
    });
  
});
