  (async function () {
  const app = document.querySelector(".app");
  // const joinScreen = document.querySelector(".join-screen");
  const userList = document.getElementById('user-list');
  const chatBox = document.getElementById('chat-box');
  // const usernameInput = document.getElementById('username');
  // const joinButton = document.getElementById('join-user');
  // const roombutton = document.getElementById('roombutton');

  const socket = io();

  // joinButton.addEventListener('click', () => {
  //   const username = usernameInput.value.trim();
  //   if (username !== '') {
  //     socket.emit('user_connected', username);
  //     joinScreen.style.display = 'none';
  //   }
  // });


  // const usernameInput = document.getElementById('username');
  // roombutton.addEventListener('click', () => {
  //   const enteredUsername = usernameInput.value.trim();
  //   if (enteredUsername !== '') {
  //     socket.emit('user_connected', enteredUsername);
  //     localStorage.setItem('username', enteredUsername);
  //     // Redirect to the second page
  //     window.location.href = 'GroupChat.html';
  //   }
  // });
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

//

    const userLinks = document.querySelectorAll('.user-link');
    userLinks.forEach((link) => {
      link.addEventListener('click', async () => {
        // console.log("hello");
        const targetUser = link.innerText;
        userLinks.forEach((otherLink) => {
          otherLink.classList.remove('clicked');
        });

        chatBox.innerHTML = `<div><h2 id='users_name'>
        ${targetUser}'s Chat </h2> <h3 id="type"></h3></div>
        <ul id="message-list"></ul>
        <div class="typearea">  
          <input type="text" id="message-input" placeholder="Type a message">
          <input type="file" id="upload_img" ">
          <button id="send-button">Send</button> 
        </div>`;
        // <label for="upload">
        // <input type="file" id="upload_img"/>
        // <span class="glyphicon glyphicon-folder-open" aria-hidden="true"></span>
        // </label>
      
        link.classList.add('clicked');
        const messageList = document.getElementById('message-list');
        const messageInput = document.getElementById('message-input');
        const sendButton = document.getElementById('send-button');
        const  typing = document.getElementById("type")

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
            // Scroll to the bottom of the messageList
            messageList.scrollTop = messageList.scrollHeight;
          } else {
            console.error('Failed to fetch chat history');
          }
        } catch (error) {
          console.error('Error fetching chat history:', error);
        }
//
        // messageInput.keyup(function (e) {
        //   socket.emit('is typing',  {targetUser});
        // messageList.innerHTML += `<li class="mychat"><b>${targetUser} is typing</b> </li>`;
        // })

            // const messageInput = document.getElementById('messageInput');
//
        sendButton.addEventListener('click', () => {
          const message = messageInput.value;
         
          if (message.trim() !== '') {
            socket.emit('private_message', { targetUser, message });
            messageList.innerHTML += `<li class="mychat"><b>${message}:You</b> </li>`;
            messageInput.value = '';
            messageList.scrollTop = messageList.scrollHeight;
          }
        });

        socket.on('private_message', ({ sender, message }) => {
          if (sender === targetUser) {
            messageList.innerHTML += `<li class="yourchat"><strong>${sender}:</strong> ${message}</li>`;

    //         messageInput.addEventListener('keypress', function(){
    //           socket.emit('typing',sender);
    //       });
          
    // socket.on('typing', function(sender){
    //   if (sender) {
    //     messageList.innerHTML = '<p><em>' + sender + ' is typing...</em></p>';
    //     console.log('<p><em>' + sender + ' is typing...</em></p>');
    //     console.log("typing");
    //   } else {
    //     messageList.innerHTML = ''
    //     console.log("not typing");
    //   }
    // });
            messageList.scrollTop = messageList.scrollHeight;                        
          }
        });

        const typingStatus = document.getElementById('typingStatus');
let typingTimeout;

messageInput.addEventListener('keyup', () => {
  clearTimeout(typingTimeout);
  socket.emit('typing', targetUser);
  typingTimeout = setTimeout(() => {
    socket.emit('stopped_typing', targetUser);
  }, 3000); 
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
})();
