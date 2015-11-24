// HAL

'use strict';
var Hal = require('./bot_modules/hal_framework.js')

var token = process.env.SLACK_API_KEY || require('./token')
var name = 'hal'

var hal = new Hal({
    token: token,
    name: name
})

hal.run()
