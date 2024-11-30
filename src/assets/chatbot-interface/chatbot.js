(function () {
  let threadId = "";
  let welcomeMessage =
    "Hi, welcome to MiloChat! Go ahead and send me a message.";
  let aiMessageBackgroundColor = "#f7f7f7";
  let userMessageBackgroundColor = "#579ffb";
  let chatWindowBackgroundColor = "#ffffff";
  let widgetPosition = "bottom-right";
  let chatbotName = "DCL Chatbot";
  let companyName = "Distinct Cloud Labs";
  let botFontColor= "#FFFFFF"
  let userFontColor= "#FFFFFF"
  const visitorFormSubmittedKey = "visitorFormSubmitted";
  let chatRoomId;
  fetch("http://localhost:3001/api/v1/conversations/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chatbotId: "6707952105fda20e02353452", 
      receiverId: "6710a8418e7bbf172082c321", 
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
      chatRoomId=data.data._id
    })
    .catch((error) => {
      console.error("Error:", error);
    });

  // Add Google Fonts link
  function addGoogleFontLink() {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap";
    document.head.appendChild(link);
  }

  addGoogleFontLink();

  // Fetch user theme settings
  fetch(
    "http://localhost:3001/api/v1/themes/get-user-theme?chatBotId=6707952105fda20e02353452"
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.result === 1) {
        welcomeMessage = data.data.welcomeMessage;
        aiMessageBackgroundColor = data.data.aiMessageBackgroundColor;
        userMessageBackgroundColor = data.data.userMessageBackgroundColor;
        chatWindowBackgroundColor = data.data.chatWindowBackgroundColor;
        widgetPosition = data.data.widgetPosition;
        chatbotName = data.data.chatbotName;
        companyName = data.data.companyName
          ? data.data.companyName
          : data.data.chatbotName;
        botFontColor= data.data.botFontColor;
        userFontColor= data.data.userFontColor
        applyStyles();
        addMessage(welcomeMessage, false); // Display welcome message from AI
      }
    })
    .catch((error) => console.error("Error fetching user theme:", error));
  function applyStyles() {
    // Create a style element to hold our styles
    const style = document.createElement("style");
    style.innerHTML = `
        #chatbot-button {
            position: fixed;
            ${
              widgetPosition.includes("bottom") ? "bottom: 20px;" : "top: 20px;"
            }
            ${widgetPosition.includes("right") ? "right: 20px;" : "left: 20px;"}
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 50%;
            width: 60px;
            height: 60px;
            font-size: 24px;
            cursor: pointer;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            z-index: 99999999999;
            font-family: 'Roboto', sans-serif;
            
        }
        #chatbot-interface {
            display: none;
            position: fixed;
            ${
              widgetPosition.includes("bottom") ? "bottom: 80px;" : "top: 80px;"
            }
            ${widgetPosition.includes("right") ? "right: 60px;" : "left: 60px;"}
            width: 400px;
            height: 600px;
            background-color: ${chatWindowBackgroundColor};
            border: 1px solid #ccc;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            overflow: hidden;
            flex-direction: column;
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.3s ease, transform 0.3s ease;
            z-index: 99999999999;
            font-family: 'Roboto', sans-serif;
        }
        #chatbot-interface.open {
            display: flex;
            opacity: 1;
            transform: translateY(0);
        }
        #chatbot-header {
            background-color: #000000;
            color: #FFFFFF;
            padding: 10px;
            text-align: center;
            font-size: 18px;
        }
        #chatbot-messages {
            flex: 1;
            padding: 10px;
            overflow-y: auto;
        }
        #chatbot-input-box {
            background-color: #eceaf0
        }
        #chatbot-input {
           
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 4px;
            margin: 8px;
            background: #eceaf0;
            gap: 6px;
            border-radius: 32px;
        }
        #chatbot-input input {
            flex: 1;
            padding: 10px;
            border: none;
            // border-bottom-left-radius: 8px;
            border-radius: 32px;
            outline: none;
        }
        #chatbot-input button {
            padding: 2px;
            background-color: #6be3aa;
            color: black;
            border: none;
            cursor: pointer;
            // border-bottom-right-radius: 8px;
            border-radius: 40px;
        }
        .message {
            margin-bottom: 10px;
            padding: 10px;
            border-radius: 4px;
            font-size: 14px;
            max-width: 80%;
            position: relative;
            display: flex;
            flex-direction: column;
            color: #FFFFFF;
        }
        .user-message {
            background-color: ${userMessageBackgroundColor};
            align-self: flex-end;
            border-bottom-left-radius: 32px;
            border-bottom-right-radius: 32px;
            border-top-left-radius: 32px;
            // text-align: right;
            color:${userFontColor} !important
            
        }
        .ai-message {
            background-color: ${aiMessageBackgroundColor};
            align-self: flex-start;
            text-align: left;
            border-bottom-left-radius: 32px;
            border-bottom-right-radius: 32px;
            border-top-right-radius: 32px;
            color: ${botFontColor} !important
            
        }
        .message-content {
            margin-bottom: 5px;
        }
        .message-time {
            font-size: 12px;
            
        }
        #loading-indicator {
            display: none;
            text-align: center;
            padding: 10px;
            font-size: 14px;
            color: #007bff;
        }
        .user-message-wrapper{
          display: flex;
          flex-direction: row-reverse;
        }
        .header-wrapper{
          display: flex;
        align-items: center;
        justify-content: space-between;
        gap:20px
        }
        #visitor-form {
          padding: 10px;
          display: flex;
          flex-direction: column;
      }
      #visitor-form input {
          margin-bottom: 10px;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 4px;
      }
      #visitor-form button {
          padding: 10px;
          background-color: #007bff;
          color: white;
          border: none;
          cursor: pointer;
          border-radius: 4px;
      }
      #chatbot-input input:disabled {
        background-color: #e0e0e0;
        cursor: not-allowed;
    }
    #chatbot-input button:disabled {
        background-color: #a0a0a0;
        cursor: not-allowed;
    }
    #visitor-form button:disabled {
        background-color: #a0a0a0;
        cursor: not-allowed;
    }
    .error-message {
      display: none;
      color: red;
      font-size: 12px;
      margin-top: -10px;
      margin-bottom: 10px;
  }
    `;
    document.head.appendChild(style);
  }
  let aiContentDiv;
  // Create the chatbot button
  const chatbotButton = document.createElement("button");
  chatbotButton.id = "chatbot-button";
  chatbotButton.innerHTML = "&#128172;";
  document.body.appendChild(chatbotButton);

  // Create the chatbot interface
  const chatbotInterface = document.createElement("div");
  chatbotInterface.id = "chatbot-interface";
  chatbotInterface.innerHTML = `
      <div id="chatbot-header">${chatbotName}</div>
      <div id="chatbot-messages"></div>
      <div id="loading-indicator">Loading...</div>
      <div id="chatbot-input">
      <input id="chatbot-input-box" type='text' placeholder="Say something....."/>
      <button><img class="send-icon" src="./send.svg"  /></button>
      </div>
  `;
  // 
  // <div id="visitor-form">
  //       <input type="text" id="visitor-name" placeholder="Your name" required />
  //       <span class="error-message" id="name-error">Name is required</span>
  //       <input type="email" id="visitor-email" placeholder="Your email" required />
  //       <span class="error-message" id="email-error">Email is required</span>
  //       <input type="text" id="visitor-phone" placeholder="Your phone" required />
  //       <span class="error-message" id="phone-error">Phone is required</span>
  //       <button id="submit-visitor-form">Submit</button>
  //   </div>
  document.body.appendChild(chatbotInterface);

  // Show/hide the chatbot interface when the button is clicked
  chatbotButton.addEventListener("click", function () {
    if (chatbotInterface.classList.contains("open")) {
      chatbotInterface.classList.remove("open");
      setTimeout(function () {
        chatbotInterface.style.display = "none";
      }, 300); // Match the duration of the transition
    } else {
      chatbotInterface.style.display = "flex";
      setTimeout(function () {
        chatbotInterface.classList.add("open");
      }, 10); // Small delay to trigger the transition
    }
  });

  const visitorForm = chatbotInterface.querySelector("#visitor-form");
  const chatbotInput = chatbotInterface.querySelector("#chatbot-input");
  const sendButton = chatbotInput.querySelector("button");
  const chatbotInputBox = chatbotInput.querySelector("#chatbot-input-box");
  const messagesDiv = chatbotInterface.querySelector("#chatbot-messages");
  const loadingIndicator = chatbotInterface.querySelector("#loading-indicator");
  const submitVisitorFormButton = chatbotInterface.querySelector(
    "#submit-visitor-form"
  );
console.log(sendButton)

  // Check if the visitor form has been submitted
 

  function formatAMPM(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? "0" + minutes : minutes;
    const strTime = hours + ":" + minutes + " " + ampm;
    return strTime;
  }

  function addMessage(content, isUser = true, messageRef = null) {
    if (messageRef) {
      // If a reference is provided, append the text to that reference
      messageRef.textContent += content; 
      return messageRef; // Return the reference
    }
  
    // Create a new message if no reference is provided
    const messageDiv = document.createElement("div");
    const mainDiv = document.createElement("div");
    mainDiv.classList.add(
      isUser ? "user-message-wrapper" : "ai-message-wrapper"
    );
    messageDiv.classList.add("message", isUser ? "user-message" : "ai-message");
  
    const headerDiv = document.createElement("div");
    headerDiv.classList.add("header-wrapper");
    const nameDiv = document.createElement("div");
    nameDiv.classList.add("message-header");
    nameDiv.textContent = isUser ? "You" : chatbotName;
  
    const timeDiv = document.createElement("div");
    timeDiv.classList.add("message-time");
    timeDiv.textContent = formatAMPM(new Date());
    headerDiv.appendChild(nameDiv);
    headerDiv.appendChild(timeDiv);
    
    const contentDiv = document.createElement("div");
    contentDiv.textContent = content;
  
    messageDiv.appendChild(headerDiv);
    messageDiv.appendChild(contentDiv);
    mainDiv.appendChild(messageDiv);
    
    messagesDiv.appendChild(mainDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  
    if (!isUser) {
      aiContentDiv = contentDiv; // Store it in a global or closure variable
    }
  
    return contentDiv; // Return the reference of the newly created message
  }
  function updateMessage(chunk) {
    if (aiContentDiv) {
      // Append the chunk to the existing message content
      aiContentDiv.textContent += chunk;
      messagesDiv.scrollTop = messagesDiv.scrollHeight; // Scroll to the bottom
    }
  }

  function setLoading(loading) {
    // const inputs = visitorForm.querySelectorAll("input");
    // inputs.forEach((input) => (input.disabled = loading));
    loadingIndicator.style.display = loading ? "block" : "none";
    sendButton.disabled = loading;
    // submitVisitorFormButton.disabled = loading;
    chatbotInputBox.disabled = loading;
  }

  function getDeviceType() {
    const userAgent = navigator.userAgent;
    if (/mobile/i.test(userAgent)) {
      return "Mobile";
    } else if (/tablet/i.test(userAgent)) {
      return "Tablet";
    } else {
      return "Desktop";
    }
  }

  // submitVisitorFormButton.addEventListener("click", function () {
  //   const visitorName = document.getElementById("visitor-name").value.trim();
  //   const visitorEmail = document.getElementById("visitor-email").value.trim();
  //   const visitorPhone = document.getElementById("visitor-phone").value.trim();
  //   let isValid = true;

  //   if (!visitorName) {
  //     document.querySelector("#name-error").style.display = "block";
  //     isValid = false;
  //   } else {
  //     document.querySelector("#name-error").style.display = "none";
  //   }

  //   if (!visitorEmail) {
  //     document.querySelector("#email-error").style.display = "block";
  //     isValid = false;
  //   } else {
  //     document.querySelector("#email-error").style.display = "none";
  //   }

  //   if (!visitorPhone) {
  //     document.querySelector("#phone-error").style.display = "block";
  //     isValid = false;
  //   } else {
  //     document.querySelector("#phone-error").style.display = "none";
  //   }

  //   if (!isValid) return;

  //   const visitorData = {
  //     name: visitorName,
  //     email: visitorEmail,
  //     phone: visitorPhone,
  //     deviceType: getDeviceType(),
  //   };
  //   setLoading(true);
  //   fetch(`http://localhost:3001/api/v1/conversations/get-conversation-message?receiverId=66e934f4f77214180d4ad2c5&chatbotId=66e934f4f77214180d4ad2c5`, {
  //     method: "GET",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     // body: JSON.stringify(visitorData),
  //   })
  //     .then((response) => response.json())
  //     .then((data) => {
  //       setLoading(false);
  //       if (data.result === 1) {
  //         localStorage.setItem(visitorFormSubmittedKey, "true");
  //         visitorForm.style.display = "none";
  //         chatbotInput.style.display = "flex";
  //       } else {
  //         console.error("Error creating visitor:", data.message);
  //       }
  //     })
  //     .catch((error) => {
  //       setLoading(false);
  //       console.error("Error creating visitor:", error);
  //     });
  // });

  sendButton.addEventListener("click", function () {
    console.log('first')
    const message = chatbotInputBox.value.trim();
    if (message) {
      // Add the user's message to the chat interface
      addMessage(message, true);
      const currRef = addMessage('', false);
      chatbotInputBox.value = "";
      setLoading(true);
      // Show loading indicator
      loadingIndicator.style.display = "block";

      // Perform an API call to send the message
      fetch("http://localhost:3001/api/v1/ai/chat?chatbotId=6710a8418e7bbf172082c098", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatRoomId: chatRoomId,
          question: message,
        }),
      })
        // .then((response) => response.json())
        // .then((data) => {
        //   setLoading(false);
        //   if (data.result === 1) {
        //     threadId = data.data.threadId; // Save threadId for future interactions
        //     addMessage(data, false); // Add AI message
        //   } else {
        //     alert("Error sending message. Please try again.");
        //   }
        // })
        .then((response) => {
          // Ensure the response is okay
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          // Read the streamed response body
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let aiMessage = "";
  
          // Function to handle reading chunks of the stream
          function readStream() {
            reader.read().then(({ done, value }) => {
              if (done) {
                // Done reading stream
                setLoading(false);
                loadingIndicator.style.display = "none";
                // Display the final AI message only after the stream has finished
                
                return;
              }
  
              // Decode the chunk of data received and accumulate it
              aiMessage = decoder.decode(value, { stream: true });
              addMessage(aiMessage, false,currRef);
              
              // Continue reading the next chunk
              readStream();
            });
          }
  
          // Start reading the stream
          readStream();
        })
        .catch((error) => {
          setLoading(false);
          console.error("Error:", error);
          loadingIndicator.style.display = "none";
          addMessage("Error sending message. Please try again.", false);
        });
    }
  });

  chatbotInputBox.addEventListener("keypress", function (event) {

    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendButton.click();
    }
  });
})();
