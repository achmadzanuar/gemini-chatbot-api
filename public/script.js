const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

// An array to hold the chat history for context.
const messages = [];

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  // Add user message to UI and history
  appendMessage('user', userMessage);
  messages.push({ role: 'user', content: userMessage });

  // Clear input and set focus
  input.value = '';
  input.focus();

  // Create a placeholder for the bot's response
  const botMessageElement = appendMessage('bot', 'Thinking...');

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Send the entire message history for context
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response from server.' }));
      throw new Error(errorData.error || `Server responded with status: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.result) {
      // Update placeholder with the actual response
      botMessageElement.textContent = data.result;
      // Add bot response to history. The Gemini API uses 'model' for the bot's role.
      messages.push({ role: 'model', content: data.result });
    } else {
      botMessageElement.textContent = 'Sorry, no response received.';
    }
  } catch (error) {
    console.error('Error fetching chat response:', error);
    botMessageElement.textContent = `Error: ${error.message || 'Failed to get response from server.'}`;
  } finally {
    // Ensure the chatbox is scrolled to the bottom to show the latest message
    chatBox.scrollTop = chatBox.scrollHeight;
  }
});

/**
 * Appends a message to the chat box.
 * @param {string} sender - The sender of the message ('user' or 'bot').
 * @param {string} text - The message content.
 * @returns {HTMLElement} The created message element.
 */
function appendMessage(sender, text) {
  const msgElement = document.createElement('div');
  msgElement.classList.add('message', sender);
  msgElement.textContent = text;
  chatBox.appendChild(msgElement);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msgElement;
}
