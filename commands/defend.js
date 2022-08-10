module.exports = {
    name: 'defend',
    description: "this is a command to defend someone from server deaf and server mute",
    async execute(message, args) {
        if (message.author.id === "353267226733838349") {
            var defendid = args[0]
            if (args.length == 1) {
                var channels = message.client.channels.cache.values()
                for (let i = 0; i < message.client.channels.cache.size; i++) {
                    var chan = channels.next().value
                    if (chan.type === 'voice') {
                        var chanid = chan.id
                        var members = chan.members.keys()
                        for (let j = 0; j <= chan.members.size; j++) {
                            if (members.next().value === defendid) {
                                var membertarget = message.client.channels.cache.get(chanid).members.get(defendid).voice
                                if (membertarget.serverDeaf) {
                                    try {
                                        await membertarget.setDeaf(false)
                                        console.log("Defended " + defendid + " from deafened")
                                    } catch (e) {
                                        console.error(e)
                                    }
                                }
                                if (membertarget.serverMute) {
                                    try {
                                        await membertarget.setMute(false)
                                        console.log("Defended " + defendid + " from mute")
                                    } catch (e) {
                                        console.error(e)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}