const Matter = require('matter-js')

/**
 * Matter submodules
 */
const Engine = Matter.Engine
const Render = Matter.Render
const Runner = Matter.Runner
const Bodies = Matter.Bodies
const World = Matter.World
const Mouse = Matter.Mouse
const MouseConstraint = Matter.MouseConstraint
const Events = Matter.Events
const Common = Matter.Common

const MatterCollision = require('../')

function setup(options) {
  const CANVAS_WIDTH = options.canvasWidth
  const CANVAS_HEIGHT = options.canvasHeight
  let canvas = options.canvas

  if (!canvas) {
    throw new Error('canvas is required')
  }
  
  if (!CANVAS_WIDTH) {
    throw new Error('CANVAS_WIDTH is required')
  }
  
  if (!CANVAS_HEIGHT) {
    throw new Error('CANVAS_HEIGHT is required')
  }

  Matter.use(new MatterCollision({
  	collisionMomentumUpperThreshold: 100
  }))

  // create engine
  let engine = Engine.create({
  	// enable sleeping as we are collision heavy users
  	enableSleeping: true,
  })

  // create renderer
  let render = Render.create({
  	canvas: canvas,
  	engine: engine,
  	options: {
  		wireframes: false,
  		width: CANVAS_WIDTH,
  		height: CANVAS_HEIGHT,
  	}
  })

  // create runner
  let runner = Runner.create()

  Runner.run(runner, engine)
  Render.run(render)

  let walls = [
  	// ceiling
		Bodies.rectangle(
	    CANVAS_WIDTH / 2, // align center to center
	    -(60 / 2),         
	    CANVAS_WIDTH, // width
	    60,  // height
	    {
	      isStatic: true,
	      restitution: 1,
	    }
	  ),
	  // ground
		Bodies.rectangle(
	    CANVAS_WIDTH / 2, // align center to center
	    CANVAS_HEIGHT + (60 / 2),         
	    CANVAS_WIDTH, // width
	    60,  // height
	    {
	      isStatic: true,
	      restitution: 1,
	      plugin: {
	        collision: {
	        	start: (e) => {
	        		// console.log(`collision started for body ${e.self.label} with ${e.other.label}`)
	        	}
	        }
	      }
	    }
	  ),
	  // left
		Bodies.rectangle(
	    -(60 / 2), // align center to center
	    CANVAS_HEIGHT / 2,         
	    60, // width
	    CANVAS_HEIGHT,  // height
	    {
	      isStatic: true,
	      restitution: 1,
	    }
	  ),
	  // right
		Bodies.rectangle(
	    CANVAS_WIDTH + (60 / 2), // align center to center
	    CANVAS_HEIGHT / 2,         
	    60, // width
	    CANVAS_HEIGHT,  // height
	    {
	      isStatic: true,
	      restitution: 1,
	    }
	  ),
	]

  World.add(engine.world, walls)

  let bodies = [
    Bodies.rectangle(250, 250, 40, 40, {
    	label: 'Rectangle',
    	restitution: 0,
      // density: 0.3,
      friction: 0,
      frictionAir: 0,
      frictionStatic: 0,
      plugin: {
        collision: {
        	start: (e) => {
        		console.log(`collision started for body ${e.self.label} with ${e.other.label}`)
        		console.log(e.intensity)
        	}
        }
      },
      render: {
        // fillStyle: '#EE2D2C',
      }
    }),
  ]

  World.add(engine.world, bodies)

  // add mouse control
  let mouse = Mouse.create(render.canvas)
  let mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
      // allow bodies on mouse to rotate
      angularStiffness: 0,
      render: {
        visible: false
      }
    }
  })

  World.add(engine.world, mouseConstraint);

  // keep the mouse in sync with rendering
  render.mouse = mouse;

  return {
  	engine: engine,
  	stop: () => {
	    Matter.Render.stop(render)
	    Matter.Runner.stop(runner)
  	}
  }
}

setup({
  canvasWidth: window.innerWidth,
  canvasHeight: window.innerHeight,
  canvas: document.querySelector('canvas'),
})
