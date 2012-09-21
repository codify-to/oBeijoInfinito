CATEGORY_BODY = 1
CATEGORY_FRONT_ARM = 2
CATEGORY_BACK_ARM = 4
CATEGORY_BACK_ARM = 8
CATEGORY_BACK_LEG = 16
CATEGORY_FRONT_LEG = 32

TOTAL_LIFE_FOCE = 20000

window.drawDebugWorld = false
window.debug = false

Event.observe window, 'load', =>
	# Get all body parts
	@bodyParts = $$(".bodyPart").reverse()
	@bodies = {}

	# Initialize the world
	worldWidth = window.innerWidth
	worldHeight = window.innerHeight
	gravity = new b2Vec2(0, 0) #300)
	world = new b2World(gravity, true);

	# Ground
	fd = new b2FixtureDef()
	fd.shape = new b2PolygonShape()
	fd.shape.SetAsBox(worldWidth, 10)
	bodyDef = new b2BodyDef()
	bodyDef.type = b2Body.b2_staticBody
	bodyDef.position.Set(0, 0);
	world.CreateBody(bodyDef).CreateFixture(fd)
	bodyDef.position.Set(0, worldHeight)
	world.CreateBody(bodyDef).CreateFixture(fd)
	# Walls
	fd = new b2FixtureDef()
	fd.shape = new b2PolygonShape()
	fd.shape.SetAsBox(10, worldHeight)
	bodyDef = new b2BodyDef()
	bodyDef.type = b2Body.b2_staticBody
	bodyDef.position.Set(0, 0);
	world.CreateBody(bodyDef).CreateFixture(fd)
	bodyDef.position.Set(worldWidth, 0)
	world.CreateBody(bodyDef).CreateFixture(fd)

	# Put every body part in it's initial position
	@bodyParts.each (part, index)=>
		return if not part.readAttribute("data-body")

		eval "bodyConfig = { #{part.readAttribute("data-body")} }"
		part.bodyConfig = bodyConfig

		# Decentralize anchor point for easier positioning
		bodyConfig.offsetX = bodyConfig.offset[0] + bodyConfig.width/2
		bodyConfig.offsetY = bodyConfig.offset[1] + bodyConfig.height/2
		
		# Create each box
		# fixture
		fd = new b2FixtureDef()
		fd.density = 1
		fd.friction = 1
		fd.restitution = 0 # Do not bounce
		fd.shape = new b2PolygonShape()
		fd.shape.SetAsBox(bodyConfig.width/2, bodyConfig.height/2)
		# Collision
		fd.filter.categoryBits = bodyConfig.category || 1;
		fd.filter.maskBits = bodyConfig.mask || 0;
		# Body
		bodyDef = new b2BodyDef()
		bodyDef.type = b2Body.b2_dynamicBody
		bodyDef.position.Set(worldWidth/2 + bodyConfig.x, worldHeight/2 + bodyConfig.y);
		bodyDef.userData = part
		# Create it in the world
		@bodies[part.id] = world.CreateBody(bodyDef)
		@bodies[part.id].CreateFixture(fd)

	
	# Create joints
	for k, body of @bodies
		img = body.GetUserData()
		continue if not img.readAttribute("data-joint")
		# 
		eval "var joints = [ #{ img.readAttribute("data-joint") } ]"
		for jointData in joints
			continue if not jointData.to
			# 
			joint = new b2RevoluteJointDef()
			joint.lowerAngle = -0.25 * Math.PI;
			joint.upperAngle = 0.25 * Math.PI;
			joint.enableLimit = true;


			# joint.collideConnected = true
			joint.Initialize body, jointData.to, new b2Vec2(worldWidth/2-jointData.x, worldHeight/2-jointData.y)
			world.CreateJoint joint

	# Setup degub drawing
	canvas = $("canvas")
	if canvas
		canvas.setStyle display: 'block'
		ctx = canvas.getContext('2d')
		canvas.width = worldWidth
		canvas.height = worldHeight

	mouseController = new MouseController(world)

	@step = (cnt)->
		world.Step(1.0/60, 1, 1);
		ctx.clearRect 0, 0, worldWidth, worldHeight
		
		# update mouse
		mouseController.update();

		bodies.cabecas.ApplyImpulse(new b2Vec2(0, -TOTAL_LIFE_FOCE), bodies.cabecas.GetWorldCenter())
		# 
		bodies.ela_pe_frente.ApplyImpulse(new b2Vec2(0, TOTAL_LIFE_FOCE/4), bodies.ela_pe_frente.GetWorldCenter())
		bodies.ela_pe_tras.ApplyImpulse(new b2Vec2(0, TOTAL_LIFE_FOCE/4), bodies.ela_pe_tras.GetWorldCenter())
		bodies.ele_pe_frente.ApplyImpulse(new b2Vec2(0, TOTAL_LIFE_FOCE/4), bodies.ele_pe_frente.GetWorldCenter())
		bodies.ele_pe_tras.ApplyImpulse(new b2Vec2(0, TOTAL_LIFE_FOCE/4), bodies.ele_pe_tras.GetWorldCenter())

		# Update image positions
		b = world.m_bodyList
		loop
			# console.log world.m_bodyList
			break if not b

			if not (d = b.GetUserData())
				b = b.m_next
				continue
	
			# Update positioning
			ctx.save()
			ctx.translate (b.GetPosition().x), (b.GetPosition().y)
			ctx.rotate b.GetAngle()
			ctx.drawImage d, -d.bodyConfig.offsetX, -d.bodyConfig.offsetY
			ctx.restore()

			b = b.m_next

		if window.drawDebugWorld
			drawWorld world, ctx

		# console.log "break!"
		setTimeout('step(' + (cnt || 0) + ')', 10);
	step()