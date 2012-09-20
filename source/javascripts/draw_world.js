function drawWorld(world, context) {
	for (var j = world.m_jointList; j; j = j.m_next) {
		drawJoint(world, j, context);
	}
	for (var b = world.m_bodyList; b; b = b.m_next) {
		for (var f = b.GetFixtureList(); f != null; f = f.GetNext()) {
			drawShape(f.GetShape(), context, b);
		}
	}
}
function drawJoint(world, joint, context) {
	window.j = joint;
	var b1 = joint.GetBodyA();
	var b2 = joint.GetBodyB();
	var x1 = b1.GetPosition();
	var x2 = b2.GetPosition();
	var p1 = joint.GetAnchorA();
	var p2 = joint.GetAnchorB();
	context.strokeStyle = '#00f';
	context.beginPath();
	switch (joint.m_type) {
	case b2Joint.e_distanceJoint:
		context.moveTo(p1.x, p1.y);
		context.lineTo(p2.x, p2.y);
		break;

	case b2Joint.e_pulleyJoint:
		// TODO
		break;

	default:
		if (b1 == world.m_groundBody) {
			context.moveTo(p1.x, p1.y);
			context.lineTo(x2.x, x2.y);
		}
		else if (b2 == world.m_groundBody) {
			context.moveTo(p1.x, p1.y);
			context.lineTo(x1.x, x1.y);
		}
		else {
			context.moveTo(x1.x, x1.y);
			context.lineTo(p1.x, p1.y);
			context.lineTo(x2.x, x2.y);
			context.lineTo(p2.x, p2.y);
		}
		break;
	}
	context.stroke();
}
function drawShape(shape, context, bd) {
	context.save();
	context.strokeStyle = '#f00';
	context.beginPath();
	switch (shape.m_type) {
	case b2Shape.e_circleShape:
		{
			var circle = shape;
			var pos = bd.GetPosition();
			var r = circle.m_radius;
			var segments = 16.0;
			var theta = 0.0;
			var dtheta = 2.0 * Math.PI / segments;

			context.save();
			// draw circle
			context.moveTo(pos.x + r, pos.y);
			for (var i = 0; i < segments; i++) {
				var d = new b2Vec2(r * Math.cos(theta), r * Math.sin(theta));
				var v = b2Math.AddVV(pos, d);
				context.lineTo(v.x, v.y);
				theta += dtheta;
			}
			context.lineTo(pos.x + r, pos.y);
	
			// draw radius
			context.moveTo(pos.x, pos.y);
			var ax = circle.m_radius;
			var pos2 = new b2Vec2(pos.x + r * ax.x, pos.y + r * ax.y);
			context.lineTo(pos2.x, pos2.y);
			context.restore();
		}
		break;
	case b2Shape.e_polygonShape:
		{
			var poly = shape,
			pos = bd.GetPosition();
			context.translate(pos.x, pos.y)
			context.rotate(bd.GetAngle())
			for (var i = 0; i < poly.m_vertexCount; i++) {
				context.lineTo(poly.m_vertices[i].x, poly.m_vertices[i].y)
			}
			context.lineTo(poly.m_vertices[0].x, poly.m_vertices[0].y)
			// console.log(b2Math.MulMV(poly.m_radius, poly.m_vertices[0]))
			// var tV = b2Math.AddVV(bd.GetPosition(), b2Math.MulMV(poly.m_radius, poly.m_vertices[0]));
			// console.log(tV)
			// context.moveTo(tV.x, tV.y);
			// for (var i = 0; i < poly.m_vertexCount; i++) {
			// 	var v = b2Math.AddVV(bd.GetPosition(), b2Math.MulMV(poly.m_radius, poly.m_vertices[i]));
			// 	context.lineTo(v.x, v.y);
			// }
			// context.lineTo(tV.x, tV.y);
		}
		break;
	}
	context.stroke();
	context.restore()
}

