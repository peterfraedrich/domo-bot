# DOMO Slackbot

DOMO is a NodeJS-based Slack bot designed to let you do useful things inside Slack. It is designed with sysadmins in mind, however it is extensible with minimal code modification so you can add your own modules.

### Installation

If you are using the systemd unit file in `./os-bin`, you should install DOMO to `/bot` or edit the unit file. 

### Slack Token

Your Slack bot token should go into `./token`, or you can add it in-line with the launch command like so: `SLACK_API_KEY=your_key_here node bot.js`



##### Credits

This bot uses open-source software and borrows heavily from NorrisBot (https://github.com/lmammino/norrisbot). 
