// (async function () {
    document.addEventListener('DOMContentLoaded', function() {
  const app = document.querySelector(".app");
  const userList = document.getElementById('user-list');
  const chatBox = document.getElementById('chat-box');

  const socket = io();

  const welcomeMessage = document.getElementById('welcome-message');
  // console.log(welcomeMessage);
  const user_name = welcomeMessage.innerText;
  console.log(user_name,"usernames");
  socket.emit('user_connected', user_name);

//  const timepass=document.querySelector(".timepass")
//  timepass.innerHTML="<%= username %>"

  socket.on('connect', () => {
    console.log('Connected to server');
  });
 

  socket.on('user_list',async (users) => {
    // userList.innerHTML = users
    // .map((user) => {
    //   if (user === user_name) {
    //     // return `<li><button class="user-link";">${user}</button></li>`;
    //     console.log(user_name,user);
    //   } 
    //   else if (user){
    //     console.log("old");
    //     return `<li><button class="user-link">${user}</button></li>`;
    //   }
    // })
    // .join("");

  try {
    const response = await fetch('/get_receivers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({username: user_name }),
    });
    if (response.ok) {
      const receiversList = await response.json();
      // const receiversListElement = document.getElementById('receivers-list');
      const userLinks = document.querySelectorAll('.user-link');
     userLinks.innerHTML = '';

      receiversList.forEach(receiver => {
        const receiverItem = document.createElement('li');
        if (receiver===user_name) {
          // receiverItem.innerHTML=`<button class="user-link">You</button>`
        }
        else{
        receiverItem.innerHTML=`<button class="user-link">${receiver}</button>`
      }
        userList.appendChild(receiverItem);
      });
    } else {
      console.error('Failed to fetch receivers list');
    }
  } catch (error) {
    console.error('Error fetching receivers list:', error);
  }

    const userLinks = document.querySelectorAll('.user-link');
    userLinks.forEach((link) => {
      link.addEventListener('click', async () => {
        const targetUser = link.innerText;
        userLinks.forEach((otherLink) => {
          otherLink.classList.remove('clicked');
        });

        // <img id="receivedImage" style="max-width: 300px;">
        chatBox.innerHTML = `<div><h2 id='users_name'>
        ${targetUser}'s Chat </h2> <h3 id="type"></h3></div>
        <ul id="message-list">
        </ul>
        <div class="typearea">  
          <input type="text" id="message-input" placeholder="Type a message">
          <input type="file" id="img" name="image">
          <button id="send_button">Send</button> 
        </div>`;

        link.classList.add('clicked');
        const messageList = document.getElementById('message-list');
        const messageInput = document.getElementById('message-input');
        const sendButton = document.getElementById('send_button');

        try {
          const server_response = await fetch('/chat_history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sender: user_name, receiver: targetUser }),
          });

          if (server_response.ok) {
            const messageData = await server_response.json();
            messageData.forEach((message) => {
              const messageItem = document.createElement('li');
              if ( message.sender === user_name ) {
                const messageClass = message.sender === user_name? 'mychat' : 'yourchat';
                messageItem.className = messageClass;   
                messageItem.innerHTML = `<b> ${message.message}: You </b> `;
              }
              else{
                messageItem.className="yourchat"
                messageItem.textContent = `${message.sender}: ${message.message}`;
              }
              messageList.appendChild(messageItem);
            });
            chatBox.scrollTop = chatBox.scrollHeight;
          } else {
            console.error('Failed to fetch chat history');
          }
        } catch (error) {
          console.error('Error fetching chat history:', error);
        }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Image Share
var src 
const imgtag = document.getElementById("img")
        sendButton.addEventListener('click', () => {
          const message = messageInput.value;
         
          if (message.trim() !== '') {
            socket.emit('send_message', { targetUser, message });
            messageList.innerHTML += `<li class="mychat"><b>${message}:You</b> </li>`;
            messageInput.value = '';
            chatBox.scrollTop = chatBox.scrollHeight;                           
          }

const file = imgtag.files[0];
  if (file) {
    const reader = new FileReader();

    var sended_li = document.createElement('li')
    sended_li.classList.add("sended_li_img")
    var sended_img = document.createElement('img')
    reader.onload = (event) => {
        const dataURL = event.target.result;
      //  console.log(dataURL);
       src = dataURL
       socket.emit('image', {dataURL,targetUser});
      sended_img.style.width = '300px'; 
      sended_img.style.height = '200px';
      sended_img.src = dataURL;
      sended_li.appendChild(sended_img)
      messageList.appendChild(sended_li)
      chatBox.scrollTop = chatBox.scrollHeight; 
    };
  
    // console.log(reader);

    reader.readAsDataURL(file);
    chatBox.scrollTop = chatBox.scrollHeight; 
}
});

    socket.on('image', (dataURL) => {
      console.log("else");
      console.log(dataURL);
      var recived_li = document.createElement('li')
        recived_li.classList.add("received_li_img")
      var received_img = document.createElement('img')
      received_img.style.width = '300px'; 
      received_img.style.height = '200px';
      received_img.src = dataURL;
      recived_li.appendChild(received_img)
      messageList.appendChild(recived_li)
      chatBox.scrollTop = chatBox.scrollHeight; 
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        socket.on('receive_message', ({ sender, message }) => {
          if (sender === targetUser) {
            messageList.innerHTML += `<li class="yourchat"><strong>${sender}:</strong> ${message}</li>`;

    chatBox.scrollTop = chatBox.scrollHeight;                        
          }
        });
        
const typingStatus = document.getElementById('typingStatus');
let typingTimeout;

messageInput.addEventListener('keyup', (e) => {
  clearTimeout(typingTimeout);
  socket.emit('typing', targetUser);
  typingTimeout = setTimeout(() => {
    socket.emit('stopped_typing', targetUser);
  }, 3000); 
  if (e.key ==="Enter") {
    sendButton.click()
  }
});

socket.on('user_typing', (sender) => {
  typingStatus.innerHTML = `${sender} is typing...`;
});

socket.on('user_stopped_typing', () => {
  typingStatus.innerHTML = '';
});
      });
    });
  });

});
// })();
