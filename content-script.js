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

                console.log(document.getElementsByClassName('list-products'));
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

                    var itemUnit = findUnit(title, pricingBlock, units);

                    if (itemUnit) {
                        var finalPer = calculatePerItem(title, pricingBlock, itemUnit.inTitle);
                    }

                    if (finalPer != undefined) {
                        appendPer(prod, finalPer, itemUnit.asPer);
                    } else {
                        console.log('No price per found');
                    }
                }
            }, 300);
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

    var findUnit = function(title, price, unitList) {
        var unitPer;
        for (unit of unitList) {
            // Checks for exact unit match in title
            if (title.indexOf(unit) >= 0) {
                return {
                    inTitle:unit,
                    asPer:unit
                };
            } else {
                // Checks for unit abbreviation
                for (unitType of unitKey) {
                    // Checks if each key array has the pre-listed unit
                    var unitHasAlt = unitType.indexOf(unit);
                    if (unitHasAlt >= 0) {
                        for (unitAlt of unitType) {
                            if (title.indexOf(unitAlt) >= 0) {
                                return {
                                    inTitle: unitAlt,
                                    asPer: unit
                                };
                            }
                        }
                        
                    }
                }
            }
        }
        return false;
    };

    var calculatePerItem = function(title, price, unit) {
        var quantities = title.match(/[0-9.]+/g);


        return quantities.length === 1 ? Number.parseFloat(price[0] / quantities[0]).toFixed(4) : Number.parseFloat(price[0] / getClosestQuantity(quantities,title,unit)).toFixed(4);

    };

    var getClosestQuantity = function(quantities,title,unit) {
        var unitIndex = title.indexOf(unit);

        var minDistance = title.length;
        var closestNum;

        for (num of quantities) {
            var numIndex = title.indexOf(num);
            var numDistance = unitIndex - numIndex;

            // If numOccurance is before unit set as closest If past, return previous num
            if (numDistance > 0) {
                closestNum = num;
            } else if (numDistance < 0) {
                return closestNum;
            }
        }
        return closestNum;
    }

    var appendPer = function(product, finalPer, unit) {

        var priceValue = document.createTextNode('($' + finalPer + '/' + unit + ')');

        var priceNode = document.createElement('p').appendChild(priceValue);

        product = product.getElementsByClassName('price-std-block')[0];
        product.append(priceNode);
    }

    var unitKey = [
        ['count', 'ct', 'cnt', 'sheets'],
        ['ounces', 'oz', 'ounce']
    ];
}();