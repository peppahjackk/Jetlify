var initJetlify = function() {
    var loadCheck = 0,
        unitList,
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
                units = getExistingUnits(pricePerList, false);

                var prodList = document.getElementsByClassName('list-products')[0].children;

                for (prod of prodList) {
                    try {
                        var content = (prod.getElementsByClassName('tile-contents'));
                        var title = content[0].childNodes[0].getElementsByClassName('name')[0].textContent.toLowerCase();
                        var pricingBlock = content[0].childNodes[1];
                        var onSale = false;
                        var itemUnit
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
                            pricingBlock = [price, pricePer[0].innerHTML];
                            pricePer = getExistingUnits(pricePer, true);
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
                            appendErr(prod, err, onSale);
                        }
                    } catch (err) {
                        console.log('Error: ' + err);
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

    var getExistingUnits = function(list, singleProduct) {

        if (!singleProduct) {
            for (pricePerItem of list) {
                var pricePer = pricePerItem.innerHTML.replace(/[\(\)]/g, '').split('/');
                var unit = pricePer[1].toLowerCase();

                if (unitList === undefined) {
                    unitList = [unit];
                } else if (unitList.indexOf(unit) == -1) {
                    unitList.push(unit);
                }
            }

            return unitList;
        } else {
            var pricePer = list[0].innerHTML.replace(/[\(\)]/g, '').split('/');
            var unit = pricePer[1].toLowerCase();

            return unit;
        }

    };

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

        return quantities.length === 1 ? Number.parseFloat(price[0] / quantities[0]).toFixed(4) : Number.parseFloat(price[0] / getClosestQuantity(quantities, title, unit)).toFixed(4);
    };

    var getClosestQuantity = function(quantities, title, unit) {
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

    var appendErr = function(target, err, onSale) {
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