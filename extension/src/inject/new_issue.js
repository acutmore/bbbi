; (function () {

    // Find Milestones with dates in the name
    // Move ones in the past to the end of the list
    var $milestoneSelect = $('#id_milestone');
    
    $milestoneSelect.children('option').each((i, e) => {

        try {
            var dateStr = e.innerText.match(/\d\d\d\d[_-]\d\d[_-]\d\d/)[0];
        }
        catch (e) {
            // Ignore
            return;
        }

        if (dateStr != null) {
            var today = new Date();
            var currentYear = today.getFullYear();
            var currentMonth = today.getMonth();
            var currentDay = today.getDate();

            [yyyy, mm, dd] = dateStr.split(/[_-]/).map(s => parseInt(s));

            if (yyyy <= currentYear && mm <= currentMonth && dd < currentDay) {
                console.log("BBBI - moving milestone to end of list", e.innerText);
                e.remove();
                $milestoneSelect[0].appendChild(e);
            }

        }

    });
})();

