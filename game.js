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
      // draw the application name string.
      ctx.font = "32pt Arial";
      ctx.fillText("HTML5 PONG", 0, 100);
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

    /** A function that is called when the game enters this scene. */
    function enter() {
      // TODO
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
      // TODO
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

    // set initial drawing fill color to white.
    ctx.fillStyle = "white";

    // set the welcome scene as the initial scene.
    setScene(welcomeScene);
  }

  /**
   * Run the game.
   *
   * Running the game means that the game will execute an infinite loop that
   * runs the game logic updates and draw operations until the user closes the
   * browser tab or the JavaScript catches an exception from the code.
   */
  function run() {
    // TODO ...
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
