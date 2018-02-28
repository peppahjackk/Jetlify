var initJetlify = function() {
    var loadCheck = 0,
        unitList = [],
        priceList = [],
        medianPrice,
        avgPrice,
        units;

    var readContent = setInterval(function() {

        // Waits until page is loaded
        if (document.readyState === 'complete') {
            clearInterval(readContent);
            // Gives another beat for the dynamic content to load
            window.setTimeout(function() {
                setItemListeners();
                // Gets all pre-listed price per blocks
                var pricePerList = document.getElementsByClassName('price-per');

                // Gets pre-listed units
                units = getExistingUnits(pricePerList);

                medianPrice = getMedian(priceList);

                var prodList = document.getElementsByClassName('list-products')[0].children;

                for (prod of prodList) {
                    try {
                        var content = (prod.getElementsByClassName('tile-contents'));
                        var title = content[0].childNodes[0].getElementsByClassName('name')[0].textContent.toLowerCase();
                        var pricingBlock = content[0].childNodes[1];
                        var onSale = false;
                        var itemUnit;
                        var finalPer = false;
                        var hasPerUnit = false;

                        var pricePer = prod.getElementsByClassName('price-per');

                        var price = pricingBlock.getAttribute('data-price');

                        if (prod.getElementsByClassName('price-now').length) {
                            price = prod.getElementsByClassName('price-now')[0].textContent;

                            onSale = true;
                            price = price.replace(/[$,]+/g, "");
                        }

                        if (typeof pricePer[0] != 'undefined') {
                            pricingBlock = [price, getPrice(pricePer[0])];
                            pricePer = getUnit(pricePer[0]);
                            hasPerUnit = true;
                        } else {
                            pricingBlock = [price];
                        }

                        var itemUnit = findUnit(title, pricingBlock, units);
                        if (itemUnit) {
                            finalPer = calculatePerItem(title, pricingBlock, itemUnit.inTitle);
                        }

                        deleteOldPerlify(prod);

                        if (finalPer) {
                            if (!hasPerUnit) {
                                appendPer(prod, finalPer, itemUnit.inTitle, onSale);
                            } else {
                                appendPer(prod, finalPer, pricePer, onSale);
                            }
                        } else {
                            console.log('No price per found');
                            appendErr(prod, onSale);
                        }
                    } catch (err) {
                        console.error(err);
                        appendErr(prod, err);
                    }
                }
                var today = new Date();
                var pricePerlifyList = document.getElementsByClassName('price-perlify');

                styleNodes(pricePerlifyList, ['pending', 'green']);


            }, 500);
        }

        loadCheck++;
        if (loadCheck > 7) {
            clearInterval(readContent);
            console.log('ERROR: Could not read content')
            return;
        }


    }, 500)

    var getExistingUnits = function(list) {
        var existingUnits = [];

        for (pricePerItem of list) {
            var unit = getUnit(pricePerItem);
            var price = parseFloat(getPrice(pricePerItem));

            if (existingUnits.indexOf(unit) == -1) {
                existingUnits.push(unit);
            }

            priceList.push(price);
        }

        return existingUnits;
    };

    var getUnit = function(item) {
        var pricePer = item.innerHTML.replace(/[\(\)]/g, '').split('/');
        var unit = pricePer[1].toLowerCase();

        return unit;
    };

    var getPrice = function(item) {
        var itemPrice = item.innerHTML.replace(/[\(\)]/g, '').split('/');
        return itemPrice[0].substr(2);
    };

    var getAverage = function(list) {
        return list.reduce(function(a, b) {
            return a + b
        }) / list.length;
    };

    var getMedian = function(numbers) {
        var median = 0,
            numsLen = numbers.length;
        numbers.sort();

        if (
            numsLen % 2 === 0 // is even
        ) {
            // average of two middle numbers
            median = (numbers[numsLen / 2 - 1] + numbers[numsLen / 2]) / 2;
        } else { // is odd
            // middle number only
            median = numbers[(numsLen - 1) / 2];
        }

        return median;
    }

    var findUnit = function(title, price, unitList) {
        var unitPer;

        for (unit of unitList) {
            // Checks for exact unit match in title
            if (title.indexOf(unit) >= 0) {
                return {
                    inTitle: unit,
                    asPer: unit
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

        return quantities.length === 1 ?
            Number.parseFloat(price[0] / quantities[0]).toFixed(4) :
            assertMultipleQuantities(title, price, unit, quantities);
    };

    var assertMultipleQuantities = function(title, price, unit, quantities) {

        var closestQuantity = getClosestQuantity(quantities, title, unit);
        var newPricePer = Number.parseFloat(price[0] / closestQuantity).toFixed(4);

        if (price[1] == null) {
            price[1] = medianPrice;
        }
            console.log('has price per: ' + (price[1]) + '. With got: ' + newPricePer + ' with ' + closestQuantity);
            console.log(quantities, title, unit)
            // If our price is significantly more than theirs or the median, try to multiply with next quantity
            if (newPricePer > (price[1] * 1.7) && newPricePer >= (medianPrice * 1.7)) {
                quantities = remove(quantities, closestQuantity);
                // Iterate through other number values in title
                while (quantities.length) {
                    var tempPricePer = (newPricePer / quantities[quantities.length - 1]).toFixed(4);
                    console.log('has price per: ' + (price[1]) + '. With got: ' + tempPricePer + ' with ' + quantities[quantities.length - 1]);
                    if (tempPricePer <= price[1] * 1.3 || tempPricePer <= (medianPrice * 1.3)) { 
                        console.log('Chosen')
                        return tempPricePer; // Latest calculation is close to theirs/the median
                    } else {
                        quantities.pop();
                    }
                }
                return newPricePer; // Return our first guess
            } else {
                return newPricePer; // Our first calculation was likely correct!
            }
        
    }

    var remove = function(array, el) {
        return array.filter(e => e !== el);
    }

    var getClosestQuantity = function(quantities, title, unit) {
        var unitSearch = '[\\W\\d](' + unit + ')';
        var re = new RegExp(unitSearch);
        var unitIndex = title.match(re).index; // Needs to make sure unit is flanked by word boundary or symbol

        console.log(unitSearch, unitIndex);
        var minDistance = title.length;
        var closestNum;

        for (num of quantities) {
            var numIndex = title.indexOf(num);
            var numDistance = unitIndex - numIndex;

            console.log(num, numDistance);
            // If numOccurance is before unit set as closest If past, return previous num
            if (numDistance > 0) {
                closestNum = num;
            } else if (numDistance < 0) {
                console.log(closestNum);
                return closestNum;
            }
        }
        return closestNum;
    }

    var appendPer = function(product, finalPer, unit, onSale) {
        var priceNodeContainer = document.createElement('div');
        var priceNode = document.createElement('p');
        priceNodeContainer.appendChild(priceNode);
        priceNodeContainer.className += 'price-perlify pending';


        priceNode.innerHTML = '<span class="price-value">$' + finalPer + '</span>/' + unit;

        if (onSale) {
            product = product.getElementsByClassName('price-sale-block')[0];
        } else {
            product = product.getElementsByClassName('price-std-block')[0];
        }

        product.appendChild(priceNodeContainer);
    }

    var appendErr = function(target, onSale) {
        var errNodeContainer = document.createElement('div');
        var errNode = document.createElement('p');
        errNodeContainer.appendChild(errNode);
        errNodeContainer.className += 'price-perlify error';

        errNode.innerHTML = "Unsure.";

        target.getElementsByClassName('tile-pricing-block')[0].appendChild(errNodeContainer);

        console.log(target);
    }

    function styleNodes(nodeList, ...styles) {
        for (elem of nodeList) {
            if (styles.length === 0) {
                return false; // break
            }

            for (style in styles[0]) {
                toggleClass(elem, styles[0][style]);
            }
        };
    }

    var toggleClass = function(el, className) {
        if (el.classList) {
            el.classList.toggle(className);
        } else {
            var classes = el.className.split(' ');
            var existingIndex = classes.indexOf(className);

            if (existingIndex >= 0)
                classes.splice(existingIndex, 1);
            else
                classes.push(className);

            el.className = classes.join(' ');
        }
    }

    var LightenDarkenColor = function(col, amt) {

        var usePound = false;

        if (col[0] == "#") {
            col = col.slice(1);
            usePound = true;
        }

        var num = parseInt(col, 16);

        var r = (num >> 16) + amt;

        if (r > 255) r = 255;
        else if (r < 0) r = 0;

        var b = ((num >> 8) & 0x00FF) + amt;

        if (b > 255) b = 255;
        else if (b < 0) b = 0;

        var g = (num & 0x0000FF) + amt;

        if (g > 255) g = 255;
        else if (g < 0) g = 0;

        return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);

    }

    var setItemListeners = function() {
        var insertedNodes = [];
        var prodListContainer = document.getElementsByClassName('module-products')[0];

        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                for (var i = 0; i < mutation.addedNodes.length; i++)
                    insertedNodes.push(mutation.addedNodes[i]);
            })
            window.setTimeout(function() {
                refreshPrices();
            }, 1000);
        });
        observer.observe(prodListContainer, { childList: true });
    }

    var refreshPrices = function() {
        initJetlify();
    }

    var deleteOldPerlify = function(productNode) {
        var perlifyNodes = productNode.getElementsByClassName('price-perlify');

        Array.prototype.forEach.call(perlifyNodes, function(node) {
            node.parentNode.removeChild(node);
        });
    }

    var unitKey = [
        ['count', 'ct', 'cnt', 'sheets'],
        ['fl oz', 'fluid oz', 'fl ounce', 'fl ounces', 'fluid ounce', 'fluid ounces', 'ounces', 'oz', 'ounce']
    ];
};

initJetlify();