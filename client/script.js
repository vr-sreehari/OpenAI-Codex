import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");

let loadInterval;

function loader(element) {
  element.textContent = "";
  loadInterval = setInterval(() => {
    element.textContent += ".";
    if (element.textContent === "....") {
      element.textContent = "";
    }
  }, 300);
}

function typeText(element, text) {
  let index = 0;
  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

function generateUniqueID() {
  const timestamp = Date.now();
  const random = Math.random();
  const hexadecimalString = random.toString(16);
  return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAI, value, uniqueID) {
  return `
    <div class="wrapper ${isAI && "ai"}">
    <div class="chat">
    <div class="profile"> 
    <img src="${isAI ? bot : user}"
    alt="${isAI ? "bot" : "user"}"
    />
    </div>
    <div class="message" id=${uniqueID}>
    ${value}
    </div>
    </div>
    </div> 
    `;
}

const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);
  //user stripe
  chatContainer.innerHTML += chatStripe(false, data.get("prompt"));
  form.reset();

  //bot strip

  const uniqueID = generateUniqueID();

  chatContainer.innerHTML += chatStripe(true, " ", uniqueID);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const msgDiv = document.getElementById(uniqueID);
  loader(msgDiv);

  //fetch data from server
  const response = await fetch("http://localhost:5000", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: data.get("prompt"),
    }),
  });

  clearInterval(loadInterval);
  msgDiv.innerHTML = "";

  if (response.ok) {
    const data = await response.json();
    const parseData = data.bot.trim();
    typeText(msgDiv, parseData);
  } else {
    const err = await response.text();
    msgDiv.innerHTML = "Something Went Wrong!...";
    alert(err);
  }
};

form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (e) => {
  e.keyCode === 13 && handleSubmit(e);
});
