// Hero Chat functionality
const heroChatInput = document.getElementById('hero-chat-input');
const heroChatSend = document.getElementById('hero-chat-send');
const heroChatMessages = document.getElementById('hero-chat-messages');

// Event listeners
heroChatSend.addEventListener('click', sendMessage);
heroChatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Add message
function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = content;
    
    messageDiv.appendChild(contentDiv);
    heroChatMessages.appendChild(messageDiv);
}

// Show typing indicator
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message';
    typingDiv.id = 'typing-indicator';
    
    const indicatorDiv = document.createElement('div');
    indicatorDiv.className = 'typing-indicator';
    indicatorDiv.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    
    typingDiv.appendChild(indicatorDiv);
    heroChatMessages.appendChild(typingDiv);
}

// Remove typing indicator
function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
}

// Show error
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    heroChatMessages.appendChild(errorDiv);
}

// Send message
async function sendMessage() {
    const message = heroChatInput.value.trim();
    if (!message) return;
    
    // Clear previous messages
    heroChatMessages.innerHTML = '';
    
    addMessage(message, true);
    heroChatInput.value = '';
    heroChatInput.disabled = true;
    heroChatSend.disabled = true;
    showTypingIndicator();
    
    try {
        // Call Netlify serverless function
        const response = await fetch('/.netlify/functions/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
        });
        
        const data = await response.json();
        
        // Handle rate limit error
        if (response.status === 429) {
            removeTypingIndicator();
            showError(data.message || 'Too many requests. Please try again later.');
            return;
        }
        
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        
        removeTypingIndicator();
        addMessage(data.message, false);
        
    } catch (error) {
        console.error('Error:', error);
        removeTypingIndicator();
        showError('Sorry, I encountered an error. Please try again.');
    } finally {
        heroChatInput.disabled = false;
        heroChatSend.disabled = false;
        heroChatInput.focus();
    }
}
