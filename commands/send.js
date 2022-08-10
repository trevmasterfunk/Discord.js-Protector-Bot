module.exports = {
    name: 'send',
    description: "This command sends a DM to a user! Syntax: -send (id) (message)",
    async execute(message, args, client) {
        let userid = args[0]
        args.shift()
        let thismessage = args.join(' ')
        message.client.users.fetch(userid, false).then((user) => {
            if (!thismessage == '') {
                user.send(thismessage)
            }
            message.attachments.forEach(attachment => {
                const ImageLink = attachment.proxyURL
                user.send(ImageLink)
            })
        })


    }
}