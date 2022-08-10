module.exports = {
    name: 'kick',
    description: "this is a command to kick someone",
    async execute(message, args) {
        var kickid = args[0]
        if (args.length == 1) {
            var channels = message.client.channels.cache.values()
            for (let i = 0; i < message.client.channels.cache.size; i++) {
                var chan = channels.next().value
                if (chan.type === 'voice') {
                    var chanid = chan.id
                    var members = chan.members.keys()
                    for (let j = 0; j <= chan.members.size; j++) {
                        if (members.next().value === kickid) {
                            console.log("Match!")
                            var membertarget = message.client.channels.cache.get(chanid).members.get(kickid)
                            try {
                                await membertarget.voice.kick()
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