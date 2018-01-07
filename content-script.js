var initJetlify = function() {
    var loadCheck = 0;

    var readContent = setInterval(function() {
        console.log(document.readyState);

        if (document.readyState === 'complete') {
        	clearInterval(readContent);
        	var pricePerList = document.getElementsByClassName('price-per');

        	for (pricePerItem of pricePerList) {
        		var pricePer = pricePerItem.innerHTML.replace(/[\(\)]/g,'').split('/');
        		console.log(pricePer);
        	}
        	var prodList = document.getElementsByClassName('list-products')[0].children;
        	console.log(prodList);
            for (prod of prodList) {
                var content = (prod.getElementsByClassName('tile-contents'));
            }
        }

        loadCheck++;
        if (loadCheck > 5) {
        	clearInterval(readContent);
        	return;
        }
    }, 500)
}();