// Get API URL from environment variable, fallback to /api/feeds if not set
const API_URL = process.env.URL || 'https://hook.eu1.make.com/nl5xbbv5a5azame5yyq86lh8xju49vu5';

function fetchFeeds() {
    // Show loading indicator
    document.getElementById('loading').classList.remove('is-hidden');
    
    const limitInput = document.querySelector('input[name="limit"]');
    const limit = limitInput.value || 10;

    const requestData = {
        "limit": parseInt(limit)
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
        displayFeeds(data.data);
        updateAssetsOverview(data.data);
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

    feedsArray.forEach(feeds => {
        feeds.forEach(feed => {
            const feedElement = document.createElement('div');
            feedElement.classList.add('card', 'mb-5');

            feedElement.innerHTML = `
                <div class="card-content">
                    <p class="title">${feed.title}</p>
                    <p class="subtitle">${new Date(feed.publication_date).toLocaleString()}</p>
                    <div class="content">
                        ${feed.summary}
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
    let assetsMap = {};

    feedsArray.forEach(feeds => {
        feeds.forEach(feed => {
            feed.assets.forEach(asset => {
                const assetName = asset.asset;
                if (!assetsMap[assetName]) {
                    assetsMap[assetName] = {
                        name: assetName,
                        impacts: [],
                        sentiments: []
                    };
                }
                assetsMap[assetName].impacts.push(asset.impact);
                assetsMap[assetName].sentiments.push(asset.sentiment);
            });
        });
    });

    assetsOverview.innerHTML = '<h2 class="title is-4">Assets Overview</h2>';

    Object.values(assetsMap).forEach(asset => {
        const assetElement = document.createElement('div');
        assetElement.classList.add('box');
        assetElement.innerHTML = `
            <h3 class="subtitle">${asset.name}</h3>
            <p>Impacts:</p>
            <ul>
                ${countOccurrences(asset.impacts).map(impactCount => `
                    <li>${impactCount.value}: ${impactCount.count}</li>
                `).join('')}
            </ul>
            <p>Sentiments:</p>
            <ul>
                ${countOccurrences(asset.sentiments).map(sentimentCount => `
                    <li>${sentimentCount.value}: ${sentimentCount.count}</li>
                `).join('')}
            </ul>
        `;
        assetsOverview.appendChild(assetElement);
    });
}

function countOccurrences(array) {
    let counts = {};
    array.forEach(value => {
        counts[value] = (counts[value] || 0) + 1;
    });
    return Object.entries(counts).map(([value, count]) => ({ value, count }));
}

// Add event listener to the form
document.getElementById('feed-form').addEventListener('submit', function(event) {
    event.preventDefault();
    fetchFeeds();
});

// Fetch feeds every 5 minutes (300,000 milliseconds)
setInterval(fetchFeeds, 300000);

// Also fetch feeds immediately when the page loads
fetchFeeds();
