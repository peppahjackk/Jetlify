var initJetlify = function() {
    var loadCheck = 0,
        unitList,
        units,
        pricePer;

    var readContent = setInterval(function() {

        // Waits until page is loaded
        if (document.readyState === 'complete') {
            clearInterval(readContent);
            // Gives another beat for the dynamic content to load
            window.setTimeout(function() {
                var pricePerList = document.getElementsByClassName('price-per');
                units = getExistingUnits(pricePerList);
                var prodList = document.getElementsByClassName('list-products')[0].children;

                for (prod of prodList) {
                    var content = (prod.getElementsByClassName('tile-contents'));
                    var title = content[0].childNodes[0].getElementsByClassName('name')[0].textContent.toLowerCase();
                    var pricingBlock = content[0].childNodes[1];

                    pricePer = prod.getElementsByClassName('price-per')[0];

                    if (typeof pricePer != 'undefined') {
                        pricingBlock = [pricingBlock.getElementsByClassName('price-std-block')[0].textContent, pricePer.innerHTML];
                    } else {
                        pricingBlock = [pricingBlock.getElementsByClassName('price-std-block')[0].textContent];
                    }

                    calculatePerItem(title, pricingBlock, units);

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
            var unit = pricePer[1].toLowerCase();

            if (unitList === undefined) {
                unitList = [unit];
            } else if (unitList.indexOf(unit) == -1) {
                unitList.push(unit);
            }

            return unitList;
        }
    };

    var calculatePerItem = function(title, price, units) {
        for (unit of units) {
            if (title.indexOf(unit) >= 0) {
                console.log('title contains exact');
            } else {
                for (unitType of unitKey) {
                    var unitInKey = unitType.indexOf(unit);
                    if (unitInKey >= 0) {
                        for (unitAbbrev of unitType) {
                            console.log(unitAbbrev);
                            if (title.indexOf(unitAbbrev) >= 0) {
                                console.log('title contains similar');
                            }
                        }
                    }
                }
            }

        }
        console.log(title, price, units);
    };

    var unitKey = [
        ['count', 'ct', 'cnt'],
        ['ounces', 'oz', 'ounce']
    ];
}();