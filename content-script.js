var initJetlify = function() {
    var loadCheck = 0,
        unitList = [],
        jetPriceList = [],
        ourPriceList = [],
        medianPrice,
        avgPrice,
        units;

    var readContent = setInterval(function() {

        // Waits until page is loaded
        if (document.readyState === 'complete') {
            clearInterval(readContent);

            // Sets up watcher for content change
            setItemListeners();

            // Gets all pre-listed price per blocks
            var pricePerList = document.getElementsByClassName('price-per');
            // Gets pre-listed units
            units = getExistingUnits(pricePerList);

            medianPrice = getMedian(jetPriceList);

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
                        ourPriceList.push(finalPer);
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

            var pricePerlifyList = document.querySelectorAll('.price-perlify.pending');

            //styleNodes(pricePerlifyList, ['pending']);
            if (pricePerlifyList.length) {
                rankPrices(pricePerlifyList);
            }
        }

        loadCheck++;
        if (loadCheck > 7) {
            clearInterval(readContent);
            console.log('ERROR: Could not read content')
            return;
        };

    }, 500)

    var getExistingUnits = function(list) {
        var existingUnits = [];

        for (pricePerItem of list) {
            var unit = getUnit(pricePerItem);
            var price = parseFloat(getPrice(pricePerItem));

            if (existingUnits.indexOf(unit) == -1) {
                existingUnits.push(unit);
            }

            jetPriceList.push(price);
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

        // If our price is significantly more than theirs or the median, try to multiply with next quantity
        if (newPricePer > (price[1] * 1.7) && newPricePer >= (medianPrice * 1.7)) {
            quantities = remove(quantities, closestQuantity);
            // Iterate through other number values in title
            while (quantities.length) {
                var tempPricePer = (newPricePer / quantities[quantities.length - 1]).toFixed(4);
                if (tempPricePer <= price[1] * 1.3 || tempPricePer <= (medianPrice * 1.3)) {
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

        var rankNode = buildRankNode('?');

        priceNodeContainer.appendChild(rankNode);
        priceNodeContainer.setAttribute('data-price-per', finalPer);


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

        var rankNode = buildRankNode('?');

        errNodeContainer.appendChild(rankNode);

        errNode.innerHTML = "Jetlify unsure.";

        target.getElementsByClassName('tile-pricing-block')[0].appendChild(errNodeContainer);
    }

    var buildRankNode = function(rankNum) {
        var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 120 100");
        svg.setAttribute("preserveAspectRatio", "none");
        svg.setAttribute("height", "100%");

        var poly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        poly.setAttribute("points", "0,120 20,0 120,0 120,100");

        var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", "56%");
        circle.setAttribute("cy", "51.5%");
        circle.setAttribute("r", "37%");
        circle.setAttribute("fill", "white");

        var rank = document.createElementNS("http://www.w3.org/2000/svg", "text");
        rank.setAttribute("x", "55%");
        rank.setAttribute("y", "69%");
        rank.setAttribute("text-anchor", "middle");
        rank.setAttribute("font-size", "52");
        rank.innerHTML = rankNum;


        svg.appendChild(poly);
        svg.appendChild(circle);
        svg.appendChild(rank);

        return svg;
    }

    function rankPrices(nodeList) {
        var rankedList = [].slice.call(nodeList);
        rankedList = rankedList.sort(compare);

        var priceAvg = getAverage(rankedList);
        var priceTier = 1;
        var indexInTier = 0;

        var tierLength = Math.round(rankedList.length / 3);
        for (var i = 1; i <= rankedList.length; i++) {
            let currentItem = rankedList[i - 1];
            colorizeRank(currentItem, priceTier);
            rankNumber(currentItem, i);

            indexInTier++;

            if (indexInTier >= tierLength) {
                priceTier++;
                indexInTier = 0;
            }
        }
    }

    function colorizeRank(item, priceTier) {
        let tierColor;

        switch (priceTier) {
            case 1:
                tierColor = 'green';
                break;
            case 2:
                tierColor = 'yellow';
                break;
            case 3:
                tierColor = 'red';
                break;
            default:
                tierColor = 'error';
                break;
        }
        
        toggleClass(item, tierColor, 'pending');
    }

    function rankNumber(item, priceRank) {

        item.getElementsByTagName('text')[0].textContent = priceRank;
    }

    function styleNodes(nodeList, ...styles) {
        for (elem of nodeList) {
            if (styles.length === 0) {
                return false;
            }

            for (style in styles[0]) {
                toggleClass(elem, styles[0][style]);
            }
        };
    }

    var toggleClass = function(el, ...className) {
        for (style in className) {
            if (!style) {
                break;
            }
            if (el.classList) {
                el.classList.toggle(className[style]);
            } else {
                var classes = el.className.split(' ');
                var existingIndex = classes.indexOf(className[style]);

                if (existingIndex >= 0)
                    classes.splice(existingIndex, 1);
                else
                    classes.push(className[style]);

                el.className = classes.join(' ');
            }
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

    var compare = function(a, b) {
        if (a.dataset.pricePer > b.dataset.pricePer) {
            return 1;
        } else if (a.dataset.pricePer < b.dataset.pricePer) {
            return -1;
        }
    }

    var unitKey = [
        ['count', 'ct', 'cnt', 'sheets'],
        ['fl oz', 'fluid oz', 'fl ounce', 'fl ounces', 'fluid ounce', 'fluid ounces', 'ounces', 'oz', 'ounce']
    ];
};

initJetlify();