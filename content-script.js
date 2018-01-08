var initJetlify = function() {
    var loadCheck = 0,
        unitList;

    var readContent = setInterval(function() {

        // Waits until page is loaded
        if (document.readyState === 'complete') {
            clearInterval(readContent);
            // Gives another beat for the dynamic content to load
            window.setTimeout(function() {
                var pricePerList = document.getElementsByClassName('price-per');

                var units = getExistingUnits(pricePerList);

                var prodList = document.getElementsByClassName('list-products')[0].children;
                console.log(prodList);
                for (prod of prodList) {
                    var content = (prod.getElementsByClassName('tile-contents'));
                }
            }, 200);
        }

        loadCheck++;
        if (loadCheck > 7) {
            clearInterval(readContent);
            console.log('ERROR: Could not read content')
            return;
        }
    }, 500)

    var getExistingUnits = function(list) {
        for (pricePerItem of list) {
            var pricePer = pricePerItem.innerHTML.replace(/[\(\)\s]/g, '').split('/');
            var amount = Number(pricePer[0].replace(/[^0-9\.-]+/g, ""));
            var unit = pricePer[1];

            if (unitList === undefined) {
                unitList = [unit];
            } else if (unitList.indexOf(unit) == -1) {
                unitList.push(unit);
            }
            console.log(unitList);

            return unitList;
        }
    }
}();