// domo

var Domo = require('./domo_framework.js')

var token = process.env.SLACK_API_KEY || require('./token')
var name = 'domo'

var domo = new Domo({
    token: token,
    name: name
})

domo.run()
