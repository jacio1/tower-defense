const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = 1280
canvas.height = 768

c.fillStyle = 'white'
c.fillRect(0, 0, canvas.width, canvas.height)

const placementTilesData2D = []
for (let i = 0; i < placementTilesData.length; i += 20) {
  placementTilesData2D.push(placementTilesData.slice(i, i + 20))
}

const placementTiles = []
placementTilesData2D.forEach((row, y) => {
  row.forEach((symbol, x) => {
    if (symbol === 14) {
      placementTiles.push(
        new PlacementTile({
          position: {
            x: x * 64,
            y: y * 64
          }
        })
      )
    }
  })
})

const image = new Image()
image.onload = () => {
  // animate() // Убрали автоматический запуск анимации
}
image.src = 'img/gameMap2.png'

const enemies = []
function spawnEnemies(spawnCount) {
  for (let i = 1; i < spawnCount + 1; i++) {
    const xOffset = i * 150;
    // Выбор спрайта случайным образом
    const imageSrc = Math.random() < 0.5 ? 'img/boyStudent-small.png' : 'img/girlStudent.png';
    enemies.push(
      new Enemy({
        position: { x: waypoints[0].x - xOffset, y: waypoints[0].y },
        imageSrc: imageSrc // Передача выбранного спрайта
      })
    );
  }
}

const buildings = []
let activeTile = undefined
let enemyCount = 10
let hearts = 10
let coins = 200 
let wave = 1
let damage = 20
// Счетчик убитых мобов
let EnemyKillCounter = 0;
// Конец правки
const explosions = []
let EnemyActualCount = 10
// spawnEnemies(enemyCount) // Убрали автоматический запуск

let gameStarted = false;
let gamePaused = false;
let animationId;

function resetGame() {
  // Сброс всех переменных игры к начальному состоянию
  enemies.length = 0;
  enemyCount = 10;
  hearts = 10;
  coins = 200;
  wave = 1;
  damage = 20;
  EnemyKillCounter = 0;
  EnemyActualCount = 10;
  buildings.length = 0;
  placementTiles.forEach(tile => {
    tile.isOccupied = false;
  });
  // ... и другие переменные, которые нужно сбросить
  // Обновите отображаемые значения на странице
  document.querySelector('#hearts').innerHTML = hearts;
  document.querySelector('#coins').innerHTML = coins;
  document.querySelector('#wave').innerHTML = wave;
  document.querySelector('#EnemyLeftCount').innerHTML = EnemyActualCount;
  document.querySelector('#EnemyKillCounter').innerHTML = EnemyKillCounter; 
  // ... и другие элементы интерфейса
}

function animate() {
  if (!gameStarted || gamePaused) return;
  animationId = requestAnimationFrame(animate)
  c.drawImage(image, 0, 0)
  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i]
    enemy.update()
    if (enemy.position.x > canvas.width) {
      if (enemy.health > 0){
        hearts -= 1
        enemies.splice(i, 1)
        document.querySelector('#hearts').innerHTML = hearts
        if (hearts === 0) {
          alert('Вы проиграли! Начните игру заново.')
          cancelAnimationFrame(animationId)
          document.querySelector('#gameOver').style.display = 'flex'
        }
      }
      enemies.splice(i,1);
    }
  }
  for (let i = explosions.length - 1; i >= 0; i--) {
    const explosion = explosions[i]
    explosion.draw()
    explosion.update()
    if (explosion.frames.current >= explosion.frames.max - 1) {
      explosions.splice(i, 1)
    }
    // console.log(explosions)
  }
  // tracking total amount of enemies
    if (enemies.length === 0) {
    let EnemyLeftCount = 0;
    enemyCount += 10
    wave ++
    damage = damage - 3
    EnemyActualCount = enemyCount + 5
    spawnEnemies(EnemyActualCount)
    // Прототип
    document.querySelector('#wave').innerHTML = wave;
    document.querySelector('#EnemyLeftCount').innerHTML = EnemyActualCount;
  }
  placementTiles.forEach((tile) => {
    tile.update(mouse)
  })
  buildings.forEach((building) => {
    building.update()
    building.target = null
    const validEnemies = enemies.filter((enemy) => {
      const xDifference = enemy.center.x - building.center.x;
      const yDifference = enemy.center.y - building.center.y;
      const distance = Math.hypot(xDifference, yDifference);
      return distance < enemy.radius + building.radius && enemy.health > 0; // Добавляем проверку здоровья
    });
    building.target = validEnemies[0]
    for (let i = building.projectiles.length - 1; i >= 0; i--) {
      const projectile = building.projectiles[i]
      projectile.update()
      const xDifference = projectile.enemy.center.x - projectile.position.x
      const yDifference = projectile.enemy.center.y - projectile.position.y
      const distance = Math.hypot(xDifference, yDifference)

      // this is when a projectile hits an enemy
      if (distance < projectile.enemy.radius + projectile.radius) {
        // enemy health and enemy removal
        // Система наскеливания урона по врагам
        if (damage < 6){
          damage = 6
          projectile.enemy.health -= damage
        }
        else{
          projectile.enemy.health -= damage
        }

        console.log(damage)
        if (projectile.enemy.health <= 0 && !projectile.enemy.isDead) {
          const enemyIndex = enemies.findIndex((enemy) => {
            return projectile.enemy === enemy
          })

          if (enemyIndex > -1) {
            // enemies.splice(enemyIndex, 1)
            coins += 15
            // Счетчик убитых мобов
            EnemyKillCounter += 1
            EnemyActualCount--
            document.querySelector('#EnemyLeftCount').innerHTML = EnemyActualCount;
            document.querySelector('#EnemyKillCounter').innerHTML = EnemyKillCounter;
            // Конец правки
            document.querySelector('#coins').innerHTML = coins;
            projectile.enemy.isDead = true; // Помечаем врага как "убитого"

          }
        }
        // console.log(projectile.enemy.health)
        explosions.push(
          new Sprite({
            position: { x: projectile.position.x, y: projectile.position.y },
            imageSrc: './img/explosion.png',
            frames: { max: 4 },
            offset: { x: 0, y: 0 }
          })
        )
        building.projectiles.splice(i, 1)
      }
    }
  })
}

const mouse = {
  x: undefined,
  y: undefined
}

canvas.addEventListener('click', (event) => {
  if (activeTile && !activeTile.isOccupied && coins - 100 >= 0) {
    coins -= 100
    document.querySelector('#coins').innerHTML = coins
    buildings.push(
      new Building({
        position: {
          x: activeTile.position.x,
          y: activeTile.position.y
        }
      })
    )
    activeTile.isOccupied = true
    buildings.sort((a, b) => {
      return a.position.y - b.position.y
    })
  }
})

window.addEventListener('mousemove', (event) => {
  mouse.x = event.clientX
  mouse.y = event.clientY
  activeTile = null
  for (let i = 0; i < placementTiles.length; i++) {
    const tile = placementTiles[i]
    if (
      mouse.x > tile.position.x &&
      mouse.x < tile.position.x + tile.size &&
      mouse.y > tile.position.y &&
      mouse.y < tile.position.y + tile.size
    ) {
      activeTile = tile
      break
    }
  }
})

const playButton = document.getElementById('playButton');
playButton.addEventListener('click', () => {
  if (!gameStarted) {
    spawnEnemies(enemyCount);
    gameStarted = true;
    requestAnimationFrame(animate);
  }
});

const restartButton = document.getElementById('restartButton');
restartButton.addEventListener('click', () => {
  cancelAnimationFrame(animationId);
  resetGame();
  gameStarted = false;
  // Опционально: скрыть элементы интерфейса
});

const pauseButton = document.getElementById('pauseButton');
pauseButton.addEventListener('click', () => {
  gamePaused = !gamePaused;
  if (gamePaused) {
    cancelAnimationFrame(animationId);
  } else {
    requestAnimationFrame(animate);
  }
});