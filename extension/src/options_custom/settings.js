window.addEvent("domready", function () {

    new FancySettings.initWithManifest(function (settings) {
        settings.manifest.auth_button.addEvent("action", function () {
          chrome.runtime.sendMessage({action: "login"}, function(){
             location.reload();  
          });
        });
    });

});
