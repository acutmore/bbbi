// Send message to make sure background.js is awake
chrome.extension.sendMessage({}, (response) => {
	var readyStateCheckInterval = setInterval(() => {
		if (document.readyState === "complete") {
			clearInterval(readyStateCheckInterval);
			init();
		}
	}, 10);
});

function init(){
  var modal_html = '<div id="bbbi-modal">' +
	 '<span class="bbbi-modal-title">No issue</span><br>' +
	'<span class="bbbi-modal-body"></span><br>' +
	'<span class="bbbi-modal-actions">' +
	'<div class="aui-buttons">' +
	    '<a id="bbbi-open" class="aui-button aui-button-primary" href="">Open</a>' +
	    '<a id="bbbi-resolve" class="aui-button aui-button-primary" href="">Resolve</a>' +
	'</div>' +
	'</div>';

	$('body').append(modal_html);
	var modal = $('#bbbi-modal');
	modal.easyModal({
		top: 200,
		overlay: 0.2
	});

	$('#bbbi-open', modal).click((e) => {
		e.preventDefault();
		updateIssue(modal.active_issue_number, {"status": "open"});
	});

	$('#bbbi-resolve', modal).click((e) => {
		e.preventDefault();
		updateIssue(modal.active_issue_number, {"status": "resolved"});
	});

	modal.update = function(issueNumber, force){
    if (force || modal.active_issue_number != issueNumber){
			modal.active_issue_number = null;
			$('.bbbi-modal-title', modal).html("Issue #" + issueNumber);
			$('.bbbi-modal-body', modal).html("...");

			var url = getURL("/" + issueNumber)
			request(url).then((issue) => {
				modal.active_issue_number = issueNumber;
				$('.bbbi-modal-title', modal).html("Issue #" + issueNumber + " " +	issue.title);
				$('.bbbi-modal-body', modal).html(issue.content);
			});
	  }
	};

  getToken((t) => { request.token = t; });

	// For each link to issue
	$('.issues-list tbody tr .execute').each( (i, elem) => {
		// Extract issue number from link text
		var issueNumber =  extractIssueNumber(elem.title);
		if (issueNumber != null && issueNumber != NaN){

			var editLink = $($('<span class="bbbi-plus"></span>')[0]);
			$(elem).after(editLink);
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
	chrome.runtime.sendMessage({action: "get_token"}, (response) => {
		consumer(response.token);
	});
}

function getURL(path){
	return "https://api.bitbucket.org/1.0/repositories" + document.location.pathname + path;
}

function request(url, init, headers, no_retry){
	if (headers == null)
		headers = new Headers();

	headers.set("Authorization", "Bearer " + request.token)

	if (init == null)
	  init = {};

	init.headers = headers;

	return fetch(url, init).then((response) => {
		if (response.ok)
	    return response.json();
		else if (response.status == 401 && !no_retry){
			// Token invalid / expired
			return login().then(() => {
					return request(url, init, headers, no_retry);
			});
		}
		else
		  throw new Error("unknown request response state");
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

function updateIssue(issueNumber, update){
	if (issueNumber != null){

		var headers = new Headers();
		headers.append("Content-Type", "application/json");

		var url = getURL("/" + issueNumber);

		request(url, {
			  method: 'PUT',
			  body: JSON.stringify(update)
		  },
	    headers
		).then((issue) => {
		     location.reload();
		});
	}
}
