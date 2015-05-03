// Meteor will put this on the global namespace
app = {};

// Turn on tooltips
app.turnOnTooltips = function(position) {
	position = position || 'top';
	$('[data-toggle="tooltip"]').tooltip({'placement': position});
	return true;
}

// Handle fatal failures
app.debug = true;
app.fail = function(reason, logArray) {
	Router.go('/failure/reason/' + reason);
	if(!app.debug) {
		return true;
	}
	// KEEP IN PRODUCTION: Used for controlled debugging
	console.log(reason + ':');
	console.log(logArray);
	return true;
};

app.logOut = function() {
	if(Meteor.userId()) {
		Meteor.logout();
	}
	localStorage.clear();
};

app.transform = {
	// For board URLs: trim, lowercase, replace spaces with _, 
	//  remove any character not matching (word, digit, underscore)
	humanToUrl: function(human) {
		return human.toString()
					.trim()
					.toLowerCase()
					.replace(/ /g, '_')
					.replace(/[^\w\d_]/g, '');
	},
	// For human-readable: trim, lowercase, replace _ with space, 
	//  remove any character not matching (word, digit, space)
	urlToHuman: function(url) {
		return url.toString()
				  .trim()
				  .toLowerCase()
				  .replace(/_/g, ' ')
				  .replace(/[^\w\d ]/g, '');
	},
	// All usernames are trimmed and lowercase
	username: function(name) {
		check(name, String);
		return name.toString().toLowerCase().trim();	
	},
	// All regions are three-digit numbers
	region: function(zip) {
		return Number(zip.toString().substring(0,3));
	}
};

app.validate = {
	username: function(name) {
		if(name.length  > 36) {
			return validation(false, 'This name is too long.', name);
		}
		return validation(true, '');
	},
	// Matches a string of 3 to 5 numerical digits
	region: function(region) {
		check(region, String);
		if(region.length > 0 && !region.match(/^[0-9]+$/)) {
			return validation(false, 'Only numbers are allowed.', region);
		} else if(region.length > 5 && region.match(/^[0-9]+$/)) {
			return validation(false, 'Five-digit zip codes only.', region);
		} else if(!region.match(/^[0-9]{3,5}$/)) {
			return validation(false, 'This isn\'t a valid zip code.', region);
		}
		return validation(true, '');
	},
	// Matches a string of 1 to 200 characters
	boardName: function(name) {
		check(name, String);
		if(name.length < 1) {
			return validation(false, 'This is a required field.', name);
		} else if(name.length > 200) {
			return validation(false, 'This is too long.', name);
		}
		return validation(true, '');
	},
	// Matches a string of 1 to 203 characters in
	//  (word, digit, underscore).
	// The first three chars are the region: cannot be 'NaN'
	// The rest is the board name: cannot be 'undefined'
	boardPath: function(board_path) {
		check(board_path, String);
		if(board_path.substring(0,3) === 'NaN') {
			return validation(false, 'No region defined.', board_path);
		} else if(board_path.substring(3) === 'undefined') {
			return validation(false, 'No hobby defined.', board_path);
		} else if(board_path.length > 203) {
			return validation(false, 'Maximum length exceeded.', board_path);
		} else if(!board_path.match(/^[\w\d_]{1,203}$/)) {
			return validation(false, 'Board path validation failed.', board_path);
		}
		return validation(true, '');
	}
};

var validation = function(valid, message, details) {
	return {
		valid: valid,
		message: message,
		details: details
	};
};