const DATA_FILE = "travel_recommendation_api.json";

let travelData = null;

const pages = document.querySelectorAll(".page");
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const clearButton = document.getElementById("clearButton");
const resultsSection = document.getElementById("resultsSection");
const resultsGrid = document.getElementById("resultsGrid");

// Fetch travel recommendation data from JSON
async function loadTravelData() {
    try {
        const response = await fetch(DATA_FILE);

        if (!response.ok) {
            throw new Error(`Could not load ${DATA_FILE}: ${response.status}`);
        }

        travelData = await response.json();

        console.log("Travel recommendation data loaded:", travelData);

    } catch (error) {
        console.error("Unable to load travel data.", error);

        resultsGrid.innerHTML =
            '<p class="empty-state">Could not load recommendations. Run this project using a local development server (for example, VS Code Live Server).</p>';
    }
}

// Navigation between pages
function showPage(pageName) {
    const validPage = document.getElementById(pageName)
        ? pageName
        : "home";

    pages.forEach((page) => {
        page.classList.toggle("active", page.id === validPage);
    });

    searchForm.style.display =
        validPage === "home" ? "flex" : "none";

    if (validPage !== "home") {
        resultsSection.hidden = true;
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// Navigation links
document.querySelectorAll("[data-page]").forEach((link) => {

    link.addEventListener("click", (event) => {
        event.preventDefault();

        const pageName = link.dataset.page;

        history.pushState(
            { page: pageName },
            "",
            `#${pageName}`
        );

        showPage(pageName);
    });

});

// Browser back and forward navigation
window.addEventListener("popstate", () => {
    showPage(location.hash.slice(1) || "home");
});

// Normalize search keywords
function normalizeKeyword(value) {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z\s-]/g, "")
        .replace(/\s+/g, " ");
}

// Get recommendations based on the keyword
function getRecommendations(keyword) {

    if (!travelData) {
        return [];
    }

    const beachKeywords = ["beach", "beaches"];
    const templeKeywords = ["temple", "temples"];
    const countryKeywords = ["country", "countries"];

    // Beach recommendations
    if (beachKeywords.includes(keyword)) {
        return travelData.beaches || [];
    }

    // Temple recommendations
    if (templeKeywords.includes(keyword)) {
        return travelData.temples || [];
    }

    // Country recommendations
    if (countryKeywords.includes(keyword)) {
        return (travelData.countries || []).flatMap(
            (country) => country.cities || []
        );
    }

    // Search by individual country name
    const matchingCountry = (travelData.countries || []).find(
        (country) => normalizeKeyword(country.name) === keyword
    );

    if (matchingCountry) {
        return matchingCountry.cities || [];
    }

    // Search by individual destination or city name
    const allPlaces = [
        ...(travelData.beaches || []),
        ...(travelData.temples || []),
        ...(travelData.countries || []).flatMap(
            (country) => country.cities || []
        )
    ];

    return allPlaces.filter((place) =>
        normalizeKeyword(place.name).includes(keyword)
    );
}

// Create recommendation cards dynamically
function createResultCard(place) {

    const card = document.createElement("article");
    card.className = "result-card";

    const image = document.createElement("img");

    image.src = place.imageUrl;
    image.alt = place.name;
    image.loading = "lazy";

    // Fallback image if the original image fails to load
    image.onerror = () => {
        image.src =
            "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80";
    };

    const title = document.createElement("h3");
    title.textContent = place.name;

    const description = document.createElement("p");
    description.textContent = place.description;

    card.append(image, title, description);

    return card;
}

// Display recommendations
function displayRecommendations(keyword) {

    resultsGrid.replaceChildren();

    const recommendations = getRecommendations(keyword);

    resultsSection.hidden = false;

    if (recommendations.length === 0) {

        const message = document.createElement("p");

        message.className = "empty-state";

        message.textContent =
            `No recommendations found for "${keyword}". Try beach, temple, country, or a country name such as Japan.`;

        resultsGrid.append(message);

        return;
    }

    recommendations.forEach((place) => {

        const card = createResultCard(place);

        resultsGrid.appendChild(card);

    });
}

// Search button functionality
searchForm.addEventListener("submit", (event) => {

    event.preventDefault();

    const keyword = normalizeKeyword(searchInput.value);

    if (!keyword) {

        resultsSection.hidden = false;

        resultsGrid.innerHTML =
            '<p class="empty-state">Enter a keyword to search for recommendations.</p>';

        return;
    }

    if (!travelData) {

        resultsSection.hidden = false;

        resultsGrid.innerHTML =
            '<p class="empty-state">Travel data is still loading. Please try again in a moment.</p>';

        return;
    }

    displayRecommendations(keyword);

});

// Clear button functionality
clearButton.addEventListener("click", () => {

    searchInput.value = "";

    resultsGrid.replaceChildren();

    resultsSection.hidden = true;

    searchInput.focus();

});

// Book Now button functionality
document.getElementById("bookButton").addEventListener("click", () => {

    document.getElementById("contact").scrollIntoView({
        behavior: "smooth"
    });

    history.pushState(
        { page: "contact" },
        "",
        "#contact"
    );

    showPage("contact");

});

// Contact form submission
document.getElementById("contactForm").addEventListener("submit", (event) => {

    event.preventDefault();

    const formStatus = document.getElementById("formStatus");

    formStatus.textContent =
        "Thanks for reaching out! Your message has been received.";

    event.currentTarget.reset();

});

// Load JSON data when the website starts
loadTravelData();

// Display the correct page initially
showPage(location.hash.slice(1) || "home");