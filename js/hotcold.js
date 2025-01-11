let targetArtist = null;
let isGameActive = false;
let lastDistance = Infinity;
let clickCount = 0;

function calculateDistance(point1, point2) {
    return Math.sqrt(
        Math.pow(point1.lat - point2.lat, 2) + 
        Math.pow(point1.lng - point2.lng, 2)
    );
}

function getTemperature(distance) {
    if (distance < 0.1) return "VERY HOT! 🔥";
    if (distance < 1) return "HOT 🌡️";
    if (distance < 2) return "WARM 😊";
    if (distance < 4) return "COLD ❄️";
    return "VERY COLD! 🧊";
}

function endGame() {
    if (!isGameActive) {
        alert("There is no active game!");
        return;
    }

    const confirmation = confirm("Are you sure you want to end the game?");
    if (confirmation) {
        isGameActive = false;
        map.off('click', checkDistance);
        layer_GlobalArtistsCategorizedbyCountries_2.eachLayer(function(layer) {
            layer.on('click', function(e) {
                layer.openPopup();
            });
        });
        targetArtist = null;
        document.getElementById('currentArtist').textContent = '-';
        document.getElementById('clickCount').textContent = '0';
    }
}

function startGame() {
    if (isGameActive) {
        alert("There is already an active game!");
        return;
    }

    const artists = [];
    layer_GlobalArtistsCategorizedbyCountries_2.eachLayer(function(layer) {
        if (layer.feature && layer.feature.properties.artist_name) {
            artists.push({
                name: layer.feature.properties.artist_name,
                latlng: layer.getLatLng()
            });
        }
    });

    const randomArtist = artists[Math.floor(Math.random() * artists.length)];
    targetArtist = randomArtist.name;
    targetLocation = randomArtist.latlng;
    
    isGameActive = true;
    clickCount = 0;
    lastDistance = Infinity;

    document.getElementById('currentArtist').textContent = targetArtist;
    document.getElementById('clickCount').textContent = '0';

    alert(`The game has begun!\n\nThe artist you need to find: ${targetArtist}\n\nTry to find the artist by clicking on the map.`);

    map.off('click');
    layer_GlobalArtistsCategorizedbyCountries_2.eachLayer(function(layer) {
        layer.off('click');
    });

    map.on('click', checkDistance);
    layer_GlobalArtistsCategorizedbyCountries_2.eachLayer(function(layer) {
        layer.on('click', function(e) {
            L.DomEvent.stopPropagation(e);
            checkDistance(e);
        });
    });
}

function checkDistance(e) {
    if (!isGameActive) return;

    clickCount++;
    document.getElementById('clickCount').textContent = clickCount;
    
    const clickedPoint = e.latlng;
    
    let isTargetPoint = false;
    layer_GlobalArtistsCategorizedbyCountries_2.eachLayer(function(layer) {
        if (layer.feature && 
            layer.feature.properties.artist_name === targetArtist && 
            layer.getLatLng().equals(clickedPoint)) {
            isTargetPoint = true;
        }
    });

    if (isTargetPoint) {
        setTimeout(() => {
            alert(`Congratulations! ${targetArtist} You found it in ${clickCount} attempts!`);
            isGameActive = false;
            map.off('click', checkDistance);
            layer_GlobalArtistsCategorizedbyCountries_2.eachLayer(function(layer) {
                layer.on('click', function(e) {
                    layer.openPopup();
                });
            });
            document.getElementById('currentArtist').textContent = '-';
            document.getElementById('clickCount').textContent = '0';
        }, 100);
        return;
    }
    
    const distance = calculateDistance(clickedPoint, targetLocation);
    const temperature = getTemperature(distance);

    let comparison = "";
    if (Math.abs(distance - lastDistance) < 0.01) {
        comparison = "YOU ARE THE SAME DISTANCE";
    } else if (distance < lastDistance) {
        comparison = "YOU ARE GETTING CLOSER! 👍";
    } else {
        comparison = "YOU ARE GOING AWAY! 👎";
    }
    lastDistance = distance;

    const customPopup = L.popup({
        closeButton: true,
        autoClose: true,
        closeOnClick: true
    })
    .setLatLng(clickedPoint)
    .setContent(`
        <div style="text-align: center; padding: 10px;">
            <h3 style="margin: 0 0 10px 0;">${temperature}</h3>
            <p style="margin: 0 0 5px 0;">${comparison}</p>
            <p style="margin: 0;">Number of Trials: ${clickCount}</p>
        </div>
    `)
    .openOn(map);
}

const gameControls = document.createElement('div');
gameControls.style.position = 'absolute';
gameControls.style.top = '50px';
gameControls.style.left = '65%';
gameControls.style.transform = 'translateX(+61%)';
gameControls.style.zIndex = '1000';
gameControls.style.backgroundColor = 'white';
gameControls.style.padding = '10px';
gameControls.style.borderRadius = '5px';
gameControls.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';

const gameInfo = document.createElement('div');
gameInfo.style.marginBottom = '10px';
gameInfo.style.textAlign = 'left';
gameInfo.innerHTML = `
    <div style="margin-bottom: 5px;">
    <span style="font-size: 20px; font-weight: bold;">Hot & Cold</span><br><hr>
        <strong>Wanted Artist:</strong> <span id="currentArtist">-</span>
    </div>
    <div>
        <strong>Number of Trials:</strong> <span id="clickCount">0</span>
    </div>
`;

const buttonContainer = document.createElement('div');
buttonContainer.style.display = 'flex';
buttonContainer.style.gap = '10px';
buttonContainer.style.justifyContent = 'center';

const startButton = document.createElement('button');
startButton.innerHTML = 'Start New Game';
startButton.style.padding = '10px 20px';
startButton.style.fontSize = '16px';
startButton.style.cursor = 'pointer';
startButton.style.backgroundColor = '#4CAF50';
startButton.style.color = 'white';
startButton.style.border = 'none';
startButton.style.borderRadius = '5px';
startButton.onclick = startGame;

const exitButton = document.createElement('button');
exitButton.innerHTML = 'Quit Game';
exitButton.style.padding = '10px 20px';
exitButton.style.fontSize = '16px';
exitButton.style.cursor = 'pointer';
exitButton.style.backgroundColor = '#f44336';
exitButton.style.color = 'white';
exitButton.style.border = 'none';
exitButton.style.borderRadius = '5px';
exitButton.onclick = endGame;

buttonContainer.appendChild(startButton);
buttonContainer.appendChild(exitButton);

gameControls.appendChild(gameInfo);
gameControls.appendChild(buttonContainer);
document.body.appendChild(gameControls);