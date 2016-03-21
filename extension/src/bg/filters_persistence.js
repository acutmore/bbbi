define(['store/store', 'util/util'], function (Store, Util) {
  'use-strict';

  var settings = new Store("filters_persistence");
  var util = new Util();

  var module = {};

  module.init = function(){
    chrome.webRequest.onBeforeRequest.addListener(
       (request_details) => {
         // Callback
         var repo = getRepoFromUrl(request_details.url);
         var filters = util.URLToArray(request_details.url);

         var redirect_url = request_details.url;
         if (filters.length == 0){
            // Clear cache
            settings.set('components_' + repo, []);
         }
         else {
            // Extract component filters
            var component_filters = [];
            filters.forEach((p) => {
              if (p[0] == 'component')
                component_filters.push(p[1]);
            });

            if (component_filters.length == 0){
              // Use cached components
              var cached_components = settings.get('components_' + repo) || [];
              cached_components.forEach((c_f) => {
                redirect_url += "&component=" + encodeURIComponent(c_f);
              });
            }
            else {
              // Save comonents
              settings.set('components_' + repo, component_filters);
            }
         }
         return { 'redirectUrl' : redirect_url };
       }, {
         // Filter
        'urls' : [
          'https://bitbucket.org/*/*/issues',
          'https://bitbucket.org/*/*/issues?*',
        ],
        'types' : [
          'main_frame'
        ]
       }, [
         // opt_extraInfoSpec
         'blocking'
       ]
     );
   };

  function getRepoFromUrl(url){
    var start_of_repo = util.nthIndexOfSubString(url,  '/', 2) + 1;
    var end_of_repo = util.nthIndexOfSubString(url, '/', 1, start_of_repo);
    return url.substring(start_of_repo, end_of_repo);
  }

  return module;

});
