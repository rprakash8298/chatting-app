const users = []

const addUser = ({id, username, room}) => {
    // clean data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // validate user
    if (!username || !room) {
        return {
            error:'username and room are required'
        }
    }
    // check existing user or not
    const existingUser = users.find(user => {
        return user.room === room && user.username === username
    })
    // validate existing user
    if (existingUser) {
        return {
            error:'username is in use'
        }
    }
    // store user
    const user = { id, username, room }
    users.push(user)
    return {user}
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)
    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    return users.find((ids) => ids.id === id)
}

const getUsersRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter((user) => user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersRoom
}