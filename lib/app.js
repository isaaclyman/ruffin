// Meteor will interpret this as a global namespace
app = {};

// Turn on tooltips
app.turnOnTooltips = function(position) {
	position = position || 'top';
	$('[data-toggle="tooltip"]').tooltip({'placement': position});
	return true;
}

// For board URLs: trim, lowercase, replace spaces with _, remove non-word characters
app.transformToUrl = function(name) {
	return name.toString()
			   .trim()
			   .toLowerCase()
			   .replace(/ /g, '_')
			   .replace(/[^\w\d_]/g, '');
};
// For human-readable: trim, lowercase, replace _ with space, remove non-word
//   non-space characters
app.transformToHuman = function(name) {
	return name.toString()
				.trim()
				.toLowerCase()
				.replace(/_/g, ' ')
				.replace(/[^\w\d ]/g, '');
};

app.transformUsername = function(name) {
	return name.toString().toLowerCase().trim();
};
app.transformRegion = function(zip) {
	return Number(zip.toString().substring(0,3));
};

// These should be the same on client and server
app.checkRegion = function(region) {
	if(!region.match(/^[0-9]{3,5}$/)) {
		return false;
	}
	return true;
};
app.checkBoardName = function(name) {
	if(!name.match(/^[\w\d_]{1,200}$/)) {
		return false;
	}
	return true;
};

// Handle fatal failures
app.debug = true;
app.fail = function(reason, logArray) {
	Router.go('/failure/reason/' + reason);
	if(!app.debug) {
		return true;
	}
	console.log(reason + ':');
	console.log(logArray);
	return true;
};

// Set page title dynamically
Handlebars.registerHelper("setTitle", function(title) {
	if(title) {
		document.title = title;
	} else {
		document.title = "Ruffin";
	}
});

