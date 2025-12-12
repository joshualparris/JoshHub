// -- Utility function for loading house image sprite --
function loadImg(src) {
  const img = new window.Image();
  img.src = src;
  return img;
}

// House "sprite" image: Free icon for demo, replace with custom if you like
const houseImg = loadImg("https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f3e0.png");

// More houses, improved positions (based on your aerial photo, visually mapped)
const houses = [
  { x: 75, y: 110, w: 50, h: 38, name: "53 Buckland St", resident: "You", info: "This is your house! Welcome home." },
  { x: 20, y: 110, w: 48, h: 36, name: "51 Buckland St", resident: "Alice", info: "Alice is an avid gardener." },
  { x: 135, y: 130, w: 48, h: 38, name: "55 Buckland St", resident: "George", info: "George loves classic cars." },
  { x: 190, y: 85, w: 42, h: 32, name: "57 Buckland St", resident: "Emma", info: "Emma bakes the best muffins." },
  { x: 240, y: 110, w: 50, h: 38, name: "59 Buckland St", resident: "Raj", info: "Raj runs marathons!" },
  { x: 310, y: 120, w: 45, h: 35, name: "61 Buckland St", resident: "Lily", info: "Lily plays the violin." },
  { x: 370, y: 90, w: 50, h: 38, name: "63 Buckland St", resident: "Oscar", info: "Oscar can juggle." },
  { x: 415, y: 135, w: 44, h: 34, name: "65 Buckland St", resident: "Priya", info: "Priya is a computer genius!" },
  { x: 480, y: 110, w: 50, h: 38, name: "67 Buckland St", resident: "Jasper", info: "Jasper is new in town." },
  { x: 545, y: 120, w: 46, h: 36, name: "69 Buckland St", resident: "Mia", info: "Mia makes paper crafts." },
  // Add dozens more with new coordinates for left/right and up/down, for visual streets
];

// Player state and quest system
let player = { x: 95, y: 200, w: 20, h: 32, color: "blue", met: [] };
const speed = 7;

const questText = "Quest: Meet all neighbours (knock on every door)!";
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const messageDiv = document.getElementById('message');
const questDiv = document.getElementById('quest');
const progressListSpan = document.getElementById('progressList');

// Fun dialog choices
const greetDialog = [
  "waves and says Hi!",
  "greets you warmly.",
  "offers you a cup of tea.",
  "smiles and invites you in.",
  "tells you a fun fact.",
  "asks if you want to play chess.",
];

// Draw all game elements
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw street background
  ctx.fillStyle = "#d2b48c";
  ctx.fillRect(0, 105, canvas.width, 70);

  // Draw houses as sprites
  houses.forEach((h, idx) => {
    ctx.drawImage(houseImg, h.x, h.y, h.w, h.h);
    // Visited tick badge
    if (player.met.includes(h.name)) {
      ctx.fillStyle = "#2ecc71";
      ctx.beginPath();
      ctx.arc(h.x + h.w - 8, h.y + 8, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("✓", h.x + h.w - 8, h.y + 8 + 0.5);
    }
  });

  // Draw address labels in a second pass, sorted left-to-right to minimize collisions
  const labelEntries = houses.map(h => {
    const labelX = h.x + Math.floor(h.w / 2);
    const baseY = h.y + h.h + 16;
    return { house: h, labelX, baseY };
  }).sort((a, b) => a.labelX - b.labelX);

  const placedLabelRects = [];
  const intersects = (a, b) => !(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y);

  labelEntries.forEach(entry => {
    const h = entry.house;
    const addrNumber = h.name.replace(" Buckland St", "");
    const addrStreet = "Buckland St";
    const labelX = entry.labelX;
    const labelTopY = entry.baseY;
    ctx.font = "11px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    const maxLabelWidth = Math.max(h.w + 10, 72);
    const labelHeight = 28;
    let labelRect = {
      x: labelX - maxLabelWidth / 2,
      y: labelTopY - 3,
      w: maxLabelWidth,
      h: labelHeight
    };
    // collision resolution with margin
    const withMargin = (r) => ({ x: r.x - 4, y: r.y - 2, w: r.w + 8, h: r.h + 4 });
    let guard = 0;
    while (placedLabelRects.some(r => intersects(withMargin(labelRect), withMargin(r))) && guard < 30) {
      labelRect.y += 16;
      guard++;
    }
    placedLabelRects.push(labelRect);
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 1;
    ctx.fillRect(labelRect.x, labelRect.y, labelRect.w, labelRect.h);
    ctx.strokeRect(labelRect.x, labelRect.y, labelRect.w, labelRect.h);
    ctx.fillStyle = "#222";
    ctx.fillText(addrNumber, labelX, labelRect.y + 3);
    ctx.fillText(addrStreet, labelX, labelRect.y + 17);
  });

  // Draw player
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.w, player.h);
  ctx.fillStyle = "#111";
  ctx.font = "13px bold sans-serif";
  ctx.fillText("You", player.x, player.y + player.h + 14);

  // Show quest status
  questDiv.textContent = questText + " Neighbours met: " + player.met.length + "/" + houses.length;
  if (player.met.length === houses.length) questDiv.textContent += " - Complete! 🎉";

  // Update progress panel
  const metHouses = houses.filter(h => player.met.includes(h.name));
  if (metHouses.length === 0) {
    progressListSpan.textContent = "None yet";
  } else {
    progressListSpan.textContent = metHouses.map(h => `${h.resident} (${h.name})`).join(", ");
  }
}

// Movement handler
document.addEventListener('keydown', (e) => {
  let moved = false;
  if (e.key === 'ArrowLeft') { player.x -= speed; moved = true; }
  else if (e.key === 'ArrowRight') { player.x += speed; moved = true; }
  else if (e.key === 'ArrowUp') { player.y -= speed; moved = true; }
  else if (e.key === 'ArrowDown') { player.y += speed; moved = true; }
  else if (e.key === ' ') { checkKnock(); }

  // Clamp to canvas
  player.x = Math.max(0, Math.min(canvas.width - player.w, player.x));
  player.y = Math.max(0, Math.min(canvas.height - player.h, player.y));
  if (moved) messageDiv.textContent = "";
  draw();
});

// Knock - interaction and dialog
function checkKnock() {
  for (let h of houses) {
    if (
      player.x + player.w > h.x &&
      player.x < h.x + h.w &&
      player.y + player.h > h.y &&
      player.y < h.y + h.h
    ) {
      // Quest tracking
      if (!player.met.includes(h.name)) player.met.push(h.name);
      let dialogMsg = (h.resident === "You")
        ? `You return to ${h.name}. ${h.info}`
        : `Knock knock! ${h.resident} ${greetDialog[Math.floor(Math.random()*greetDialog.length)]} "${h.info}"`;
      messageDiv.textContent = dialogMsg;
      draw();
      return;
    }
  }
  messageDiv.textContent = "No house nearby to knock!";
}

draw();