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
	 '<span class="bbbi-modal-title bbbi-editable">No issue</span><br>' +
	'<span class="bbbi-modal-body bbbi-editable"></span><br>' +
	'<span class="bbbi-modal-actions">' +
	'<div class="aui-buttons">' +
	    '<a id="bbbi-open" class="aui-button aui-button-primary" href="">Open</a>' +
	    '<a id="bbbi-resolve" class="aui-button aui-button-primary" href="">Resolve</a>' +
	'</div>' +
	'</span>' +
	'</div>';

	$('body').append(modal_html);
	var modal = $('#bbbi-modal');
	modal.easyModal({
		top: 200,
		overlay: 0.2
	});

	$('body').append('<div class="bbbi-spinner"></div>');
	spin(false);

	$('#bbbi-open', modal).click((e) => {
		e.preventDefault();
		updateIssue(modal.issue_number, {"status": "open"}, true);
	});

	$('#bbbi-resolve', modal).click((e) => {
		e.preventDefault();
		updateIssue(modal.issue_number, {"status": "resolved"}, true);
	});

	$('.bbbi-modal-title', modal).click((e) => {
		e.preventDefault();
		if (modal.active_issue_number == null)
		  return;

		var update = window.prompt("New Title", modal.issue.title);

		if (update != null){
			updateIssue(modal.active_issue_number, {"title": update}, true);
		}
	});

	$('.bbbi-modal-body', modal).click((e) => {
		e.preventDefault();
		if (modal.active_issue_number == null)
		  return;

		var update = window.prompt("New Description", modal.issue.content);

		if (update != null){
			updateIssue(modal.active_issue_number, {"content": update}, true);
		}
	});

	modal.update = function(issueNumber, force){
		modal.issue_number = issueNumber;
    if (force || modal.active_issue_number != issueNumber){
			modal.active_issue_number = null;
			modal.issue = null;
			$('.bbbi-modal-title', modal).html("Issue #" + issueNumber);
			$('.bbbi-modal-body', modal).html("...");

			var url = getURL("/" + issueNumber)
			request(url).then((issue) => {
				modal.active_issue_number = issueNumber;
				modal.issue = issue;
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

			var editLink = $('<span>&nbsp;</span><a href="' +
				window.document.location.pathname + "/edit/" + issueNumber +
			 '"><span class="aui-icon aui-icon-small aui-iconfont-edit-small bbbi-icon" data-unicode="UTF+f141"></span></a>');
			$(elem).after(editLink);

			var modalLink = $('<span>&nbsp;</span><span class="aui-icon aui-icon-small aui-iconfont-info bbbi-icon" data-unicode="UTF+f16f"></span>');
			$(elem).after(modalLink);
			modalLink.click(()=>{
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

  spin(true);
	return fetch(url, init).then((response) => {
		spin(false);
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

function spin(show){
	var s = $('.bbbi-spinner');
	if (show)
	   s.show();
	 else
	   s.hide()
}
