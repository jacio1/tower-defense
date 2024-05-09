class Building extends Sprite {
  constructor({ position = { x: 0, y: 0 } }) {
    super({
      position,
      imageSrc: './img/tower1.png',
      frames: {
        max: 6
      },
      offset: {
        x: 0,
        y: -30
      }
    })

    this.width = 64 * 2
    this.height = 64
    this.center = {
      x: this.position.x + this.width / 3,
      y: this.position.y + this.height / 3
    }
    this.projectiles = []
    this.radius = 200
    this.target
  }

  draw() {
    super.draw()

    c.beginPath()
    c.arc(this.center.x, this.center.y, this.radius, 0, Math.PI *3)
    c.fillStyle = 'rgba(255, 255, 255, 0.1)'
    c.fill()
  }

  update() {
    this.draw()
    if (this.target || (!this.target && this.frames.current !== 0))
      super.update()

    if (
      this.target &&
      this.frames.current === 5 &&
      this.frames.elapsed % this.frames.hold === 0
    )
      this.shoot()
  }

  shoot() {
    this.projectiles.push(
      new Projectile({
        position: {
          x: this.center.x - 20,
          y: this.center.y - 110
        },
        enemy: this.target
      })
    )
  }
}
