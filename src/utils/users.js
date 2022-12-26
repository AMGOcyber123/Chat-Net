// Add user
// Remove user
// Get user
// Get user in room

const users = []

const addUser = ({ id, username, room }) => {
    // Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // Validate the data
    if (!username || !room) {
        return {
            error: 'Username and room are required!'
        }
    }

    // Check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    // Validate username
    if (existingUser) {
        return {
            error: 'Username already taken!'
        }
    }

    // Store user
    const user = { id, username, room }
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id)
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter((user) => user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}

// TESTING

// addUser({
//     id : 22,
//     username : "aayu",
//     room: "xqc_1"
// })

// addUser({
//     id : 23,
//     username : "mac",
//     room: "xqc_1"
// })

// addUser({
//     id : 24,
//     username : "jack",
//     room: "xqc_1"
// })



// console.log(users)

// const removedUser = removeUser(22)
// console.log(removedUser)

// console.log(users)

// console.log(getUsers(22))
// console.log(getUserInRoom("xqc_1"))