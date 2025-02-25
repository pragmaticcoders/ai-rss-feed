// API URL
const API_URL = 'https://hook.eu1.make.com/nl5xbbv5a5azame5yyq86lh8xju49vu5';

// Variables to store articles and chat messages
let articles = [];
let messages = [];

const paywallEnabled = true;
let isAuthorized = false;


function fetchFeeds() {
    // Show loading indicator
    document.getElementById('loading').classList.remove('is-hidden');
    
    const limitInput = document.querySelector('input[name="limit"]');
    const assetSelect = document.querySelector('select[name="asset"]');
    let limit = parseInt(limitInput.value || 10)
    if (!isAuthorized && paywallEnabled) {
        limit = 3;
    }

    const selectedAsset = assetSelect.value;

    const requestData = {
        "limit": limit,
        "asset": selectedAsset
    };

    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Received data:', data);
        if (!data.data || !Array.isArray(data.data)) {
            console.error('Invalid data format received:', data);
            return;
        }
        articles = data.data;
        displayFeeds([data.data]); // Wrap in array to maintain compatibility
        updateAssetsOverview([data.data]); // Wrap in array to maintain compatibility
        document.getElementById('loading').classList.add('is-hidden');
    })
    .catch(error => {
        console.error('Error fetching feeds:', error);
        document.getElementById('loading').classList.add('is-hidden');
    });
}

function displayFeeds(feedsArray) {
    const feedsContainer = document.getElementById('feeds');
    feedsContainer.innerHTML = '';

    feedsArray.forEach((feeds) => {
        feeds.forEach((feed, index) => {
            const feedElement = document.createElement('div');
            feedElement.classList.add('card', 'mb-5');
            feedElement.style.animationDelay = `${index * 0.1}s`;

            feedElement.innerHTML = `
                <div class="card-content">
                    <p class="title">${feed.title}</p>
                    <p class="subtitle">${new Date(feed.publication_date).toLocaleString()}</p>
                    <div class="content">
                         <div class="summary-section">
                        ${feed.summary.split('Key Takeaways:')[0]}
                        </div>
                        <br>
                        <div class="key-takeaways-section">
                            <strong>Key takeaways:</strong>
                            ${(feed.summary.split('Key Takeaways:')[1] || '').split('•').join('<br>•')}
                        </div>
                        <br>
                        <a href="${feed.source_url}" target="_blank" class="button is-link is-small mt-3">Read More</a>
                    </div>
                    <div class="tags mt-3">
                        ${feed.assets.map(asset => `
                            <span class="tag is-${getImpactClass(asset.impact)}">
                                ${asset.asset} ${getSentimentIcon(asset.sentiment)}
                            </span>
                        `).join('')}
                    </div>
                </div>
            `;
            feedsContainer.appendChild(feedElement);
        });
    });
}

function getImpactClass(impact) {
    switch (impact) {
        case 'high':
            return 'danger';
        case 'medium':
            return 'warning';
        case 'low':
            return 'success';
        default:
            return 'light';
    }
}

function getSentimentIcon(sentiment) {
    switch (sentiment) {
        case 'bullish':
            return '<span class="icon has-text-success"><i class="fas fa-arrow-up"></i></span>';
        case 'neutral':
            return '<span class="icon has-text-grey"><i class="fas fa-minus"></i></span>';
        case 'bearish':
            return '<span class="icon has-text-danger"><i class="fas fa-arrow-down"></i></span>';
        default:
            return '';
    }
}

function updateAssetsOverview(feedsArray) {
    const assetsOverview = document.getElementById('assets-overview');
    const selectedAsset = document.querySelector('select[name="asset"]').value;
    let assetsMap = {};

    feedsArray.forEach(feeds => {
        feeds.forEach(feed => {
            feed.assets.forEach(asset => {
                const assetName = asset.asset;
                // Only include selected asset or all assets if "all" is selected
                if (selectedAsset === 'all' || selectedAsset === assetName) {
                    if (!assetsMap[assetName]) {
                        assetsMap[assetName] = {
                            name: assetName,
                            impacts: [],
                            sentiments: []
                        };
                    }
                    assetsMap[assetName].impacts.push(asset.impact);
                    assetsMap[assetName].sentiments.push(asset.sentiment);
                }
            });
        });
    });

    assetsOverview.innerHTML = '<h2 class="title is-4">Assets Overview</h2>';

    Object.values(assetsMap).forEach(asset => {
        const assetElement = document.createElement('div');
        assetElement.classList.add('asset-box');
        assetElement.innerHTML = `
            <h3 class="is-size-5 mb-3 has-text-weight-semibold">${asset.name}</h3>
            <div class="columns is-mobile">
                <div class="column">
                    <h4 class="is-size-6 mb-2">Impacts</h4>
                    <div class="tags mb-2">
                        ${countOccurrences(asset.impacts).map(impactCount => `
                            <span class="tag is-${getImpactClass(impactCount.value)}">
                                ${impactCount.value} (${impactCount.count})
                            </span>
                        `).join('')}
                    </div>
                    <canvas id="impact-chart-${asset.name.replace(/\s+/g, '-')}" height="150"></canvas>
                </div>
                <div class="column">
                    <h4 class="is-size-6 mb-2">Sentiments</h4>
                    <div class="mb-2">
                        ${countOccurrences(asset.sentiments).map(sentimentCount => `
                            <div class="mb-1">
                                ${getSentimentIcon(sentimentCount.value)}
                                ${sentimentCount.value} (${sentimentCount.count})
                            </div>
                        `).join('')}
                    </div>
                    <canvas id="sentiment-chart-${asset.name.replace(/\s+/g, '-')}" height="150"></canvas>
                </div>
            </div>
        `;
        assetsOverview.appendChild(assetElement);
        
        // Create impact chart
        const impactCounts = countOccurrences(asset.impacts);
        new Chart(document.getElementById(`impact-chart-${asset.name.replace(/\s+/g, '-')}`), {
            type: 'doughnut',
            data: {
                labels: impactCounts.map(item => item.value),
                datasets: [{
                    data: impactCounts.map(item => item.count),
                    backgroundColor: impactCounts.map(item => {
                        switch(item.value) {
                            case 'high': return '#f14668';
                            case 'medium': return '#ffdd57';
                            case 'low': return '#48c774';
                            default: return '#dbdbdb';
                        }
                    })
                }]
            },
            options: {
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });

        // Create sentiment chart
        const sentimentCounts = countOccurrences(asset.sentiments);
        new Chart(document.getElementById(`sentiment-chart-${asset.name.replace(/\s+/g, '-')}`), {
            type: 'doughnut',
            data: {
                labels: sentimentCounts.map(item => item.value),
                datasets: [{
                    data: sentimentCounts.map(item => item.count),
                    backgroundColor: sentimentCounts.map(item => {
                        switch(item.value) {
                            case 'bullish': return '#48c774';
                            case 'neutral': return '#dbdbdb';
                            case 'bearish': return '#f14668';
                            default: return '#dbdbdb';
                        }
                    })
                }]
            },
            options: {
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    });
}

function countOccurrences(array) {
    let counts = {};
    array.forEach(value => {
        counts[value] = (counts[value] || 0) + 1;
    });
    return Object.entries(counts).map(([value, count]) => ({ value, count }));
}

// Add event listeners
document.getElementById('feed-form').addEventListener('submit', function(event) {
    event.preventDefault();
    fetchFeeds();
});

document.getElementById('asset-select').addEventListener('change', function() {
    fetchFeeds();
});

// Initial fetch when page loads
fetchFeeds();

// Accordion toggle for Chat section
document.getElementById('chat-toggle').addEventListener('click', function() {
    if (!isAuthorized && paywallEnabled) {
        return
    }

    const chatContent = document.getElementById('chat-section');
    const chevronIcon = this.querySelector('.fa-chevron-down');
    chatContent.classList.toggle('is-hidden');
    chevronIcon.style.transform = chatContent.classList.contains('is-hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
    chevronIcon.style.transition = 'transform 0.3s ease';
});

// Handle chat message send button click
document.getElementById('chat-send-button').addEventListener('click', function() {
    const inputField = document.getElementById('chat-input');
    const messageContent = inputField.value.trim();

    if (messageContent !== '') {
        const userMessage = {
            role: 'user',
            content: messageContent
        };
        messages.push(userMessage);

        // Clear the input field
        inputField.value = '';

        // Update the chat window
        displayMessages();

        // Proceed to send the message to the server
        sendMessageToServer();
    }
});

function sendMessageToServer() {
    if (!isAuthorized && paywallEnabled) {
        return;
    }

    // Show loading indicator
    const chatWindow = document.getElementById('chat-window');
    const loadingElement = document.createElement('div');
    loadingElement.classList.add('message', 'is-assistant');
    loadingElement.innerHTML = `
        <div class="message-body loading-message">
            <span class="icon">
                <i class="fas fa-circle-notch fa-spin"></i>
            </span>
            <span>Thinking...</span>
        </div>
    `;
    chatWindow.appendChild(loadingElement);
    chatWindow.scrollTop = chatWindow.scrollHeight;

    const requestData = {
        messages: messages,
        articles: articles
    };

    fetch('https://hook.eu1.make.com/m13q3sbjrxohq49ks9dn8o17mvvyv7kh', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
    .then(response => response.json())
    .then(data => {
        // Remove loading message
        const loadingMessage = document.querySelector('.loading-message');
        if (loadingMessage) {
            loadingMessage.parentElement.remove();
        }

        // The response is a message from the assistant
        const assistantMessage = data;
        messages.push(assistantMessage);

        // Update the chat window to display the new message
        displayMessages();
    })
    .catch(error => {
        console.error('Error sending message to server:', error);
    });
}

function displayMessages() {
    const chatWindow = document.getElementById('chat-window');
    chatWindow.innerHTML = '';

    messages.forEach(message => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');

        if (message.role === 'user') {
            messageElement.classList.add('is-user');
            messageElement.style.textAlign = 'right';
            messageElement.innerHTML = `
                <div class="message-body">
                    ${message.content}
                </div>
            `;
        } else if (message.role === 'assistant') {
            messageElement.classList.add('is-assistant');
            messageElement.style.textAlign = 'left';
            messageElement.innerHTML = `
                <div class="message-body">
                    ${message.content}
                </div>
            `;
        }

        chatWindow.appendChild(messageElement);
    });

    // Scroll to the bottom of the chat window
    chatWindow.scrollTop = chatWindow.scrollHeight;
}


function validateAccessToken(token, bearer) {
    fetch("https://hook.eu1.make.com/4jc6vuhhv9drc2aoaqnp1fbs1c696kbw", {
        method: 'GET',
        headers: {
            'authaccesstoken': token,
            'bearer': bearer,
        },
    })
        .then(response => {
            if (response.ok && response.status === 200) {
                document.getElementById('stripe-container').classList.add('is-hidden')
                isAuthorized = true;
                fetchFeeds();
            }
        })
        .catch(error => {
            console.error('Error during access validation:', error);
        });
}


document.addEventListener('DOMContentLoaded', function () {
        if (!paywallEnabled) {
            document.getElementById('stripe-container').classList.add('is-hidden')
            return
        }

        const urlParams = new URLSearchParams(window.location.search);
        let loginToken = urlParams.get('access-token');
        let hash = urlParams.get('hash');


        if (loginToken && hash) {
            document.cookie = `loginToken=${loginToken}; path=/`;
            document.cookie = `hash=${hash}; path=/`;
            validateAccessToken(loginToken, hash);
        } else {
            let cookieLoginToken = getCookie('loginToken');
            let cookieHash = getCookie('hash');

            if (cookieLoginToken && cookieHash) {
                validateAccessToken(cookieLoginToken, cookieHash);
            }
        }
    }
)


function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function sendActivationCode() {
    // Show loading indicator
    document.getElementById('loading').classList.remove('is-hidden');

    const emailInput = document.querySelector('input[name="email"]');
    const email = emailInput.value;

    const requestData = {
        "email": email,
    };

    fetch("https://hook.eu1.make.com/171unf87fo759qg4m3acwa5og923jepu", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
        .then(response => {
            document.getElementById('loading').classList.add('is-hidden');
            document.getElementById('loginMessageSuccess').classList.add('is-hidden');
            document.getElementById('loginMessageNotPaid').classList.add('is-hidden');
            document.getElementById('loginMessageFailed').classList.add('is-hidden');

            if (response.ok && response.status === 200) {
                document.getElementById('loginMessageSuccess').classList.remove('is-hidden');
            }
            else  if (response.status === 402) {
                document.getElementById('loginMessageNotPaid').classList.remove('is-hidden');
            }
            if (response.status === 404) {
                document.getElementById('loginMessageFailed').classList.remove('is-hidden');
            }
        })
        .catch(error => {
            console.error('Error fetching feeds:', error);
            document.getElementById('loading').classList.add('is-hidden');
        });
}

document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();
    sendActivationCode();
});