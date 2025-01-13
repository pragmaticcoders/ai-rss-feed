const filterTypeSelect = document.getElementById('filter-type');
const filterValueSelect = document.getElementById('filter-value');

function fetchFeeds() {
    const requestData = {
        "filter_by": filterTypeSelect.value || "",
        "filter": filterValueSelect.value || "",
        "limit": 10
    };

    fetch('https://hook.eu1.make.com/nl5xbbv5a5azame5yyq86lh8xju49vu5', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
        .then(response => response.json())
        .then(data => {
            displayFeeds(data.data);
        })
        .catch(error => {
            console.error('Error fetching feeds:', error);
            const feedsContainer = document.getElementById('feeds');
            feedsContainer.innerHTML = '<div class="notification is-danger">Error loading feeds. Please try again later.</div>';
        });
}

function displayFeeds(feeds) {
    const feedsContainer = document.getElementById('feeds');
    feedsContainer.innerHTML = ''; // Clear previous feeds

    feeds.forEach(feed => {
        const feedElement = document.createElement('div');
        feedElement.classList.add('box');

        feedElement.innerHTML = `
            <article class="media">
                <div class="media-content">
                    <div class="content">
                        <p>
                            <strong>${feed.title}</strong> <small>${feed.publication_date}</small>
                            <br>
                            ${feed.summary}
                        </p>
                    </div>
                    <nav class="level is-mobile">
                        <div class="level-left">
                            <span class="tag is-info">${feed.sentiment}</span>
                            <span class="tag is-warning">${feed.impact}</span>
                            <span class="tag is-success">${feed.category}</span>
                        </div>
                    </nav>
                </div>
                <div class="media-right">
                    <a href="${feed.source_url}" target="_blank" class="button is-link">Source</a>
                </div>
            </article>
        `;

        feedsContainer.appendChild(feedElement);
    });
}

filterTypeSelect.addEventListener('change', () => {
    const filterType = filterTypeSelect.value;
    filterValueSelect.innerHTML = '<option value="">Select Value</option>'; // Reset options

    let options = [];

    if (filterType === 'impact') {
        options = ['LOW', 'MEDIUM', 'HIGH'];
    } else if (filterType === 'sentiment') {
        options = ['Bullish', 'Neutral', 'Bearish'];
    } else if (filterType === 'category') {
        options = ['Stocks', 'Bonds', 'Commodities'];
    }

    // Populate filter values
    options.forEach(value => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        filterValueSelect.appendChild(option);
    });

    // Fetch feeds with the new filter
    fetchFeeds();
});

filterValueSelect.addEventListener('change', fetchFeeds);

// Fetch feeds initially and then every 30 seconds
fetchFeeds();
setInterval(fetchFeeds, 30000);
