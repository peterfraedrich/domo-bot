// domo_base
var Bot = require('slackbots')
var util = require('util')

var domo_xtras = function Constructor(settings) {
    this.settings = settings;
    this.settings.name = this.settings.name || 'domo'
    this.user = null
}

util.inherits(domo_xtras, Bot)

domo_xtras.prototype.run = function (message) {
	console.log('called domo_xtras!')
}

domo_xtras.prototype._openThePodBay = function (message) {
    console.log(message)
    //var channel = this._getChannelById(message.channel)
    this.postMessage(message.channel, "I'm sorry. I can't do that, Dave.", {as_user: true})
}

domo_xtras.prototype._getChannelById = function (channelId) {
    return this.channels.filter(function (item) {
        return item.id === channelId
    })[0]
}

module.exports = domo_xtras
