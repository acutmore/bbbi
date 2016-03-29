
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
  if (modal.active_issue_number == null) return;

  var update = window.prompt("New Title", modal.issue.title);

  if (update != null){
    updateIssue(modal.active_issue_number, {"title": update}, true);
  }
});

$('.bbbi-modal-body', modal).click((e) => {
  e.preventDefault();
  if (modal.active_issue_number == null) return;

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
      $('.bbbi-modal-title', modal).html("Issue #" + issueNumber + " " +  issue.title);
      $('.bbbi-modal-body', modal).html(issue.content);
    });
  }
};

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

function extractIssueNumber(str){
  return parseInt(str.substring( 1, str.indexOf(':')));
}
