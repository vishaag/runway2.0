# Financial Runway Calculator

## Description

The Financial Runway Calculator is a web application that helps users estimate how long their current liquid assets will last based on their monthly expenses, expected return rate, and inflation. It provides a visual representation of the financial projection through both a detailed table and an interactive chart.

This tool is particularly useful for:
- Financial planning
- Retirement calculations
- Understanding the long-term impact of inflation and investment returns
- Visualizing financial growth or decline over time

## Features

- Currency selection with automatic symbol updates
- Real-time input formatting for easy number entry
- Dynamic calculation of financial runway
- Color-coded table for easy interpretation of financial health
- Interactive line chart for visual representation of networth over time
- Local storage to save and retrieve user inputs
- Responsive design for both desktop and mobile use

## Tech Stack

- HTML5
- CSS3 with Tailwind CSS for styling
- JavaScript (ES6+)
- Chart.js for data visualization
- Express.js for serving the application
- Node.js as the runtime environment

## Setup and Running

1. Clone the repository
2. Run `npm install` to install dependencies
3. Start the server with `node server.js`
4. Access the application at `http://localhost:3000`

## Contributing

Contributions, issues, and feature requests are welcome. Feel free to check issues page if you want to contribute.

## License

[MIT](https://choosealicense.com/licenses/mit/)

## Deployment

This application is configured for deployment on Vercel. To deploy:

1. Install the Vercel CLI: `npm i -g vercel`
2. Run `vercel login` and follow the prompts to log in to your Vercel account
3. In the project root directory, run `vercel` to deploy
4. Follow the prompts to link your project to a Vercel project
5. Once deployed, Vercel will provide you with a URL for your application

For subsequent deployments, simply run `vercel` in the project root.

## Social Media Sharing

This app includes Open Graph meta tags for rich sharing on social media platforms. The OG image (`og-image.png`) is located in the `public` folder and is set to be displayed when the app URL is shared on platforms like Facebook, Twitter, and LinkedIn.