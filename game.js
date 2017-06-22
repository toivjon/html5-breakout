var breakout = (function () {

  var canvas;
  var ctx;
  var scene;

  var welcomeScene = (function () {

    function enter() {
      // TODO
    }

    function exit() {
      // TODO
    }

    return {
      enter: enter,
      exit: exit
    }
  })();

  var courtScene = (function () {

    function enter() {
      // TODO
    }

    function exit() {
      // TODO
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
