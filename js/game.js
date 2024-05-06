const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = 1280;
canvas.height = 768;

c.fillStyle = "white";
c.fillRect(0, 0, canvas.width, canvas.height);

const placementTilesData2D = [];

for (let i = 0; i < placementTilesData.length; i += 20) {
  placementTilesData2D.push(placementTilesData.slice(i, i + 20));
}

const placementTiles = [];

placementTilesData2D.forEach((row, y) => {
  row.forEach((symbol, x) => {
    if (symbol === 14) {
      placementTiles.push(
        new PlacementTile({
          position: {
            x: x * 64,
            y: y * 64,
          },
        })
      );
    }
  });
});

const image = new Image();


image.onload = () => {
  animate();
};
image.src = "img/gameMap.png";

const enemies = [];

function spawnEnemies(spawnCount) {
  for (let i = 1; i < spawnCount + 1; i++) {
    const xOffset = i * 150;
    enemies.push(
      new Enemy({
        position: { x: waypoints[0].x - xOffset, y: waypoints[0].y },
      })
    );
  }
}

const buildings = [];
let activeTile = undefined;
let enemyCount = 100;
let hearts = 100;
let coins = 1000;
const explosions = [];
spawnEnemies(enemyCount);

const startmenuButton = document.querySelector("#start-menuButton");
const startButton = document.querySelector("#startButton");
const pauseButton = document.querySelector("#pauseButton");
const restartButton = document.querySelector("#restartButton");

const startmenu = document.querySelector("#start-menu");
const game = document.querySelector("#game");
const menu = document.querySelector("#menu");

let gameRunning = false;

const start = () => {
  if (!gameRunning) {
    gameRunning = true;
    animate(); 
  }
}

const pause = () => {
  if (gameRunning) {
    gameRunning = false;
    cancelAnimationFrame(animationId);
  }
}

const hideGame = () => {
  menu.classList.add("hidden");
  game.classList.add("hidden");
  startmenu.classList.remove("hidden");
}

const showGame = () => {
  menu.classList.remove("hidden");
  game.classList.remove("hidden");
  startmenu.classList.add("hidden");
}

startmenuButton.addEventListener("click", () => {
  start();
  showGame();
})
startButton.addEventListener("click", () => start());

pauseButton.addEventListener("click", () => pause());

restartButton.addEventListener("click", () => {
  gameRunning = false;
  
  enemies.length = 0;
  buildings.length = 0;
  hearts = 100; 
  coins = 1000;                          // хз что ещё сбрасывать
  placementTiles.forEach((tile) => {
    tile.isOccupied = false;
  });


  gameRunning = true;
  animate();
  pause()
});

function animate() {
  if (gameRunning) {
    const animationId = requestAnimationFrame(animate);

    c.drawImage(image, 0, 0);

    for (let i = enemies.length - 1; i >= 0; i--) {
      const enemy = enemies[i];
      enemy.update();
  
      if (enemy.position.x > canvas.width) {
        hearts -= 1;
        console.log(hearts);
        enemies.splice(i, 1);
        document.querySelector("#hearts").innerHTML = hearts;
  
        if (hearts === 0) {
          console.log("game over");
          cancelAnimationFrame(animationId);
          document.querySelector("#gameOver").style.display = "flex";
        }
      }
    }
  
    for (let i = explosions.length - 1; i >= 0; i--) {
      const explosion = explosions[i];
      explosion.draw();
      explosion.update();
  
      if (explosion.frames.current >= explosion.frames.max - 1) {
        explosions.splice(i, 1);
      }
    }
  
    // tracking total amount of enemies
    if (enemies.length === 0) {
      enemyCount += 2;
      spawnEnemies(enemyCount);
    }
  
    placementTiles.forEach((tile) => {
      tile.update(mouse);
    });
  
    buildings.forEach((building) => {
      building.update();
      building.target = null;
      const validEnemies = enemies.filter((enemy) => {
        const xDifference = enemy.center.x - building.center.x;
        const yDifference = enemy.center.y - building.center.y;
        const distance = Math.hypot(xDifference, yDifference);
        return distance < enemy.radius + building.radius;
      });
      building.target = validEnemies[0];
  
      for (let i = building.projectiles.length - 1; i >= 0; i--) {
        const projectile = building.projectiles[i];
  
        projectile.update();
  
        const xDifference = projectile.enemy.center.x - projectile.position.x;
        const yDifference = projectile.enemy.center.y - projectile.position.y;
        const distance = Math.hypot(xDifference, yDifference);
  
        // this is when a projectile hits an enemy
        if (distance < projectile.enemy.radius + projectile.radius) {
          // enemy health and enemy removal
          projectile.enemy.health -= 20;
          if (projectile.enemy.health <= 0) {
            const enemyIndex = enemies.findIndex((enemy) => {
              return projectile.enemy === enemy;
            });
  
            if (enemyIndex > -1) {
              enemies.splice(enemyIndex, 1);
              coins += 25;
              document.querySelector("#coins").innerHTML = coins;
            }
          }
  
          explosions.push(
            new Sprite({
              position: { x: projectile.position.x, y: projectile.position.y },
              imageSrc: "./img/explosion.png",
              frames: { max: 4 },
              offset: { x: 0, y: 0 },
            })
          );
          building.projectiles.splice(i, 1);
        }
      }
    });
  }
}

const mouse = {
  x: undefined,
  y: undefined,
};

canvas.addEventListener("click", (event) => {
  if (activeTile && !activeTile.isOccupied && coins - 50 >= 0) {
    coins -= 50;
    document.querySelector("#coins").innerHTML = coins;
    buildings.push(
      new Building({
        position: {
          x: activeTile.position.x,
          y: activeTile.position.y,
        },
      })
    );
    activeTile.isOccupied = true;
    buildings.sort((a, b) => {
      return a.position.y - b.position.y;
    });
  }
});

window.addEventListener("mousemove", (event) => {
  mouse.x = event.clientX;
  mouse.y = event.clientY;

  activeTile = null;
  for (let i = 0; i < placementTiles.length; i++) {
    const tile = placementTiles[i];
    if (
      mouse.x > tile.position.x &&
      mouse.x < tile.position.x + tile.size &&
      mouse.y > tile.position.y &&
      mouse.y < tile.position.y + tile.size
    ) {
      activeTile = tile;
      break;
    }
  }
});