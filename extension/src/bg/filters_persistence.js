define(['store/store', 'util/util'], function (Store, Util) {
  'use-strict';

  var settings = new Store("filters_persistence");
  var util = new Util();

  var module = {};

  function processFilter(filters, setting, param){
    var redirect_url = "";
    if (filters.length == 0){
      // Use cached components
      var cached_filters = settings.get(setting) || [];
      cached_filters.forEach((f) => {
        f = f.replace('+', ' ');
        redirect_url += "&" + param + "=" + encodeURIComponent(f);
      });
    }
    else {
      // Save comonents
      settings.set(setting, filters);
    }
    return redirect_url;
  }

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
            settings.set('versions_' + repo, []);
            settings.set('milestones_' + repo, []);
         }
         else {
            // Extract component filters
            var component_filters = [];
            var version_filters = [];
            var milestone_filters = [];

            filters.forEach((p) => {
              var key = p[0];
              var value = p[1];

              switch (key){
                case 'component':
                  component_filters.push(value);
                  break;
                case 'version':
                  version_filters.push(value);
                  break;
                case 'milestone':
                  milestone_filters.push(value);
                  break;
              }
            });

            redirect_url += processFilter(component_filters, 'components_' + repo, 'component');
            redirect_url += processFilter(version_filters, 'versions_' + repo, 'version');
            redirect_url += processFilter(milestone_filters, 'milestones_' + repo, 'milestone');
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
