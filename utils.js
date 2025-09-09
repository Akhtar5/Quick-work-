// utils.js
export function showCallPopup(phone) {
  const popup = document.createElement('div');
  popup.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: rgba(0,0,0,0.9);
    color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    font-family: Arial, sans-serif;
    text-align: center;
  `;

  popup.innerHTML = `
    <h2>📞 Calling</h2>
    <p style="font-size: 24px; margin: 10px 0;">${phone}</p>
    <p>Connecting...</p>
    <button onclick="this.parentElement.remove()" style="
      margin-top: 20px;
      padding: 10px 20px;
      background: #f44336;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    ">End Call</button>
  `;

  document.body.appendChild(popup);
}

export function showSMSPopup(phone) {
  const popup = document.createElement('div');
  popup.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: rgba(0,0,0,0.9);
    color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    font-family: Arial, sans-serif;
    text-align: center;
  `;

  popup.innerHTML = `
    <h2>💬 Send SMS</h2>
    <p>To: ${phone}</p>
    <textarea placeholder="Type your message..." rows="4" cols="30" style="
      margin: 10px;
      padding: 10px;
      border-radius: 8px;
      border: 1px solid #00ff8d;
      background: #0a1a1a;
      color: white;
    "></textarea>
    <div>
      <button onclick="this.parentElement.parentElement.remove()" style="
        padding: 8px 16px;
        background: #ccc;
        border: none;
        border-radius: 6px;
        margin: 0 5px;
      ">Cancel</button>
      <button onclick="alert('SMS sent!'); this.parentElement.parentElement.remove()" style="
        padding: 8px 16px;
        background: #00ff8d;
        border: none;
        border-radius: 6px;
        color: black;
        margin: 0 5px;
        cursor: pointer;
      ">Send</button>
    </div>
  `;

  document.body.appendChild(popup);
}
