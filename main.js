//Init requirments
require("dotenv").config()
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent
    ]
});
const fs = require('fs')
const lib = require('./library.js')

//Init globals
const prefix = '-'
let BotOwnerID = process.env.MYID
let ProtectedUsers = process.env.ProtectedUsersIds.split(',')
let ThisServer = process.env.ThisServer
let k_interval
let d_interval
let PreviousLogs = {}
let CurrentLogs = {}
let attacker = ""
let incomming = {}
client.commands = new Collection()
const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'))
for (const file of commandFiles) {
    const command = require(`./commands/${file}`)
    client.commands.set(command.name, command)
};

//runs when the bot turns on
client.on('ready', () => {
    console.log('Logged in as ' + client.user.tag)
    GetAuditLogChanges()
});

//runs when the bot detects a message sent to any channel it can see
client.on('messageCreate', message => {
    //ensures the message detected is meant for the bot and also, it is not a bot message
    if (!message.content.startsWith(prefix) || message.author.bot) return
    //cuts the message up into an array at each space
    const args = message.content.slice(prefix.length).split(/ +/)
    //moves the prefix and command into the command varriable
    const command = args.shift().toLowerCase()

    if (command === 'ping') { // test command to check the bot is working. Replies in the channel sent with "Pong"
        client.commands.get(command).execute(message, args, client)
    } else if (command === "send") { //broken, was set up to "forward" a DM to another user from the bot
        client.commands.get("send").execute(message, args)
    } else if (command === "checktimeout") { //checks which users are timed out in the server the command is sent in.
        client.commands.get("checktimeout").execute(message, args)
    }

    //commands only protected users can use
    if (ProtectedUsers.includes(message.author.id)) {
        if (command === "kick") { //starts the kicking of someone
            k_interval = setInterval(function () {
                client.commands.get(command).execute(message, args)
            }, 500)
        } else if (command === "stopkick") { //stops the kicking of someone
            clearInterval(k_interval)
        } else if (command === "defend") { //starts defending someone from server deafen/mute
            d_interval = setInterval(function () {
                client.commands.get(command).execute(message, args)
            }, 500)
        } else if (command === "stopdefend") { //stops defending someone from server deafen/mute
            clearInterval(d_interval)
        }
    }

});


//runs on voice state updates such as user joined voice channels, user left voice channels, user moved voice channels, etc.
client.on('voiceStateUpdate', async (oldState, newState) => {
    DelayedRetaliation() //kicks a user who kicked a protected user while not connected to voice chat
    await GetAuditLogChanges() //updates the CurrentLogs and PreviousLogs
    if (ProtectedUsers.includes(oldState.id) && ProtectedUsers.includes(newState.id) && newState.channel == null && oldState.channel !== null) { //If the protected user was kicked
        RetaliationKick(oldState) //server mute, server deafen, and kick the kicker
        return
    } else if (ProtectedUsers.includes(oldState.id) && ProtectedUsers.includes(newState.id) && newState.channel !== oldState.channel && oldState.channel !== null) { //If the protected user was moved
        RetaliationMove(newState, oldState) //server mute, server deafen, and move the mover to the moved channel. Then move the protected user back to their orignal channel.
        return
    } else if (ProtectedUsers.includes(oldState.id) && ProtectedUsers.includes(newState.id) && newState.serverDeaf == true) {
        RemoveServerDeaf(newState)
    } else if (ProtectedUsers.includes(oldState.id) && ProtectedUsers.includes(newState.id) && newState.serverMute == true) {
        RemoveServerMute(newState)
    }
})


client.login(process.env.BOTTOKEN1) // Must be last of client commands called

async function GetAuditLogChanges() { //Gets the id of the user who most recently moved someone or disconnected someone
    await client.guilds.cache.get(ThisServer).fetchAuditLogs()
        .then(AuditLogs => {
            //loops through audit logs received looking for any member_move or member_disconnect logs
            for (const [key, value] of AuditLogs.entries) {
                if (value.action == "26" || value.action == "27") { // 26 = member_move  27 = member_disconnect
                    //adds those logs to the CurrentLogs object
                    CurrentLogs[key] = {
                        user: value.executor.id,
                        action: value.action,
                        count: value.extra.count // import becasue the audit logs condense similar logs into one entry
                    }
                }
                if (value.action == "24" && (value.changes[0].key == "deaf" || value.changes[0].key == "mute") && value.changes[0].new == true) { // 26 = member_move  27 = member_disconnect
                    //adds those logs to the CurrentLogs object
                    CurrentLogs[key] = {
                        user: value.executor.id,
                        action: value.action,
                        count: 1 // import becasue the audit logs condense similar logs into one entry
                    }
                }
            }
            if (Object.keys(PreviousLogs).length === 0) { //used to initalize PreviousLogs
                PreviousLogs = CurrentLogs
                CurrentLogs = {}
                return
            }
            attacker = lib.ObjectDifferences(PreviousLogs, CurrentLogs) //Checks CurrentLogs vs PreviousLogs to see who made the most recent change, if any
            PreviousLogs = JSON.parse(JSON.stringify(CurrentLogs))
            CurrentLogs = {}
        })
        .catch(console.error)
}

async function RemoveServerDeaf(newState) {
    if (attacker == BotOwnerID) { return }
    let ProtectedUserId = newState.id
    let Guild = await client.guilds.fetch(newState.guild.id)
    let VoiceStates = Guild.voiceStates.cache
    for (const [key, value] of VoiceStates) {
        if (key == ProtectedUserId) {
            value.setDeaf(false)
        }
    }
}
async function RemoveServerMute(newState) {
    if (attacker == BotOwnerID) { return }
    let ProtectedUserId = newState.id
    let Guild = await client.guilds.fetch(newState.guild.id)
    let VoiceStates = Guild.voiceStates.cache
    for (const [key, value] of VoiceStates) {
        if (key == ProtectedUserId) {
            value.setMute(false)
        }
    }
}

function RetaliationMove(newchan, oldchan) { //Swaps the attacker with protected after attacker moved protected. Also server deafens and mutes them.
    let Victim = newchan.id
    if (attacker == BotOwnerID || attacker == '853510845383442473' || attacker == '') { //attacker validation check
        return
    }
    if (attacker !== BotOwnerID || ProtectedUsers.includes(Victim)) {
        let AttackerGuildMember = lib.GetGuildMemberInVoice(client, attacker) //gets attacker voice state
        if (AttackerGuildMember !== undefined) {
            AttackerGuildMember.voice.setDeaf(true) //set server deaf
            AttackerGuildMember.voice.setMute(true) //set server mute
            AttackerGuildMember.voice.setChannel(newchan.channel) //move attacker
            console.log(AttackerGuildMember.user.username + " moved you.")
        }
        let ProtectedGuildMember = lib.GetGuildMemberInVoice(client, Victim) //gets protected user voice state
        ProtectedGuildMember.voice.setChannel(oldchan.channel) //move protected user back
        console.log("I moved you back to ")
    }
}

function RetaliationKick(oldchan) { //Kicks the attacker
    let Victim = oldchan.id
    if (attacker == BotOwnerID || attacker == '853510845383442473' || attacker == '') { //attacker validation check
        return
    }
    if (attacker !== BotOwnerID || ProtectedUsers.includes(Victim)) {
        let AttackerGuildMember = lib.GetGuildMemberInVoice(client, attacker) //get attacker voice state
        if (AttackerGuildMember !== undefined) {
            AttackerGuildMember.voice.setDeaf(true) //set server deaf
            AttackerGuildMember.voice.setMute(true) //set server mute
            AttackerGuildMember.voice.disconnect() //disconnect attacker
        } else { //if attacker voice sate is not found
            AddToIncomming(attacker) //add attacker to kick backlog
        }
    }
}

function AddToIncomming(userid) { //adds attacker to kick backlog
    if (isNaN(incomming[userid])) {
        incomming[userid] = 1
    } else {
        incomming[userid] = incomming[userid] + 1
    }
}

function DelayedRetaliation() { //deal with attackers in backlog
    for (const key in incomming) {
        let AttackerVoiceConnection = lib.GetGuildMemberInVoice(client, key) //get attacker voice state
        if (AttackerVoiceConnection !== undefined) {
            AttackerVoiceConnection.voice.disconnect() //disconnect attacker
            SubtractFromIncomming(key) //remove attacker from kick backlog
        }
    }
}

function SubtractFromIncomming(userid) {
    if (isNaN(incomming[userid])) {
        return
    } else if (incomming[userid] === 1) {
        delete incomming[userid]
        return
    } else {
        incomming[userid] = incomming[userid] - 1
        return
    }
}