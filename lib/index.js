function MatterCollision(options) {

  options = options || {}

  this.collisionMomentumUpperThreshold = options.collisionMomentumUpperThreshold || Infinity
}

MatterCollision.prototype.name = 'matter-collision'
MatterCollision.prototype.version = '0.0.0' // PLUGIN_VERSION
MatterCollision.prototype.for = 'matter-js@^0.12.0'

MatterCollision.prototype.install = function (Matter) {
  this.Matter = Matter

  let self = this

  this.Matter.after('Body.create', function () {
    self.initBody(this)
  })

  this.Matter.after('Engine.create', function () {
    self.initEngine(this)
  })
}

MatterCollision.prototype.initBody = function (body) {
  body.plugin.collision = body.plugin.collision || {}

  // default options
  body.plugin.collision = Object.assign({

  }, body.plugin.collision)

  let events = ['start', 'active', 'end']

  // ensure reactions are in the object format (instead of the function shorthand)
  events.forEach(eventName => {
    let reaction = body.plugin.collision[eventName]
    if (!reaction) {
      return
    }

    if (typeof reaction === 'function') {
      body.plugin.collision[eventName] = {
        handler: reaction,
      }
    }

    Object.assign(body.plugin.collision[eventName], {

    }, body.plugin.collision[eventName])
  })
}

MatterCollision.prototype.initEngine = function (engine) {
  /**
   * TODO: calculate collision impact
   * As suggested at
   * https://github.com/liabru/matter-js/issues/155
   */
  this.Matter.Events.on(engine, 'beforeUpdate', e => {
    engine.world.bodies.forEach(function (body) {
      body.plugin.collision._previousVelocity = {
        x: body.velocity.x,
        y: body.velocity.y
      }
    })
  })

  this.Matter.Events.on(engine, 'collisionStart', e => {
    let pairs = e.pairs

    pairs.forEach(pair => {

      let bodyA = pair.bodyA
      let bodyB = pair.bodyB

      let bodyAReaction = bodyA.plugin.collision.start
      let bodyBReaction = bodyB.plugin.collision.start

      if (!bodyAReaction && !bodyBReaction) {
        return
      }

      /**
       * As suggested at
       * https://github.com/liabru/matter-js/issues/155
       */
      let bodyAMomentum = this.Matter.Vector.mult(
        bodyA.plugin.collision._previousVelocity || {x: 0, y: 0},
        bodyA.mass === Infinity ? 0 : bodyA.mass
      )
      let bodyBMomentum = this.Matter.Vector.mult(
        bodyB.plugin.collision._previousVelocity || {x: 0, y: 0},
        bodyB.mass === Infinity ? 0 : bodyB.mass
      )
      let collisionMomentum = this.Matter.Vector.magnitude(
        this.Matter.Vector.sub(bodyAMomentum, bodyBMomentum)
      )
      collisionMomentum = Math.min(collisionMomentum, this.collisionMomentumUpperThreshold)
      let collisionIntensity = collisionMomentum / this.collisionMomentumUpperThreshold

      if (bodyAReaction) {
        bodyAReaction.handler({
          self: bodyA,
          other: bodyB,
          event: e,

          intensity: collisionIntensity,
        })
      }

      if (bodyBReaction) {
        bodyBReaction.handler({
          self: bodyB,
          other: bodyA,
          event: e,

          intensity: collisionIntensity,
        })
      }
    })
  })

  this.Matter.Events.on(engine, 'collisionActive', e => {
    let pairs = e.pairs

    pairs.forEach(pair => {
      let bodyA = pair.bodyA
      let bodyB = pair.bodyB

      let bodyAReaction = bodyA.plugin.collision.active
      let bodyBReaction = bodyB.plugin.collision.active

      if (!bodyAReaction && !bodyBReaction) {
        return
      }

      if (bodyAReaction) {
        bodyAReaction.handler({
          self: bodyA,
          other: bodyB,
          event: e,
        })
      }

      if (bodyBReaction) {
        bodyBReaction.handler({
          self: bodyB,
          other: bodyA,
          event: e,
        })
      }
    })
  })

  this.Matter.Events.on(engine, 'collisionEnd', e => {
    let pairs = e.pairs

    pairs.forEach(pair => {
      let bodyA = pair.bodyA
      let bodyB = pair.bodyB

      let bodyAReaction = bodyA.plugin.collision.end
      let bodyBReaction = bodyB.plugin.collision.end

      if (!bodyAReaction && !bodyBReaction) {
        return
      }

      if (bodyAReaction) {
        bodyAReaction.handler({
          self: bodyA,
          other: bodyB,
          event: e,
        })
      }

      if (bodyBReaction) {
        bodyBReaction.handler({
          self: bodyB,
          other: bodyA,
          event: e,
        })
      }
    })
  })
}

function _handleCollisionEvent(eventName, e) {
  let pairs = e.pairs

  pairs.forEach(pair => {
    
  })
}

module.exports = MatterCollision
