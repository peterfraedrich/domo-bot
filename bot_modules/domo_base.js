// domo_base
var Bot = require('slackbots')
var util = require('util')
var sys = require('sys')
var exec = require('child_process').exec
var dns = require('dns')
var regex = require('regex')
var telnet = require('telnet-client')

var domo_base = function Constructor(settings) {
    this.settings = settings;
    this.settings.name = this.settings.name || 'domo'
    this.user = null
}

util.inherits(domo_base, Bot)

domo_base.prototype.run = function (self, message) {
	domo_base.super_.call(this, self.settings)
	this._onMessage(message)
}

domo_base.prototype._onMessage = function (message) {
	var msg = message.text.split(' ') // split message into list to make it easier to parse
	if (msg[0].toLowerCase() == 'domo' && msg.length <= 1) {
		this._hello(message) // respond with hello if just 'domo'
	} else if (msg[0].toLowerCase() == 'domo' && msg.length > 1) {
		if (msg[1].toLowerCase() == 'yo') {
			this._yo(message) // respond with yo
		} else if (msg[1].toLowerCase() == 'hey' && (msg[2].toLowerCase() == 'shorty' || msg[2].toLowerCase() == 'shawty')) {
			this._shorty(message) // easter egg?
		} else if (msg[1].toLowerCase() == 'help') {
			this._help(message) // show the help text
		} else if (msg[1].toLowerCase() == 'ping') {
			this._ping(message) // ping a host or hostname
		} else if (msg[1].toLowerCase() == 'dns') {
			this._dns(message) // do a DNS lookup
		} else if (msg[1].toLowerCase() == 'port' || msg[1].toLowerCase() == 'poke' || msg[1].toLowerCast == 'telnet') {
			this._telnet(message) // check ports using telnet
		} else if (msg[1].toLowerCase() == 'unix' || msg[1].toLowerCase() == 'shell') {
			this._unix(message) // run arbitrary shell command
		}
	}
}

domo_base.prototype._hello = function (message) {
	var reply = 'Hello.'
	this.postMessage(message.channel, reply, {as_user: true})
}

domo_base.prototype._yo = function (message) {
	var reply = 'yo.'
	this.postMessage(message.channel, reply, {as_user: true})
}

domo_base.prototype._shorty = function (message) {
	this.postMessage(message.channel, 'http://static.fjcdn.com/pictures/Go_43c66b_1784287.jpg', {as_user: true})
}

domo_base.prototype._help = function (message) {
	var txt = []
	txt.push('DOMO help text!')
	txt.push('---')
	txt.push('DOMO tries to be the friendly Slack bot that does helpful things.\r')
	txt.push('Available commands: (domo [command] [params])')
	txt.push('>> yo')
	txt.push('Holla at DOMO.\r')
	txt.push('>> help')
	txt.push('This help text. Super helpful.\r')
	txt.push('>> dns { ip | hostname }')
	txt.push('DOMO fetches a forward or reverse DNS lookup depending on what you give him. IPv6 compatible!')
	txt.push('EX: > domo dns 192.168.1.1\r')
	txt.push('>> ping { ip | hostname }')
	txt.push('DOMO pings the host you tell him to. Also IPv6 compatible!')
	txt.push('EX: > domo ping 192.168.1.1\r')
	txt.push('>> { port | poke | telnet } { ip[:port] | hostname[:port] } [port]')
	txt.push('Uses telnet to poke the port you specify. You can either supply it in-line like a URL, or spaced out like classic telnet.')
	txt.push('EX: > domo poke 192.168.1.1:80 , domo telnet 192.168.1.1 80\r')
	txt.push('>> { unix | shell }')
	txt.push('DOMO executes arbitrary unix commands on his host machine. EXPERIMENTAL. THIS IS DANGEROUS! DO NOT execute open-ended commands (like ping), you will have no way to kill the process!')
	var response = '```'
	for (var i = 0; i < txt.length; i++) {
		response = response + txt[i] + '\r'
	}
	response = response + '```'
	this.postMessage(message.channel, response, {as_user: true})
}

domo_base.prototype._ping = function (message) {
	var self = this
	var msg = message.text.split(' ')
	if (msg.length < 3) {
		self.postMessage(message.channel, 'Not enough info to play ping-pong. `domo ping { ip | hostname }`', {as_user: true})
	} else {
		if (/<.+>/.test(msg[2])) {
			host = msg[2].split('|')[1].split('>')[0]
		} else {
			host = msg[2]
		}
		exec("ping -c 3 " + host.toString(), function(stdin, stdout, error) {
			if (error) {
				self.postMessage(message.channel, 'Unable to ping ' + host.toString(), {as_user: true})
			} else {
				self.postMessage(message.channel, '```' + stdout + '```', {as_user: true})
			}
		})
	}
}

domo_base.prototype._dns = function (message) {
	var self = this
	var msg = message.text.split(' ')
	if (msg.length < 3) {
		self.postMessage(message.channel, 'Not enough info to do a DNS lookup. `domo dns { ip | hostname }`', {as_user: true})
	} else {
		// set up regex
		var host = msg[2]
		var results = ''
		var ip4 = new regex(/[0-2]{0,1}[0-9]{1,2}[.][0-2]{0,1}[0-9]{1,2}[.][0-2]{0,1}[0-9]{1,2}[.][0-2]{0,1}[0-9]{1,2}/)
		if (ip4.test(host) == true || (host.indexOf(':') >= -1 && ! /<.+>/.test(host))) {
			// reverse lookup for IP address
			dns.reverse(host, function (err, hostnames) {
				if (err) {
					console.log(err)
					self.postMessage(message.channel, 'There was an error doing the DNS lookup. Sorry.', {as_user: true})
				} else {
					results = host + ' resolves to:\r'
					for (var i = 0; i < hostnames.length; i++) {
						results = results + hostnames[i] + '\r'
					}
					self.postMessage(message.channel, '```' + results + '```', {as_user: true})
				}
			})
		} else {
			// forward lookup for FQDN
			host = host.split('|')[1].split('>')[0] // remove crap from query that Slack throws on links
			dns.resolve(host, function(err, addresses) {
				if (err) {
					console.log(err)
					self.postMessage(message.channel, 'There was an error doing the DNS lookup. Sorry.', {as_user: true})
				} else {
					results = host + ' resolves to:\r'
					for (var i = 0; i < addresses.length; i++) {
						results = results + addresses[i] + '\r'
					}
					self.postMessage(message.channel, '```' + results + '```', {as_user: true})
				}
			})
		}
	}
}

domo_base.prototype._telnet = function (message) {
	var self = this
	var msg = message.text.split(' ')
	var host = ''
	var port = ''
	if (msg.length < 3) {
		// if not enough arguments
		self.postMessage(message.channel, 'Not enough info to poke a port. `domo { port | poke | telnet } { ip[:port] | fqdn[:port] } [port]`', {as_user: true})
		return
	} else if (msg.length < 4 ) {
		// if no port specified, see if its part of the URL
		if (/<.+>/.test(msg[2])) {
			var h = msg[2].split('|')[1].split('>')[0]
			// if port part of URL
			if (h.indexOf(':') >= -1) {
				var t = h.split(':')
				host = t[0]
				port = t[1]
			} else {
				self.postMessage(message.channel, 'Please supply a port number. `domo { port | poke | telnet } { ip[:port] | fqdn[:port] } [port]`', {as_user: true})
				return
			}
		} else {
			if (msg[2].indexOf(':') > -1) {
				// if URL is not formatted and port is attached to it
				var h = msg[2].split(':')
				host = h[0]
				port = h[1]
			} else {
				self.postMessage(message.channel, 'Please supply a port number. `domo { port | poke | telnet } { ip[:port] | fqdn[:port] } [port]`', {as_user: true})
				return
			}
		}
	} else {
		// if URL is formatted but port is supplied
		if (/<.+>/.test(msg[2])) {
			host = msg[2].split('|')[1].split('>')[0]
			port = msg[3]
		} else {
			// if URL is not formatted and port is supplied
			host = msg[2]
			port = msg[3]
		}
	}
	var connection = new telnet()
	var params = {
		host: host,
		port: parseInt(port),
		shellPrompt: '(\S|\s)*',
		timeout: 2000
	}
	connection.on('ready', function(prompt) {
		connection.exec('HLEO', function (err, response) {
			if (err) {
				console.log(err)
			}
		})
	})
	connection.on('timeout', function() {
		self.postMessage(message.channel, 'Successfully poked ' + host + ' on port ' + port + '.', {as_user: true})
		connection.end()
	})
	connection.on('error', function (err) {
		console.log(err)
		self.postMessage(message.channel, 'Unable to reach ' + host + ' on port ' + port + '.', {as_user: true})
	})
	connection.connect(params, function(err) {
		if (err) {
			console.log(err)
			self.postMessage(message.channel, 'Unable to reach ' + host + ' on port ' + port + '.', {as_user: true})
		}
	})
}

domo_base.prototype._unix = function (message) {
	var self = this
	var msg = message.text.split(' ')
	if (msg.length <= 2) {
		self.postMessage(message.channel, 'Not enough info for unix commands! `domo unix [command]`', {as_user: true})
	} else {
		var blacklist = [
			'rm',
			'poweroff',
			'init',
			'halt',
			'kill',
			'killproc',
			'killall',
            'yum',
            'rpm',
            'node',
            'npm',
            'sudo',
            'chmod',
            'chown'
		]
		// check for blacklisted commands
		for (var i = 0; i < msg.length; i++) {
			for (var b = 0; b < blacklist.length; b++) {
				if (msg[i] == blacklist[b]) {
					self.postMessage(message.channel, 'Unix command `' + msg[i] + '` not allowed!', {as_user: true})
					return
				}
			}
		}
		// combine everything after 'unix' into a command for child_process
		var cmd = ''
		for (var i = 0; i < msg.length; i++) {
			if (i == 0 || i == 1) {
				continue
			}
			cmd = cmd + ' ' + msg[i]
		}
		exec(cmd, function(error, stdout, stderr) {
			if (error) {
				self.postMessage(message.channel, 'There was an error!\n```'+error+'```', {as_user: true})
			} else {
				self.postMessage(message.channel, '```' + stdout + '```', {as_user: true})
			}
		})
	}
}

module.exports = domo_base
