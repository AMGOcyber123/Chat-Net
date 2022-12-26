const socket = io() // Establish connection 
// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sideBarTemplate = document.querySelector('#sidebar-template').innerHTML

// Option
const {username, room } = Qs.parse(location.search, { ignoreQueryPrefix : true })
const autoscroll = () =>{

    // New message 
    const $newmessage = $messages.lastElementChild

    // Height of the message
    const newMessageStyle = getComputedStyle($newmessage)
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)     // get the bottom margin
    const newMessageHeight = $newmessage.offsetHeight + newMessageMargin    

    // Visible height
    const VisibleHeight = $messages.offsetHeight

    // Height container

    const containerHeight = $messages.scrollHeight

    // scroll offset

    const scrollOffset = $messages.scrollTop + VisibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset)
    {
        $messages.scrollTop = $messages.scrollHeight
    }

    console.log(newMessageMargin)
}

//console.log(username, room)


// When user enters the room
socket.on('message', (message) => {
    // console.log(message.text)
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username : message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm A')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (message) => {
    console.log(message)
    const html = Mustache.render(locationMessageTemplate, {
        username : message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm A')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData',({room,users}) =>{
    const html = Mustache.render(sideBarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

// Send Message
$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    $messageFormButton.setAttribute('disabled', 'disabled')
    const message = e.target.elements.message.value
    socket.emit('sendMessage',message, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if (error) {
            return console.log(error)
        }
        console.log('Message delivered!')
    })
})


// Send Location
$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }
    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location shared!')  
        })
    })
})


socket.emit('join',{username,room},(error) =>{
    if(error)
    {
        alert(error)
        location.href = '/'
    }
})


// socket.on('countupdate', (count)=>{  
//     console.log('Count is updated !'+(count++));
// })


// document.querySelector('#increment').addEventListener('click' , () => {
//     console.log('clicked');
//     socket.emit('increment')
// })
