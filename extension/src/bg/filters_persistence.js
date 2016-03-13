define(['store/store'], function (Store) {
  'use-strict';

  var settings = new Store("filters_persistence");

  var module = {};

  module.init = function(){
    chrome.webRequest.onBeforeRequest.addListener(
       (request_details) => {
         // Callback
         var repo = getRepoFromUrl(request_details.url);
         var filters = URLToArray(request_details.url);

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

  function URLToArray(url) {
      var questionMark = url.indexOf('?');

      if (questionMark === -1){
        return [];
      }

      var parameters = [];
      var pairs = url.substring(questionMark + 1).split('&');
      for (var i = 0; i < pairs.length; i++) {
          if(!pairs[i])
              continue;
          var pair = pairs[i].split('=');
          parameters.push([decodeURIComponent(pair[0]), decodeURIComponent(pair[1])]);
       }
       return parameters;
  }

  function getRepoFromUrl(url){
    var start_of_repo = url.nthIndexOf("/", 0, 2) + 1;
    var end_of_repo = url.nthIndexOf("/", start_of_repo, 1);
    return url.substring(start_of_repo, end_of_repo);
  }

  String.prototype.nthIndexOf = String.prototype.nthIndexOf || function(str, start, n){
    n = n || 0;
    n = Math.max(n, 0);
    if (n === 0)
      return this.indexOf(str, start);
    else {
      var r = this.nthIndexOf(str, start, n-1);
      return r === -1 ? -1 : this.indexOf(str, 1 + r);
    }
  };

  return module;

});
