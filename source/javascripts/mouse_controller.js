function MouseController(world){
	this.world = world
	this.mouseDown = false
	this.mouseX = undefined;
	this.mouseY = undefined;

	t = this;

	// Setup mouse
  function mouseDownHandler(e){
    t.mouseDown = true
    mouseMove(e);
    document.addEventListener("mousemove", mouseMove, true);
    document.addEventListener("touchmove", mouseMove, true);
  }
  function mouseUpHandler(){
    document.removeEventListener("mousemove", mouseMove, true)
    document.removeEventListener("touchmove", mouseMove, true);
    t.mouseDown = false;
    mouseX = undefined;
    mouseY = undefined;
  }
	function mouseMove(e){
    mouseX = e.clientX || e.pageX // # (e.clientX - canvas.getBoundingClientRect().left) / SCALE;
		mouseY = e.clientY || e.pageY//# (e.clientY - canvas.getBoundingClientRect().top) / SCALE;

    e.preventDefault()
	}
  document.addEventListener('mousedown', mouseDownHandler)
  document.addEventListener('touchstart', mouseDownHandler)
  document.addEventListener('mouseup', mouseUpHandler)
  document.addEventListener('touchend', mouseUpHandler)
}

MouseController.prototype.update = function(){
	if (this.mouseDown) {
		this.mouseDownAt(mouseX, mouseY);
	} else if (this.jointExists()) {
		this.mouseUp();
	}
}

MouseController.prototype.mouseDownAt = function(x, y) {
  if (!this.mouseJoint) {
     var body = this.getBodyAt(x, y);
     if (body) {
        var md = new b2MouseJointDef();
        md.bodyA = this.world.GetGroundBody();
        md.bodyB = body;
        md.target.Set(x, y);
        md.collideConnected = true;
        md.maxForce = 10000.0 * body.GetMass();
        this.mouseJoint = this.world.CreateJoint(md);
        body.SetAwake(true);

        if(window.debug){

          //RevoluteJoint
          console.log('data-joint="{x: ' + (window.innerWidth/2 - x) + ', y: ' + (window.innerHeight/2 - y) + ', to: bodies.' + body.GetUserData().id + '}"')
        }
     }
  } else {
      this.mouseJoint.SetTarget(new b2Vec2(x, y));
  }
}

MouseController.prototype.jointExists = function() {
  return (this.mouseJoint != null);
}

MouseController.prototype.mouseUp = function() {
  this.world.DestroyJoint(this.mouseJoint);
  this.mouseJoint = null;
}

MouseController.prototype.getBodyAt = function(x, y) {
   var mousePVec = new b2Vec2(x, y);
   var aabb = new b2AABB();
   aabb.lowerBound.Set(x - 0.001, y - 0.001);
   aabb.upperBound.Set(x + 0.001, y + 0.001);
   
   // Query the world for overlapping shapes.

   var selectedBody = null;
   this.world.QueryAABB(function(fixture) {
     if(fixture.GetBody().GetType() != b2Body.b2_staticBody) {
        if(fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), mousePVec)) {
           selectedBody = fixture.GetBody();
           return false;
        }
     }
     return true;
   }, aabb);
   return selectedBody;
}