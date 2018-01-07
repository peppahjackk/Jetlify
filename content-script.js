var initJetlify = function() {
    var loadCheck = 0;

    var readContent = setInterval(function() {
        console.log(document.readyState);

        if (document.readyState === 'complete') {
        	clearInterval(readContent);
        	var prodList = document.getElementsByClassName('list-products')[0].children;
        	console.log(prodList);
            for (prod of prodList) {
                console.log(prod.getElementsByClassName('tile-contents'));
            }
        }

        loadCheck++;
        if (loadCheck > 5) {
        	clearInterval(readContent);
        	return;
        }
    }, 500)
}();