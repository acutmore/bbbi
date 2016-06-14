; (function () {

    // Find Milestones with dates in the name
    // Move ones in the past to the end of the list
    var $milestoneSelect = $('#id_milestone');
    
    function moveToEnd(predicate) {
        $milestoneSelect.children('option').each((i, e) => {
            if (predicate(e)){
                e.remove();
                $milestoneSelect[0].appendChild(e);
            }
        });
    }
    
    // Passed dates
    moveToEnd((e) => {

        try {
            var dateStr = e.innerText.match(/\d\d\d\d[_-]\d\d[_-]\d\d/)[0];
        }
        catch (err) {
            // Ignore
            return false;
        }

        if (dateStr != null) {
            [yyyy, mm, dd] = dateStr.split(/[_-]/).map(s => parseInt(s));
            var mileStoneDate = new Date(yyyy, mm - 1, dd, 23, 59);

            if (mileStoneDate.getTime() < Date.now()) {
                return true;
            }
        }

        return false;
    });
    
    // Numeric  (starts with '3_' etc)
    moveToEnd((e) => {
        try {
            if (e.innerText.match(/^[\d]_/) != null){
                if (parseInt(e.innerText.match(/^[\d]/)[0]) >= 3){
                    return true;
                }
            };
        }
        catch (err){
            // Ignore
        }
        return false;
    });
    
    
})();

