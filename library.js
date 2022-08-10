function GetGuildMemberInVoice(client, UserId) {
    let AllChannels = client.channels.cache.values()
    for (let i = 0; i < client.channels.cache.size; i++) {
        let ThisChannel = AllChannels.next().value
        if (ThisChannel.type === 2) {
            let chanid = ThisChannel.id
            let members = ThisChannel.members.keys()
            for (let j = 0; j <= ThisChannel.members.size; j++) {
                if (members.next().value === UserId) {
                    return client.channels.cache.get(chanid).members.get(UserId);
                }
            }
        }
    }
}

function ObjectDifferences(was, is) {
    for (const key in is) {
        if (!(key in was)) {
            return is[key].user
        }
    }
    for (const key in is) {
        for (const prop in is[key]) {
            if (is[key][prop] !== was[key][prop]) {
                return is[key].user
            }
        }
    }
    return ""
}

module.exports = {
    GetGuildMemberInVoice,
    ObjectDifferences
}