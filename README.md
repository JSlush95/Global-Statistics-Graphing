# Global Developments - Visualization
This project presents a Javascript web-based visualization tool designed to explore global development statistics across various regions. It utilizes D3.js for creating dynamic charts and Bootstrap for responsive styling.

## Features
- Country Selection: Users can select specific regions to display corresponding data.
- Time Lapse Visualization: Allows users to visualize changes in data over the years using interactive charts.
- Interactive Charts: Includes beeswarm and scatter plots for detailed data representation.

## Installation
``git clone https://github.com/jslush95/global-developments-statistics.git``

## Usage
- Using an IDE (e.g., Visual Studio Code):
1) Open the project folder in your IDE.
2) Ensure you have the Live Server extension installed.
3) Run it through Live Server (right click the ``index.html`` for the "Open with Live Server" option), or another extension of your choice.

- Using Command Line (Node.js HTTP Server):
1) Install Node.js if not already installed: [Node.js Official Website](https://nodejs.org/en)
2) Navigate to the project directory in your terminal or command prompt.
3) Install http-server globally using npm:
``npm install -g http-server``
4) Start the server:
``http-server``
5) Open your web browser and navigate to the provided localhost port (e.g. http://localhost:8080), this will show the application.

## Technologies Used
- [D3.js](https://d3js.org/) - To create dynamic and interactive data visualizations.
- [Bootstrap](https://getbootstrap.com/) - To design responsive and modern UI.
- JavaScript - To handle the logic and data processing.

## Code Overview
The main structure of the application is defined in the ``index.html`` file. Key elements include:
- Checkboxes for selecting regions of interest.
- Dropdowns for selecting attributes and years.
- SVG elements for displaying beeswarm and scatter plots.

### CSS is used to enhance the visual appeal and responsiveness of the layout:
- Tooltip styling for interactive and detailed data display.
- Text styles for clarity and readability.

### JavaScript Logic
The JavaScript logic manages data processing and chart rendering. Key functions include:<br>
``preparebeeData(year)``
- Collects data based on selected regions and prepares it for beeswarm chart visualization.

``drawBeeswarmChart(year, countryList)``
- Uses D3.js to draw a beeswarm chart depicting data for the selected year and countries.

``startTimeLapse(currentIndex)``
- Initiates a time lapse feature to sequentially display data for multiple years.

``stopTimeLapse()``
- Stops the ongoing time lapse and resets the application state.

## Tooltips Functionality
Tooltips are implemented to provide additional context and information:
- Displayed dynamically based on user interactions with chart elements.
- Positioned near the mouse cursor for easy visibility and interaction.
- Tooltip content updates based on the selected chart element, enhancing data exploration.