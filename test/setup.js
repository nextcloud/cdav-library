import xpath from "xpath-ts"

window.Document.prototype.evaluate = xpath.evaluate;
