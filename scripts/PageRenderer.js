var https = require('https');
var querystring = require('querystring');
var $ = require('./jquery.js');
var sn = require('./api');
var render = require('./render.js');

var PageRenderer = function(window, document, remote, moviesIndexes){

	var self = this;
	var	_credentials;
	var container = document.children[0];

	this.setCredentials = function(auth_token)
	{
		_credentials = auth_token;
	};

	this.login = function()
	{
		render('login', container, {pageTitle: "RemoteNation"},
			function()
			{
				document.getElementById('loginForm').addEventListener('submit',
					function() {
						console.log('submit');
						var identity = $('#identityField').val();
						var password = $('#passwordField').val();

						var post_data = {
								identity: identity,
								password: password
							};

						post_data = querystring.stringify(post_data);

						var options = {
						    hostname: 'api.streamnation.com',
						    port: 443,
						    path: '/api/v1/auth',
						    method: 'POST',
						    headers: {
								'Content-Type': 'application/x-www-form-urlencoded',
								'Content-Length': post_data.length
						    }
						};

						var data = '';

						var req = https.request(options, function(res) {
						    res.on('data', function(chunk) {
						    	data += chunk;
						    });
							res.on('end', function() {
						    	d = JSON.parse(data);
						    	var authKey = d.auth_token;
								self.setCredentials(authKey);
								self.home();
							});
						});

						req.write(post_data);
						req.end();
						req.on('error', function(e) {
							$('#message').text('Failed Identification');
						});
						return false;
					});
			});
	};

	this.home = function()
	{
		this.movies();
	};

	this.movies = function ()
	{
		var self = this;
		render('movies', container, { pageTitle: 'Movies' },
			function() {
				sn.getMoviesList(_credentials, container, function(data) {
					for (var i in data.movies) {
						var item = document.createElement('li');
						item.name = data.movies[i].contents[0].id;

						moviesIndexes[data.movies[i].contents[0].id] = i;

						var titleMovie = document.createElement('h2');
						titleMovie.innerHTML = data.movies[i].name;

						var image = document.createElement('img');
						image.src = data.movies[i].covers[1].uri;

						item.appendChild(image);
						item.appendChild(titleMovie);
						item.addEventListener('click', function() {
							console.log(this.name);
							self.moviePlayback(this.name);
						});
						document.getElementById('moviesContainer').appendChild(item);
					}
			});
		});
	}

	this.moviePlayback = function (id)
	{
		console.log(id);
		sn.getPlayback(_credentials, id, container, function(data) {

			console.log(data);

			// debugger;

			render('playback',container,
				{
					pageTitle: 'Viewer',
					id: encodeURIComponent(data.playback.playback_uri)
				}, function() {
					window.onresize = function()
					{
						if (document.getElementById('playerContainer'))
						{
							// var frame = document.getElementById('playerContainer');
							// frame.movieId = id;
							// frame.setAttribute('height', window.height);
							// frame.setAttribute('width', window.width);
						}
					}
				});
		});
	}

}

module.exports = PageRenderer;
