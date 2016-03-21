define([], function () {

  function Util(){};

  Util.prototype.getURLParameter = function (url, name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(url)||[,""])[1].replace(/\+/g, '%20'))||null;
  };

  Util.prototype.URLToArray = function (url) {
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
  };

  Util.prototype.nthIndexOfSubString = function fn(str, substr, n, start){
    n = n || 0;
    n = Math.max(n, 0);

    if (n === 0 || substr.length === 0) {
      return String.prototype.indexOf.call(str, substr, start);
    }

    var r = fn(str, substr, n-1, start);
    return r === -1 ? -1 : String.prototype.indexOf.call(str, substr, 1 + r);
  };

  return Util;

});
