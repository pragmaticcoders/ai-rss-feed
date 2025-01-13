# Finanacial Feed Frontend Specification

## High-Level Objective
- Create a simple frontend application displaying a list of financial feeds

## Mid-Level Objective
- Display a list of finanacial feeds in eye-pleasant way
- Fetch feeds every 30 seconds
- Display the publication date, title, summary, source, source_url, sentinement, impact and category

## Implementation Notes
- Use Bulma CSS framework for styling
- Use JavaScript to fetch the feeds and display them
- API can be found here: https://hook.eu1.make.com/nl5xbbv5a5azame5yyq86lh8xju49vu5
- The API request format:
```
{
	"filter_by": "impact", // The field by which to filter the financial feeds (e.g., impact, sentiment, category)
	"filter": "HIGH", // The value of the filter to apply (e.g., HIGH, MEDIUM, LOW for impact)
	"limit": 10 // The maximum number of financial feeds to retrieve
}
```
- The API response format:
```
{
  "feeds": [
    {
      "publication_date": "2024-01-01", // The date when the financial feed was published
      "title": "Financial Feed", // The title of the financial feed
      "summary": "Financial Feed", // A brief summary of the financial feed content
      "source": "Financial Feed", // The name of the source providing the financial feed
      "source_url": "Financial Feed", // The URL to the original source of the financial feed
      "sentinement": "Financial Feed", // The sentiment analysis result of the financial feed, indicating a bullish, neutral, or bearish sentiment
      "impact": "Financial Feed", // The estimated impact of the financial feed on the market or a specific sector - LOW, MEDIUM, HIGH
      "category": "Financial Feed" // The category or type of information provided by the financial feed (e.g., stocks, bonds, commmodities)
    }
  ]
}
```

## Context

### Beginning context
- index.html

### Ending context
- index.html
- style.css
- script.js

## Low-Level Tasks
> Ordered from start to finish
 
1. [First task - what is the first task?]
```aider
MODIFY index.html:
    CREATE html structure representing the financial feed, 
    use Bulma CSS framework for styling,
    the structure must be responsive and eye-pleasant, 
    all custom styles should be in style.css,
    the main content should be in the center of the page,
    the page should have a header and a footer,
    the header should have the title of the application - "AI Financial Feeds",
    the to the right of the main content should be the menu with filtering,
```

2. Fetch data 
```aider
CREATE script.js:
    use JavaScript to fetch the feeds and display them,
    fetch the feeds every 30 seconds,
    display the publication date, title, summary, source, source_url, sentinement, impact and category,
```

3. [Third task - what is the third task?]
```aider
MODIFY index.html:
    SUPPORT filtering the feeds by impact, sentiment and category using selectors for field and value,
    the selectors should be in the form of a dropdown menu,
    the dropdown menu should be in the top-right corner of the page,
    the dropdown menu should have the following options:
        - impact: LOW, MEDIUM, HIGH
        - sentiment: BULLISH, NEUTRAL, BEARISH
        - category: STOCKS, BONDS, COMMODITIES
```