// Fetch and display BL data
document.addEventListener("DOMContentLoaded", () => {
  fetch("data.json")
    .then(response => response.json())
    .then(data => {
      displayBLs(data.upcoming, "upcoming-list");
      displayBLs(data.current, "current-list");
    })
    .catch(error => console.error("Error loading BL data:", error));
});

// Function to display BL cards
function displayBLs(blData, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = ""; // Clear any existing content

  blData.forEach(bl => {
    const card = document.createElement("div");
    card.className = "bl-card";

    card.innerHTML = `
      <img src="${bl.image}" alt="${bl.title}">
      <h3>${bl.title}</h3>
      <p>${bl.description}</p>
      <p><strong>Release Date:</strong> ${bl.date}</p>
    `;

    container.appendChild(card);
  });
}
