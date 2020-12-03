const socket = io()
const $sendMessage = document.querySelector('#sendMessage')
const inputText = document.querySelector('#mess')
const locButton = document.querySelector('#send-location')
const messages = document.querySelector('#messages')
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML
// messageTemplate = document.querySelector('#message-template').innerHTML
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoScroll = () => {
    // new message element
    const $newMessage = messages.lastElementChild

    // height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    
    // visisble height
    const visibleHeight = messages.offsetHeight

    // height of message container
    const constainerHeight = messages.scrollHeight
    // how far i have scrolled
    const scrollOffSet = messages.scrollTop + visibleHeight
    if (constainerHeight - newMessageHeight <= scrollOffSet) {
        messages.scrollTop = messages.scrollHeight
    }

}
socket.on('joinMess', (message) => {
    console.log(message)

    // const html = Mustache.render(messageTemplate, {
    //     message:message.text,
        //    createdAt:moment(message.createdAt).format('h:mm a')
    // })
    // messages.insertAdjacentHTML('beforeend',html)
    const markup = `
    <div class="message">
      <p>
      <span class="message__name">${message.username}</span>
      <span class="message__meta">${moment(message.createdAt).format('h:mm a')}</span>
      </p>
      <p>${message.text}</p>
      </div>
    `;
    messages.insertAdjacentHTML('beforeend', markup)
    autoScroll()
})

socket.on('locationMess', (messLoc) => {
    console.log(messLoc)
    const markup = `
    <div>
    <p>
      <span class="message__name">${messLoc.username}</span>
      <span class="message__meta">${moment(messLoc.createdAt).format('h:mm a')}</span>
      </p>
     <a href="${messLoc.url}" target="_blank">My Location
    </div>
    `;
    messages.insertAdjacentHTML('beforeend', markup)
    autoScroll()
})


socket.on('roomData', ({room,users}) => {
    // console.log(data)
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$sendMessage.addEventListener('submit', (e) => {
    e.preventDefault()
    $sendMessage.setAttribute('disabled','disabled')
    const input = inputText.value
    socket.emit('clientMess', input, (error) => {
        $sendMessage.removeAttribute('disabled')
        inputText.value = ''
        inputText.focus()
        if(!error) {
            console.log(error)
        }
        console.log('message was delivered')
    })

})
locButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        alert('location not supported')
    }
    locButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
         lat : position.coords.latitude,
         long : position.coords.longitude
        }, (locMessage) => {
        locButton.removeAttribute('disabled')
        console.log('location sent', locMessage)
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})