var breakout = (function () {

  /** A constant for the number one keycode. */
  var KEY_1 = 49;
  /** A constant for the number two keycode. */
  var KEY_2 = 50;

  var canvas;
  var ctx;
  var scene;
  var players;

  // ==========================================================================

  /**
   * The welcoming scene for the Breakout game.
   *
   * This scene is the main scene which will be shown to users when they open
   * the page. Our implementation contains a simple view where users see the
   * name of the game and an instructions about how to start the game.
   */
  var welcomeScene = (function () {

    /** A function that is called when the game enters this scene. */
    function enter() {
      document.addEventListener("keyup", onKeyUp);
    }

    /** A function that is called when the game exists this scene. */
    function exit() {
      document.removeEventListener("keyup", onKeyUp);
    }

    /** A function that is called on each main loop iteration. */
    function update() {
      // ... no implementation required
    }

    /** A funcion that is called on each rendering frame iteration. */
    function draw() {
      // calculate the center coordinates of the canvas.
      var center = [(canvas.width / 2), (canvas.height / 2)];

      // draw the application name string.
      ctx.font = "32pt Arial";
      ctx.fillText("HTML5 BREAKOUT", center[0], center[1] - 100);

      // draw the number of players selection instruction strings.
      ctx.font = "24pt Arial";
      ctx.fillText("Press [1] to start a single player game.", center[0], center[1]);
      ctx.fillText("Press [2] to start a two player game.", center[0], center[1] + 50);
    }

    /**
     * A key listener to detect when a user key press is released.
     *
     * This implementation will detect only number 1 and 2 presses, which will
     * first save the definition about the number of players and the trigger a
     * new state transition from the welcome scene to the court scene.
     *
     * @param {*} event A key release event from the browser.
     */
    function onKeyUp(event) {
      var key = event.keyCode ? event.keyCode : event.which;
      if (key == KEY_1 || key == KEY_2) {
        players = (key == KEY_1 ? 1 : 2);
        setScene(courtScene);
      }
    }

    return {
      enter: enter,
      exit: exit,
      update: update,
      draw: draw
    }

  })();

  // ==========================================================================

  var courtScene = (function () {

    /** The divisor of the static wall thickness related to canvas width. */
    var WALL_THICKNESS_DIVISOR = 30;
    /** The divisor of the ball thickness related to canvas width. */
    var BALL_THICKNESS_DIVISOR = 30;
    /** The divisor of the paddle width related to canvas width. */
    var PADDLE_WIDTH_DIVISOR = 10;

    // ========================================================================
    /**
     * A constructor for all entities within the court scene.
     * @param {*} x The x-position of the entity.
     * @param {*} y The y-position of the entity.
     * @param {*} width The width of the entity.
     * @param {*} height The height of the entity.
     */
    function Entity(x, y, width, height) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
    }

    // ========================================================================
    /**
     * A constructor for all drawable entities within the court scene.
     * @param {*} x The x-position of the drawable entity.
     * @param {*} y The y-position of the drawable entity.
     * @param {*} width The width of the drawable entity.
     * @param {*} height The height of the drawable entity.
     */
    function Drawable(x, y, width, height) {
      Entity.call(this, x, y, width, height);
      this.fillStyle = "white";
      this.visible = true;
      this.draw = function () {
        if (this.visible == true) {
          ctx.fillStyle = this.fillStyle;
          ctx.fillRect(x, y, width, height);
        }
      }
    }

    // ========================================================================
    /**
     * A constructor for all collideable entities within the court scene.
     * @param {*} x The x-position of the collideable entity.
     * @param {*} y The y-position of the collideable entity.
     * @param {*} width The width of the collideable entity.
     * @param {*} height The height of the collideable entity.
     */
    function Collideable(x, y, width, height) {
      Drawable.call(this, x, y, width, height);
      this.extent = [width / 2, height / 2];
      this.center = [x + this.extent[0], y + this.extent[1]];
    }

    // ========================================================================
    /**
     * A constructor for all wall entities within the court scene.
     * @param {*} x The x-position of the wall.
     * @param {*} y The y-position of the wall.
     * @param {*} width The width of the wall.
     * @param {*} height The height of the wall.
     */
    function Wall(x, y, width, height) {
      Collideable.call(this, x, y, width, height);
    }

    // ========================================================================
    /**
     * A constructor for the ball within the court scene.
     * @param {*} x The x-position of the ball.
     * @param {*} y The y-position of the ball.
     * @param {*} width The width of the ball.
     * @param {*} height The height of the ball.
     */
    function Ball(x, y, width, height) {
      Collideable.call(this, x, y, width, height);
    }

    // ========================================================================
    /**
     * A constructor for the paddle within the court scene.
     * @param {*} x The x-position of the paddle.
     * @param {*} y The y-position of the paddle.
     * @param {*} width The width of the paddle.
     * @param {*} height The height of the paddle.
     */
    function Paddle(x, y, width, height) {
      Collideable.call(this, x, y, width, height);
      this.fillStyle = "cyan";
    }

    var leftWall;
    var rightWall;
    var topWall;
    var ball;
    var paddle;

    /** A function that is called when the game enters this scene. */
    function enter() {
      // build the vertical wall at the left side of the court.
      var wallThickness = (canvas.width / WALL_THICKNESS_DIVISOR);
      leftWall = new Wall(0, 0, wallThickness, canvas.height);

      // build the vertical wall at the right side of the court.
      var x = (canvas.width - wallThickness);
      rightWall = new Wall(x, 0, wallThickness, canvas.height);

      // build the top wall at the top of the court.
      topWall = new Wall(0, 0, canvas.width, wallThickness);

      // build the ball of the court.
      var ballThickness = (canvas.width / BALL_THICKNESS_DIVISOR);
      var x = ((canvas.width / 2) - (ballThickness / 2));
      var y = ((canvas.height / 2) - (ballThickness / 2));
      ball = new Ball(x, y, ballThickness, ballThickness);

      // build the paddle for the player.
      var paddleWidth = (canvas.width / PADDLE_WIDTH_DIVISOR);
      var x = (canvas.width / 2) - (paddleWidth / 2);
      var y = (canvas.height - 100);
      paddle = new Paddle(x, y, paddleWidth, ballThickness);
    }

    /** A function that is called when the game exists this scene. */
    function exit() {
      // TODO
    }

    /** A function that is called on each main loop iteration. */
    function update() {
      // TODO
    }

    /** A funcion that is called on each rendering frame iteration. */
    function draw() {
      leftWall.draw();
      rightWall.draw();
      topWall.draw();
      ball.draw();
      paddle.draw();
    }

    return {
      enter: enter,
      exit: exit,
      update: update,
      draw: draw
    }

  })();

  /**
   * Set the given scene as the active scene.
   *
   * Old active scene (if any) will be first exited by calling the exit
   * function so it can clean up all necessary resources as required. New
   * scene will be assigned as the active scene and the enter function will
   * be called to ensure that the new scene can initialize itself.
   *
   * @param {*} newScene A new scene to be applied as the active scene.
   */
  function setScene(newScene) {
    if (newScene) {
      // perform a cleanup for the old scene (if defined).
      if (scene) {
        scene.exit();
      }

      // apply the new scene and call the scene init (reset).
      scene = newScene;
      scene.enter();
    }
  }

  /**
   * Initialize the game.
   *
   * Initialization will ensure that the game will get a reference to the 2D
   * drawing context from the game canvas element. It also provides a way to
   * define a game wide initializations for scenes etc.
   */
  function init() {
    // get a referene to the target <canvas> element.
    if (!(canvas = document.getElementById("game-canvas"))) {
      throw Error("Unable to find the required canvas element.");
    }

    // get a reference to the 2D drawing context.
    if (!(ctx = canvas.getContext("2d"))) {
      throw Error("Unable to get 2D draw context from the canvas.");
    }

    // specify global draw definitions.
    ctx.fillStyle = "white";
    ctx.textAlign = "center";

    // set the welcome scene as the initial scene.
    setScene(courtScene);
  }

  /**
   * Run the game.
   *
   * Running the game means that the game will execute an infinite loop that
   * runs the game logic updates and draw operations until the user closes the
   * browser tab or the JavaScript catches an exception from the code.
   */
  function run() {
    // TODO calculate delta time and call scene update.

    // swipe old contents from the draw buffer and draw the scene.
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    scene.draw();

    // perform a main loop iteration.
    requestAnimationFrame(run);
  }

  /**
   * Start the game.
   *
   * Game will be first initialized and then started. Game will be using a
   * infinite loop (via requestAnimationFrame) as the main loop, so the game
   * will not stop running until the user closes the browser tab or if an
   * error is detected by the browser JavaScript engine.
   */
  function start() {
    init();
    run();
  }

  return {
    start: start
  }

})();

breakout.start();
