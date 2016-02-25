// Send message to make sure background.js is awake
chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
		if (document.readyState === "complete") {
			clearInterval(readyStateCheckInterval);
			init();
		}
	}, 10);
});

function init(){

	$('body').append('<span id="bbbi-modal"><span id="bbbi_title">No issue</span><br><span id="bbbi_body"></span></span>');
	var modal = $('#bbbi-modal');
	modal.easyModal({
		top: 200,
		overlay: 0.2
	});

	modal.update = function(issueNumber){
		$('#bbbi_title', modal).html("Issue #" + issueNumber);
		var url = getURL("/" + issueNumber)
		request(url).then((issue) => {
			$('#bbbi_title', modal).html("#" + issueNumber + " " +	issue.title);
			$('#bbbi_body', modal).html(issue.content);
		});
	};

  var token;
  getToken(function(t){ token = t; request.token = t; });

	// For each link to issue
	$('.issues-list tbody tr .execute').each( (i, elem) => {
		// Extract issue number from link text
		var issueNumber =  extractIssueNumber(elem.title);
		if (issueNumber != null && issueNumber != NaN){

			var editLink = $($('<span>+</span>')[0]);
			$(elem).after('&nbsp;', editLink);
			editLink.click(()=>{
				modal.update(issueNumber);
			  modal.trigger('openModal');
			});
		}
	});
}

function extractIssueNumber(str){
	  return parseInt(str.substring( 1, str.indexOf(':')));
}

function getToken(consumer){
	chrome.runtime.sendMessage({action: "get_token"}, function(response) {
		consumer(response.token);
	});
}

function getURL(path){
	return "https://api.bitbucket.org/1.0/repositories" + document.location.pathname + path;
}

function request(url){

	var myHeaders = new Headers();
	myHeaders.append("Authorization", "Bearer " + request.token)
	var myInit = { headers: myHeaders };

	return fetch(url, myInit).then(function(response) {
    return response.json();
	});
}
