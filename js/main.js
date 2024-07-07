document.addEventListener('DOMContentLoaded', init);

// Global variables.
let uniqueYears, region_data, global_data, countryCodeMapping, colorScale;
const countryRegionPairs = [];
let timeout, timeLapse = false, prevXAttribute;

// Initialization function that will be called on DOMContentLoaded.
function init() {
    // Selecting SVG and extracting their dimensions.
    const svg = d3.select('#chartObject');
    const width = +svg.style('width').replace('px','');
    const height = +svg.style('height').replace('px','');

    // Selecting the various elements from DOM.
    const attributeSelectX = document.getElementById("attributeSelectX");
    const attributeSelectSize = document.getElementById("attributeSelectSize");
    const selectAllButton = document.getElementById("selectAll");
    const deselectAllButton = document.getElementById("deselectAll");
    const regionCheckboxes = document.querySelectorAll('.checkbox-control input[type="checkbox"][value]');
    const yearSelect = document.getElementById("yearSelect");
    const button = document.getElementById("button");
    const tooltip = document.getElementById("tooltip");
    const tooltipText = document.getElementById("tooltipText");
    const userWarning = document.getElementById("user-warning");

    // Load the data asynchronously and then continue initialization.
    loadData().then(() => {
        populateSelectors(global_data.columns, attributeSelectX, attributeSelectSize);
        initializeEventListeners(attributeSelectX, attributeSelectSize, yearSelect, selectAllButton, deselectAllButton, regionCheckboxes, button);
    });

    function initializeEventListeners(attributeSelectX, attributeSelectSize, yearSelect, selectAllButton, deselectAllButton, regionCheckboxes, button) {
        // Event listeners for the UI elements.
        selectAllButton.addEventListener("click", () => handleSelectAll(regionCheckboxes));
        deselectAllButton.addEventListener("click", () => handleDeselectAll(regionCheckboxes));
        attributeSelectX.addEventListener("change", () => preparebeeData(yearSelect.value));
        attributeSelectSize.addEventListener("change", () => preparebeeData(yearSelect.value));
        yearSelect.addEventListener("change", () => preparebeeData(yearSelect.value));
        button.addEventListener("click", () => handleTimeLapse(yearSelect, uniqueYears));


        // Event listeners for the region checkboxes.
        regionCheckboxes.forEach(checkbox => {
            checkbox.addEventListener("click", () => {
                console.log("Checkbox changed:", checkbox.value, checkbox.checked);
                preparebeeData(yearSelect.value);
            });
        });
    }

    async function loadData() {
        const data = await Promise.all([d3.csv('data/countries_regions.csv'), d3.csv('data/global_development.csv')]);
        console.log("Data loaded:", data);
        region_data = data[0];
        global_data = data[1];
        processGlobalData();
    }

    function processGlobalData() {
        // Assign unique IDs to the global_data items.
        global_data.forEach((d, i) => {
            d.id = i;
        });

        // Extract the unique country names and its match within the regions.
        const uniqueCountryNames = new Set();
        global_data.forEach(d => {
            const countryName = d.Country;
            if (!uniqueCountryNames.has(countryName)) {
                uniqueCountryNames.add(countryName);
                const region = region_data.find(r => r.name === countryName);
                if (region && region['World bank region'] !== 'Unknown') {
                    countryRegionPairs.push({
                        Region: region['World bank region'],
                        Country: countryName
                    });
                }
            }
        });

        const allYears = global_data.map(d => d.Year);
        uniqueYears = Array.from(new Set(allYears)).sort((a, b) => a - b);

        // Populate the yearSelect dropdown with valid years
        populateYearDropdown(yearSelect, uniqueYears);

        console.log("Processed Global Data:", global_data);
        console.log("Country-Region Pairs:", countryRegionPairs);
    }

    // Function to populate the year dropdown with valid years
    function populateYearDropdown(yearSelect, uniqueYears) {
        uniqueYears.forEach(year => {
            const option = document.createElement("option");
            option.value = year;
            option.text = year;
            yearSelect.appendChild(option);
        });
    }

    // Function to populate the attribute selectors with their data.
    function populateSelectors(columns, attributeSelectX, attributeSelectSize) {
        columns.forEach(element => {
            if (element !== "Year" && element !== "Country") {
                const optionX = document.createElement("option");
                optionX.value = element;
                optionX.text = element;
                attributeSelectX.appendChild(optionX);

                const optionSize = document.createElement("option");
                optionSize.value = element;
                optionSize.text = element;
                attributeSelectSize.appendChild(optionSize);
            }
        });
    }

    function handleSelectAll(regionCheckboxes) {
        regionCheckboxes.forEach(checkbox => checkbox.checked = true);
        preparebeeData(yearSelect.value);
    }

    function handleDeselectAll(regionCheckboxes) {
        regionCheckboxes.forEach(checkbox => checkbox.checked = false);
        preparebeeData(yearSelect.value);
    }

    // Function that is initiated on "Play" button being clicked, constrained by a boolean flag for UX responsiveness.
    function handleTimeLapse(yearSelect, uniqueYears) {
        let currentIndex = uniqueYears.findIndex(element => element === yearSelect.value);
        if (!timeLapse) {
            startTimeLapse(currentIndex);
        } else {
            stopTimeLapse();
        }
    }

    // Validate the year, then alter the button's text to update the user about the time lapse status. TimeLapse boolean flag to enable a toggle functionality on re-click.
    function startTimeLapse(currentIndex) {
        if (currentIndex < uniqueYears.length) {
            const year = uniqueYears[currentIndex];
            console.log("Starting time lapse for year:", year);
            button.innerText = "Playing...";
            preparebeeData(year);
            currentIndex++;
            timeLapse = true;
            // Setting a timeout for the recursion chain call, and a global boolean flag to maintain handling.
            timeout = setTimeout(() => startTimeLapse(currentIndex), 6000);
        } else {
            stopTimeLapse();
        }
    }

    // Revert the following to its default settings then stopping the timelapse.
    function stopTimeLapse(message) {
        // Ternary operator statement for a more specific user-guided message.
        userWarning.innerText = (message == undefined || message == null) ? "Stopped timelapse." : "Stopped timelapse. " + message;
        button.innerText = "Play";
        clearTimeout(timeout);
        timeLapse = false;
    }

    // Function to prepare data for the beeswarm chart based on the user selected options.
    function preparebeeData(year) {
        const countryList = [];
        const anyBoxChecked = Array.from(regionCheckboxes).some(checkbox => checkbox.checked);

        regionCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                const regionName = checkbox.value;
                const countriesInRegion = countryRegionPairs.filter(item => item.Region === regionName);
                countryList.push(...countriesInRegion.map(item => item.Country));
            }
        });

        //console.log("Preparing bee data for year:", year, "Country List:", countryList);

        if(countryList != undefined && countryList.length != 0){
            userWarning.style.visibility = "visible";
            userWarning.style.color = "blue";
            userWarning.textContent = "Drawing chart. NOTE: Earlier years do not have all countries present.";

            if (!timeLapse && uniqueYears.includes(yearSelect.value)) {
                drawBeeswarmChart(yearSelect.value, countryList);
            } else if (timeLapse && anyBoxChecked) {
                drawBeeswarmChart(year, countryList);
            }
        }else{
            userWarning.style.visibility = "visible";
            userWarning.style.color = "red";
            userWarning.textContent = timeLapse ? "Cannot play timelapse, no countries selected." : "No countries selected.";
            stopTimeLapse("No countries selected."); // Stop time lapse if no countries selected
        }
    }

    function drawBeeswarmChart(year, countryList) {
        const margin = { top: 20, bottom: 50, right: 20, left: 80 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;
        const attributeValX = document.getElementById("attributeSelectX").value;
        const attributeValSize = document.getElementById("attributeSelectSize").value;

        console.log("Drawing beeswarm chart for year:", year, ", Country List:", countryList);
        console.log("Selected attributes\nX:", attributeValX, "\nSize:", attributeValSize);

        // Filter the data based on the selected year and countries.
        const data = global_data.filter(d => countryList.includes(d.Country) && year === d.Year);
        const finalData = data.map(d => ({
            Country: d.Country,
            [attributeValX]: d[attributeValX],
            [attributeValSize]: d[attributeValSize],
            Year: d.Year,
            Region: countryRegionPairs.find(pair => pair.Country === d.Country).Region
        }));

        console.log("Filtered chart data from the selection:", finalData);

        const attributeValXMax = d3.max(finalData.map(d => parseFloat(d[attributeValX])));
        const attributeValSizeMax = d3.max(finalData.map(d => parseFloat(d[attributeValSize])));

        // Get the country code mapping for the flag images.
        countryCodeMapping = getCountryCodeMapping();
        finalData.forEach(d => d.countryCode = countryCodeMapping[d.Country] || "");

        // Define the color scale based on regions.
        colorScale = d3.scaleOrdinal().domain(countryRegionPairs.map(item => item.Region)).range(d3.schemePaired);
        const xScale = d3.scaleLinear().domain([0, attributeValXMax]).range([0, innerWidth - 50]);
        const size = d3.scaleSqrt().domain(d3.extent(finalData.map(d => +d[attributeValSize]))).range([3, 40]);

        // Update SVG dimensions and create SVG group.
        svg.attr('width', width).attr('height', height);
        let g = svg.select('g');
        if (g.empty()) {
            g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);
        }

        // Update the x-axis and draw the beeswarm chart.
        updateXAxis(g, xScale, innerWidth, innerHeight, attributeValX);
        updateChart(g, finalData, xScale, size, tooltip, tooltipText, attributeValX, attributeValSize, colorScale, innerHeight);

        prevXAttribute = attributeValX;
        console.log("Finished drawing chart for this action.")
    }

    function updateXAxis(g, xScale, innerWidth, innerHeight, attributeValX) {
        const xAxis = d3.axisBottom(xScale);
        const xAxisGroup = g.select('.x-axis');
        const xAxisLabel = g.select('.axis-label');
        const xAxisPlainText = attributeValX.replaceAll(".", " ");
        // Check if the xAxisGroup exists and has no children (ticks).
        const xAxisEmpty = xAxisGroup.empty() || xAxisGroup.selectAll('.tick').size() === 0;

        if (prevXAttribute !== attributeValX || xAxisEmpty) {
            if (xAxisGroup.empty() || xAxisLabel.empty()) {
                g.append('g')
                    .attr('class', 'x-axis')
                    .attr('transform', `translate(0, ${innerHeight})`)
                    .style('opacity', 0)
                    .call(xAxis)
                    .transition()
                    .duration(3000)
                    .style('opacity', 1);

                g.append('text')
                    .attr('class', 'axis-label')
                    .attr('text-anchor', 'middle')
                    .attr('x', innerWidth / 2)
                    .attr('y', innerHeight + 40)
                    .style('opacity', 0)
                    .text(xAxisPlainText)
                    .transition()
                    .duration(3000)
                    .style('opacity', 1);
            } else {
                xAxisGroup.transition().duration(3000).style('opacity', 0).remove().on('end', function() {
                    g.append('g')
                        .attr('class', 'x-axis')
                        .attr('transform', `translate(0, ${innerHeight})`)
                        .style('opacity', 0)
                        .call(xAxis)
                        .transition()
                        .duration(3000)
                        .style('opacity', 1);
                });

                xAxisLabel.transition().duration(3000).style('opacity', 0).remove().on('end', function() {
                    g.append('text')
                        .attr('class', 'axis-label')
                        .attr('text-anchor', 'middle')
                        .attr('x', innerWidth / 2)
                        .attr('y', innerHeight + 40)
                        .style('opacity', 0)
                        .text(xAxisPlainText)
                        .transition()
                        .duration(3000)
                        .style('opacity', 1);
                });
            }
        }
    }

    // Function to update the beeswarm chart.
    function updateChart(g, finalData, xScale, size, tooltip, tooltipText, attributeValX, attributeValSize, colorScale, innerHeight) {
        const simulation = d3.forceSimulation(finalData)
            .force('x', d3.forceX(d => xScale(parseFloat(d[attributeValX]))).strength(1))
            .force('y', d3.forceY(innerHeight / 2).strength(1))
            .force('collide', d3.forceCollide(d => size(d[attributeValSize])));

        simulation.on('end', () => {
            const circles = g.selectAll('circle').data(finalData);
            circles.join(
                enter => enter.append('circle')
                    .attr('opacity', 0)
                    .on("mouseover", (d, i) => handleMouseOver(d, i, tooltip, tooltipText, attributeValX, attributeValSize))
                    .on("mouseout", handleMouseOut)
                    .on("mousemove", handleMouseMove)
                    .transition()
                    .duration(1000)
                    .delay((d, i) => i * 30)
                    .attr('cx', d => d.x)
                    .attr('cy', d => d.y)
                    .attr('r', d => size(d[attributeValSize]))
                    .attr('fill', d => colorScale(d.Region))
                    .attr('stroke', 'black')
                    .attr('stroke-width', 1)
                    .attr('opacity', 1),
                update => update
                    .on("mouseover", (d, i) => handleMouseOver(d, i, tooltip, tooltipText, attributeValX, attributeValSize))
                    .on("mouseout", handleMouseOut)
                    .on("mousemove", handleMouseMove)
                    .transition()
                    .duration(1000)
                    .delay((d, i) => i * 40)
                    .attr('cx', d => d.x)
                    .attr('cy', d => d.y)
                    .attr('r', d => size(d[attributeValSize]))
                    .attr('fill', d => colorScale(d.Region))
                    .attr('stroke', 'black')
                    .attr('stroke-width', 1)
                    .attr('opacity', 1),
                exit => exit.transition()
                    .duration(1000)
                    .attr('opacity', 0)
                    .remove()
            );
        });
    }

    // On mouseover, we want to display the attribute values and the respective flag/country.
    function handleMouseOver(d, i, tooltip, tooltipText, attributeValX, attributeValSize) {
        const countryName = i.Country;
        const countryCode = countryCodeMapping[countryName];
        //console.log(`Moused Over: ${countryName}, ${countryCode}`);
        const flagImage = new Image();
        const flagImagePath = `/data/flags/${countryCode.toLowerCase()}.png`;

        tooltipText.innerHTML = `Country: ${i.Country}<br> X Attribute: ${i[attributeValX]} <br> Size Attribute: ${i[attributeValSize]}`;
        flagImage.src = flagImagePath;
        flagImage.alt = `${i.Country} Flag`;
        flagImage.style.width = "50px";
        flagImage.style.height = "auto";

        tooltip.innerHTML = '';
        tooltip.appendChild(flagImage);
        tooltip.appendChild(tooltipText);
        tooltip.style.visibility = "visible";
    }

    // Toggle to hidden when the cursor is not on the chart's circleelement.
    function handleMouseOut() {
        tooltipText.innerHTML = ``;
        tooltip.style.visibility = "hidden";
    }

    // Mouse location tracking for the specific hovered-over tooltip information.
    function handleMouseMove(d) {
        let mouseX = d.clientX;
        let mouseY = d.clientY;

        tooltip.style.left = (mouseX + 15) + "px";
        tooltip.style.top = (mouseY - 35) + "px";
    }

    // Function to get the country code mapping for the tooltip's flag image content.
    function getCountryCodeMapping() {
        const countryCodeMapping = {
            "Canada": "CA", "Sao Tome and Principe": "ST", "Cambodia": "KH", "Ethiopia": "ET",
            "Sri Lanka": "LK", "Swaziland": "SZ", "Argentina": "AR", "Bolivia": "BO",
            "Burkina Faso": "BF", "Bahrain": "BH", "Saudi Arabia": "SA", "Guatemala": "GT",
            "Guinea": "GN", "St. Lucia": "LC", "Congo, Rep.": "CG", "Spain": "ES",
            "Liberia": "LR", "Maldives": "MV", "Oman": "OM", "Tanzania": "TZ", "Gabon": "GA",
            "New Zealand": "NZ", "Jamaica": "JM", "Albania": "AL", "United Arab Emirates": "AE",
            "India": "IN", "Madagascar": "MG", "Lesotho": "LS", "Turkey": "TR",
            "Bangladesh": "BD", "Solomon Islands": "SB", "Lebanon": "LB", "Mongolia": "MN",
            "France": "FR", "Rwanda": "RW", "Somalia": "SO", "Peru": "PE", "Vanuatu": "VU",
            "Norway": "NO", "Cote d'Ivoire": "CI", "Benin": "BJ", "Cuba": "CU", "Cameroon": "CM",
            "Togo": "TG", "China": "CN", "Dominican Republic": "DO", "Germany": "DE", "Ghana": "GH",
            "Tonga": "TO", "Indonesia": "ID", "Colombia": "CO", "Libya": "LY", "Finland": "FI",
            "Central African Republic": "CF", "Sweden": "SE", "Vietnam": "VN", "Guyana": "GY",
            "Kenya": "KE", "Bulgaria": "BG", "Mauritius": "MU", "Romania": "RO", "Angola": "AO",
            "South Africa": "ZA", "St. Vincent and the Grenadines": "VC", "Fiji": "FJ", "Austria": "AT",
            "Mozambique": "MZ", "Uganda": "UG", "Japan": "JP", "Niger": "NE", "United States": "US",
            "Brazil": "BR", "Afghanistan": "AF", "Kuwait": "KW", "Panama": "PA", "Mali": "ML",
            "Costa Rica": "CR", "Ireland": "IE", "Pakistan": "PK", "Nigeria": "NG", "Ecuador": "EC",
            "Australia": "AU", "Algeria": "DZ", "El Salvador": "SV", "Chile": "CL", "Thailand": "TH",
            "Haiti": "HT", "Belize": "BZ", "Sierra Leone": "SL", "Nepal": "NP", "Denmark": "DK",
            "Philippines": "PH", "Portugal": "PT", "Morocco": "MA", "Namibia": "NA",
            "Guinea-Bissau": "GW", "Kiribati": "KI", "Switzerland": "CH", "Iraq": "IQ",
            "Chad": "TD", "Uruguay": "UY", "Equatorial Guinea": "GQ", "Djibouti": "DJ",
            "Antigua and Barbuda": "AG", "Burundi": "BI", "Cyprus": "CY", "Barbados": "BB",
            "Qatar": "QA", "Italy": "IT", "Bhutan": "BT", "Sudan": "SD", "Singapore": "SG",
            "Malta": "MT", "Netherlands": "NL", "Suriname": "SR", "Israel": "IL", "Malaysia": "MY",
            "Iceland": "IS", "Zambia": "ZM", "Senegal": "SN", "Papua New Guinea": "PG", "Malawi": "MW",
            "Zimbabwe": "ZW", "Jordan": "JO", "Poland": "PL", "Mauritania": "MR",
            "Trinidad and Tobago": "TT", "Hungary": "HU", "Honduras": "HN", "Myanmar": "MM",
            "Mexico": "MX", "Tunisia": "TN", "Nicaragua": "NI", "Congo, Dem. Rep.": "CD",
            "Comoros": "KM", "United Kingdom": "GB", "Grenada": "GD", "Greece": "GR", "Paraguay": "PY",
            "Botswana": "BW"
        };

        return countryCodeMapping;
    }
}
