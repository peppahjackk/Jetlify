# Jetlify

A chrome extension that helps you save even more money on Jet.com by highlighting the best deals possible.

USD is currently the only currency supported.


### To Do before release

* Mutation observer to start pulling data
* Rank item price vs the rest and colorize
* Unsupported item case
* Create logo
* Implement animations
* Test


### Bugs

* Sq ft on rolls of paper products impossible. Fall back to count
* NaN getting appended occasionally (seen on coffee filters)
* Case where item is unavailable errors, stops code. need try/catch on append
* If multi quantity case, the per unit always defaults to the original first, though two have been used ($4.80 24oz 2ct will result in $0.10/count) 
