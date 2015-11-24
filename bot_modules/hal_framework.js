// lib/hal.js
var util = require('util')
var path = require('path')
var fs = require('fs')
var mongodb = require('mongojs')
var Bot = require('slackbots')

var hal = function Constructor(settings) {
    this.settings = settings;
    this.settings.name = this.settings.name || 'hal'
    this.user = null
    this.db = null
}

util.inherits(hal, Bot)

hal.prototype.run = function() {
    hal.super_.call(this, this.settings)
    this.on('start', this._onStart)
    this.on('message', this._onMessage)
}

hal.prototype._onStart = function () {
    this._loadBotUser();
}

hal.prototype._onMessage = function (message) {
    if (this._isChatMessage(message) &&
        this._isChannelConversation(message) &&
        this._isFromSelf(message) &&
        this._isToHal(message)
    ) {
        var msg = this.parse_message(message)
        console.log(msg)
        if (msg.indexOf('open') >= 0 && msg.indexOf('the') >= 0 && msg.indexOf('pod') >= 0 && msg.indexOf('bay') >= 0 && msg.indexOf('doors') >= 0) {
            this._openThePodBay(message)
        }
    }
}

hal.prototype._openThePodBay = function (message) {
    console.log(message)
    //var channel = this._getChannelById(message.channel)
    this.postMessage(message.channel, "I'm sorry. I can't do that, Dave.", {as_user: true})
}

hal.prototype.parse_message = function (message) {
    return message.text.split(' ')
}

hal.prototype._isToHal = function (message) {
    return message.text.toLowerCase().split(' ').indexOf('hal') == 0 || message.text.toLowerCase().split(' ').indexOf(this.name) == 0
}

hal.prototype._loadBotUser = function () {
    var self = this
    this.user = this.users.filter(function (user) {
        return user.name === self.name
    })[0]
}

hal.prototype._isChatMessage = function (message) {
    return message.type === 'message' && Boolean(message.text)
}

hal.prototype._isChannelConversation = function (message) {
    return typeof message.channel === 'string'
}

hal.prototype._isFromSelf = function (message) {
    return message.user != this.user.id
}

hal.prototype._getChannelById = function (channelId) {
    return this.channels.filter(function (item) {
        return item.id === channelId
    })[0]
}

module.exports = hal
