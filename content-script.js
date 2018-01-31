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

                // Gets all pre-listed price per blocks
                var pricePerList = document.getElementsByClassName('price-per');

                // Gets pre-listed units
                units = getExistingUnits(pricePerList);

                var prodList = document.getElementsByClassName('list-products')[0].children;

                for (prod of prodList) {
                    var content = (prod.getElementsByClassName('tile-contents'));
                    var title = content[0].childNodes[0].getElementsByClassName('name')[0].textContent.toLowerCase();
                    var pricingBlock = content[0].childNodes[1];

                    pricePer = prod.getElementsByClassName('price-per')[0];

                    var price = pricingBlock.getAttribute('data-price');

                    if (typeof pricePer != 'undefined') {
                        pricingBlock = [price, pricePer.innerHTML];
                    } else {
                        pricingBlock = [price];
                    }

                    var finalPer = findUnit(title, pricingBlock, units);

                    if (finalPer != undefined) {
                        appendPer(prod, finalPer);
                    } else {
                        console.log('No price per found');
                    }
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

    var findUnit = function(title, price, unitKey) {
        var unitPer;
        for (unit of unitKey) {
            if (title.indexOf(unit) >= 0) { // 
                unitPer = calculatePerItem(title, price, unit);
                break;
            } else {
                for (unitType of unitKey) {
                    var unitInKey = unitType.indexOf(unit);
                    if (unitInKey >= 0) {
                        for (unitAbbrev of unitType) {
                            if (title.indexOf(unitAbbrev) >= 0) {
                                unitPer = calculatePerItem(title, price, unitAbbrev);
                                break;
                            }
                        }
                    }
                }
            }
        }
        return unitPer;
    };

    var calculatePerItem = function(title, price, unit) {
        var numItems = title.match(/[0-9]+/g);

        if (numItems.length === 1) {
            return Number.parseFloat(price[0] / numItems[0]).toFixed(4);
        }

    };

    var appendPer = function(product, finalPer, unit) {
        
        var priceValue = document.createTextNode('($' + finalPer + '/Count)');

        var priceNode = document.createElement('p').appendChild(priceValue);

        product = product.getElementsByClassName('price-std-block')[0];
        product.append(priceNode);
    }

    var unitKey = [
        ['count', 'ct', 'cnt'],
        ['ounces', 'oz', 'ounce']
    ];
}();