const filterTypeSelect = document.getElementById('filter-type');
const filterValueSelect = document.getElementById('filter-value');

function fetchFeeds() {
    // Show the loading indicator
    document.getElementById('loading').classList.remove('is-hidden');

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
        })
        .finally(() => {
            // Hide the loading indicator
            document.getElementById('loading').classList.add('is-hidden');
        });
}

function displayFeeds(feeds) {
    const feedsContainer = document.getElementById('feeds');
    feedsContainer.innerHTML = ''; // Clear previous feeds

    feeds.forEach(feed => {
        const feedElement = document.createElement('div');
        feedElement.classList.add('card', 'mb-5');

        feedElement.innerHTML = `
            <div class="card-content">
                <div class="media">
                    <div class="media-content">
                        <p class="title is-4">${feed.title}</p>
                        <p class="subtitle is-6">${feed.publication_date}</p>
                    </div>
                </div>

                <div class="content">
                    ${feed.summary}
                    <br>
                    <a href="${feed.source_url}" target="_blank">${feed.source}</a>
                    <br><br>
                    <div class="tags">
                        <span class="tag is-info">${feed.sentiment}</span>
                        <span class="tag is-warning">${feed.impact}</span>
                        <span class="tag is-success">${feed.category}</span>
                    </div>
                </div>
            </div>
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

    // Reset the filter value to default
    filterValueSelect.value = "";
});

filterValueSelect.addEventListener('change', fetchFeeds);

// Fetch feeds initially and then every 30 seconds
fetchFeeds();
setInterval(fetchFeeds, 30000);
