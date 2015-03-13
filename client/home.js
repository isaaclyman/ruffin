// Enable tooltips
Handlebars.registerHelper("setTitle", function(title) {
	if(title) {
		document.title = title;
	} else {
		document.title = "Ruffin";
	}
})

Template.home.rendered = function() {
	$('[data-toggle="tooltip"]').tooltip();
}

Template.home.events({
	"submit .begin": function (event) {
		var name  = event.target[0].value;
		var zip   = event.target[1].value;
		var hobby = event.target[2].value;
		console.log(name, zip, hobby);
		return false;
	}
});