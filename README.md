# Discord.js-Protector-Bot

This bot was created for personal protection in an anarchy discord server I am in where we all have all powers excluding timeout, kick, ban, and admin.

In order to get the bot set up and running you will need a .env file with the following:
```
BOTTOKEN1=(YOUR BOT TOKEN)
MYID=(YOUR DISCORD ID)
ThisServer=(DISCORD SERVER THIS BOT WILL BE USED IN)
ProtectedUserIds=(YOUR DISCORD ID AS WELL AS OTHERS YOU'D LIKE TO PROTECT SEPERATED BY A COMMA)
```

You will also need to open a CMD where the bot files are located and run ```npm install```

The commands this bot uses are as follows:

* Anyone can use
  - ping **_a command used for testing that the bot is running_**
  - checktimeout  **_prints to console what users are timed out and until when_**
* Only the MYID user can use
  - kick (targets discord id) **_repeatedly kicks a user when they join a voice channel_**
  - stopkick (targets discord id) **_stops the kick action_**
  - defend (targets discord id) **_un-server deafen and mutes a user_**
  - stopdefend (targets discord id) **_stops defending a user_**
  
For the most part this bot functions on its own only taking reactive actions. If you are kicked, the bot server deafens, server mutes, and kicks the person who kicked you. If the user was not in a voice channel then the bot will wait and kick them next time it sees them join one. Also, if you are moved to another channel by a user the bot will server deafen them, kick them, and then swap your places.
