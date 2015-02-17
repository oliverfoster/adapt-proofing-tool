var stringify = require('csv-stringify'),
	inquirer = require("inquirer"),
	_ = require("underscore"),
	Backbone = require("backbone"),
	path = require("path"),
	fs = require("fs");
var htmlToText = require('html-to-text');

var cwd = process.cwd();

var data = {
	config: new (Backbone.Collection.extend({}))(require( path.join(cwd, "config.json") )),
	course: new Backbone.Collection(require( path.join(cwd, "en/course.json") )),
	articles: new Backbone.Collection(require( path.join(cwd, "en/articles.json") )),
	blocks: new Backbone.Collection(require( path.join(cwd, "en/blocks.json") )),
	components: new Backbone.Collection(require( path.join(cwd, "en/components.json") )),
	contentObjects: new Backbone.Collection(require( path.join(cwd, "en/components.json") ))
};

var proofing = [];

data.components.each(function(item, index) {
	proofing = proofing.concat( getComponent(item) );
});


stringify(proofing, function(err, output){

	fs.writeFileSync("proofing.csv", output);

});


var repl = /(\n{1}|\r{1})/g;

function getComponent(item) {
	var id = item.get("_id");
	var title = item.get("title") || "--N/A--";
	var displayTitle = item.get("displayTitle") || "--N/A--";
	var body = item.get("body") || "--N/A--";

	title = htmlToText.fromString(title).replace(repl, "");
	displayTitle = htmlToText.fromString(displayTitle).replace(repl, "");
	body = htmlToText.fromString(body).replace(repl, "");

	var rtn = [
		[ "COMPONENT", id ],
		[ "", "TITLE", title ],
		[ "", "DISPLAY TITLE", displayTitle ],
		[ "", "BODY", body ],
		[]
	];

	rtn = rtn.concat(getType(item));

	return rtn;
}

function getType(component) {
	var ret = [];
	switch (component.get("_component")) {
	case "mcq":
		var items = component.get("_items")
		if (!items) break;
		ret.push( [ "", items.length + " ITEMS" ] );
		_.each(items, function(item, i) {
			var text = item.text;
			text = htmlToText.fromString(text).replace(repl, "");
			ret.push(["",text])
		});
		ret.push([]);
	}
	return ret;
}