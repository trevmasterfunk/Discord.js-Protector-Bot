module.exports = {
    name: 'checktimeout',
    description: "this is a ping command!",
    async execute(message, args) {
        let guild = message.guild.members
        message.delete()
        let timeoutcount = 0
        let todaysDate = new Date()
        guild.fetch().then(server_members => {
            for (const user of server_members) {
                if (user[1].communicationDisabledUntil !== null && (user[1].communicationDisabledUntil >= todaysDate)) {
                    console.log(user[1].user.username + " " + user[1].communicationDisabledUntil)
                    timeoutcount++
                }
            }
            if (timeoutcount == 0) {
                console.log("No users found")
            }
        })
    }
}