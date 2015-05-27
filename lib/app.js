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
	// For board URLs: trim, replace spaces with _
	humanToUrl: function(human) {
		return human.toString()
					.trim()
					.replace(/ /g, '_');
	},
	// For human-readable: trim, replace _ with space
	urlToHuman: function(url) {
		return url.toString()
				  .trim()
				  .replace(/_/g, ' ');
	},
	// All usernames are trimmed
	username: function(name) {
		check(name, String);
		return name.toString().trim();	
	},
	// All regions are three-digit numbers
	region: function(zip) {
		check(zip, String);
		return zip.toString().substring(0,3);
	},
	toFriendlyTime: function(date) {
		date = new Date(date);
		return this.toTwelveHour(date.getHours()) + ':' +
			   this.addZeroToSingleDigit(date.getMinutes()) + ' ' +
			   this.ampm(date.getHours());
	},
	// May need localization
	toFriendlyDateTime: function(date) {
		date = new Date(date);
		var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
		var months  = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul',
						'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		return days[date.getDay()] + ' ' +
			   months[date.getMonth()] + ' ' +
			   date.getDate() + ' ' +
			   date.getFullYear() + ' ' +
			   this.toTwelveHour(date.getHours()) + ':' +
			   this.addZeroToSingleDigit(date.getMinutes()) + ' ' +
			   this.ampm(date.getHours());
	},
	toTwelveHour: function(hours) {
		if(hours === 0) {
			return 12;
		}
		return hours <= 12 ? hours : hours - 12;
	},
	ampm: function(hours) {
		if(hours < 12) {
			return 'AM';
		}
		return 'PM';
	},
	addZeroToSingleDigit: function(minutes) {
		if(minutes.toString().length === 1) {
			return '0' + minutes.toString();
		}
		return minutes;
	},
	maybeEjson: function(str) {
		if(str[0] === '"') {
			return EJSON.parse(str);
		}
		return str;
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
		if(region === 'NaN') {
			return validation(false, 'This is not a number.', region);
		} else if(region.length > 0 && region.search(/^[0-9]+$/) === -1) {
			return validation(false, 'Only numbers are allowed.', region);
		} else if(region.length > 5 && region.search(/^[0-9]+$/) !== -1) {
			return validation(false, 'Five-digit zip codes only.', region);
		} else if(region.search(/^[0-9]{3,5}$/) === -1) {
			return validation(false, 'This isn\'t a valid zip code.', region);
		}
		return validation(true, '');
	},
	email: function(email) {
		check(email, String);
		if(email.search(/^.+@.+\..+$/i) === -1) {
			return validation(false, 'This doesn\'t look like a valid email address.', email);
		}
		return validation(true, '');
	},
	// Matches a string of 1 to 200 characters
	boardName: function(name) {
		check(name, String);
		if(name === 'undefined') {
			return validation(false, 'This cannot be undefined.', name);
		} else if(name.length < 1) {
			return validation(false, 'This is a required field.', name);
		} else if(name.length > 200) {
			return validation(false, 'This is too long.', name);
		}
		return validation(true, '');
	},
	// Matches a string of 4 to 203 characters
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
		} else if(board_path.length < 4) {
			return validation(false, 'Minimum length not reached.', board_path);
		}
		return validation(true, '');
	},
	boardDescription: function(description) {
		check(description, String);
		if(description.length > 140) {
			return validation(false, 'Maximum length exceeded.', description);
		}
		return validation(true, '');
	},
	char1000: function(str) {
		check(str, String);
		if(str.length > 1000) {
			return validation(false, 'Maximum length exceeded.', str);
		}
		return validation(true, '');
	},
	char10k: function(str) {
		check(str, String);
		if(str.length > 10000) {
			return validation(false, 'Maximum length exceeded.', str);
		}
		return validation(true, '');
	},
	char140: function(str) {
		check(str, String);
		if(str.length > 140) {
			return validation(false, 'Maximum length exceeded.', str);
		}
		return validation(true, '');
	}
};

// Splits each element of itemArray into its component words, compares all words with 'item', and returns
//   'howMany' number of the elements that have the closest Levenshtein distance to 'item'.
app.levenshtein = function (item, itemArray, howMany) {
	check(item, String);
	check(itemArray, [String]);
	return itemArray.map(function (arrayItem) {
		return {
			item: arrayItem,
			distance: splitLevDist(item, arrayItem)
		};
	}).sort(function (a, b) {
		return a.distance - b.distance;
	}).slice(0, howMany).map(function (item) {
		return item.item;
	});
};

var validation = function(valid, message, details) {
	return {
		valid: valid,
		message: message,
		details: details
	};
};

var splitLevDist = function (item, arrayItem) {
	if (arrayItem.indexOf(' ') === -1) {
		return levDist(item, arrayItem);
	}
	return Math.min.apply(null, arrayItem.split(' ').map(function (splitArrayItem) {
		return levDist(item, splitArrayItem);
	}));
};

/*
	Thanks to James Westgate for this solution
*/
var levDist=function(r,a){var t=[],f=r.length,n=a.length;if(0==f)return n;if(0==n)return f;for(var v=f;v>=0;v--)t[v]=[];for(var v=f;v>=0;v--)t[v][0]=v;for(var e=n;e>=0;e--)t[0][e]=e;for(var v=1;f>=v;v++)for(var h=r.charAt(v-1),e=1;n>=e;e++){if(v==e&&t[v][e]>4)return f;var i=a.charAt(e-1),o=h==i?0:1,c=t[v-1][e]+1,u=t[v][e-1]+1,A=t[v-1][e-1]+o;c>u&&(c=u),c>A&&(c=A),t[v][e]=c,v>1&&e>1&&h==a.charAt(e-2)&&r.charAt(v-2)==i&&(t[v][e]=Math.min(t[v][e],t[v-2][e-2]+o))}return t[f][n]};
