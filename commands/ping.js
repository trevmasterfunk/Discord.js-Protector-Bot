module.exports = {
    name: 'ping',
    description: "this is a ping command!",
    async execute(message, args, client) {
        message.channel.send("Pong");
    }
}