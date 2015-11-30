// domo_framework.js
var util = require('util')
var path = require('path')
var fs = require('fs')
var Bot = require('slackbots')
// get module names
var modulePath = __dirname + '/bot_modules/'
var modules = []

fs.readdirSync(modulePath).forEach(function (file) {
	module.exports[path.basename(file, '.js')] = require(path.join(modulePath, file));
	modules.push(file.split('.')[0])
	console.log('DOMO found module ' + modulePath + file)
});
// load modules from bot_modules
var domoBase = require(modulePath + 'domo_base.js')
var domo_base = new domoBase({token: this.token, name: this.name})
var domoXtras = require(modulePath + 'domo_xtras.js')
var domo_xtras = new domoXtras({token: this.token, name: this.name})

// set up class how we like by extending slackbots class constructor
var domo = function Constructor(settings) {
    this.settings = settings;
    this.settings.name = this.settings.name || 'domo'
    this.user = null
}

// merge vanilla class with custom constructor
util.inherits(domo, Bot)

// called from bot.js
domo.prototype.run = function() {
    domo.super_.call(this, this.settings)
    this.on('start', this._onStart)
    this.on('message', this._onMessage)
}

// connects to the slack instance
domo.prototype._onStart = function () {
    this._loadBotUser();
}

// the function called when a message is recieved; messages are filtered to see if theyre chat messages or IM's and are to Domo
domo.prototype._onMessage = function (message) {
    if (this._isChatMessage(message) &&
        this._isChannelConversation(message) &&
        this._isFromSelf(message) &&
        this._isToDomo(message)
    ) {
		domo_base.run(this, message)
		//domo_xtras.run(message)
    }
}

domo.prototype.parse_message = function (message) {
    return message.text.split(' ')
}

domo.prototype._isToDomo = function (message) {
    return message.text.toLowerCase().split(' ').indexOf('domo') == 0 || message.text.toLowerCase().split(' ').indexOf(this.name) == 0
}

domo.prototype._loadBotUser = function () {
    var self = this
    this.user = this.users.filter(function (user) {
        return user.name === self.name
    })[0]
}

domo.prototype._isChatMessage = function (message) {
    return message.type === 'message' && Boolean(message.text)
}

domo.prototype._isChannelConversation = function (message) {
    return typeof message.channel === 'string' //&& message.channel.charAt(0) == 'C' || message.channel.charAt(0) == 'G'
}

domo.prototype._isFromSelf = function (message) {
    return message.user != this.user.id
}

module.exports = domo
