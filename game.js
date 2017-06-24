var breakout = (function () {

  /** A constant for the number one keycode. */
  var KEY_1 = 49;
  /** A constant for the number two keycode. */
  var KEY_2 = 50;
  /** A constant for the right-arrow keycode. */
  var KEY_RIGHT = 39;
  /** A constant for the left-arrow keycode. */
  var KEY_LEFT = 37;

  var canvas;
  var ctx;
  var scene;
  var players;
  var prevTickTime;
  var deltaAccumulator = 0.0;
  var FPS = (1000.0 / 60.0);

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

    /** The divisor of the slot width related to canvas width. */
    var SLOT_WIDTH_DIVISOR = 16;
    /** The divisor of the slot height related to canvas width. */
    var SLOT_HEIGHT_DIVISOR = 45;

    /**
     * Get a normalized version of the given 2d-vector.
     *
     * @param {[]} vector An 2d-vector to be normalized.
     * @returns {[]} A normalized version of the given vector.
     */
    function normalize(vector) {
      var length = Math.sqrt(Math.pow(vector[0], 2) + Math.pow(vector[1], 2));
      return [vector[0] / length, vector[1] / length];
    }

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
          ctx.fillRect(this.x, this.y, width, height);
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
      this.enabled = true;
      this.collides = function (o) {
        if (this.enabled == false || o.enabled == false) return false;
        var x = Math.abs(this.center[0] - o.center[0]) < (this.extent[0] + o.extent[0]);
        var y = Math.abs(this.center[1] - o.center[1]) < (this.extent[1] + o.extent[1]);
        return x && y;
      }
    }

    // ========================================================================
    /**
     * A constructor for all movable entities within the court scene.
     * @param {*} x The x-position of the movable entity.
     * @param {*} y The y-position of the movable entity.
     * @param {*} width The width of the movable entity.
     * @param {*} height The height of the movable entity.
     */
    function Movable(x, y, width, height) {
      Collideable.call(this, x, y, width, height);
      this.direction = [0.0, 0.0];
      this.velocity = 0.0;
      this.move = function (dt) {
        if (this.direction[0] != 0.0) {
          var diffX = dt * this.direction[0] * this.velocity;
          this.x += diffX;
          this.center[0] += diffX;
        }
        if (this.direction[1] != 0.0) {
          var diffY = dt * this.direction[1] * this.velocity;
          this.y += diffY;
          this.center[1] += diffY;
        }
      }
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
      /** The initial velocity for the ball.  */
      var INITIAL_VELOCITY = 0.4;

      /**
       * A utility function to create an initial random direction for the ball.
       *
       * @returns {[]} A new random 2d-direction vector.
       */
      function createRandomInitDirection() {
        switch (Math.floor((Math.random() * 10) + 1) % 3) {
          case 0:
            return normalize([0.0, 1.0]);
          case 1:
            return normalize([0.5, 0.5]);
          case 2:
            return normalize([-0.5, 0.5]);
        }
      }

      Movable.call(this, x, y, width, height);
      this.velocity = INITIAL_VELOCITY;
      this.direction = createRandomInitDirection();
      this.update = function (dt) {
        if (this.direction[1] < 0.0 && this.collides(topWall)) {
          this.direction[1] = -this.direction[1];
        }
        if (this.direction[0] < 0.0 && this.collides(leftWall)) {
          this.direction[0] = -this.direction[0];
        }
        if (this.direction[0] > 0.0 && this.collides(rightWall)) {
          this.direction[0] = -this.direction[0];
        }
        if (this.direction[1] > 0.0 && this.collides(paddle)) {
          var xDiff = (this.center[0] - paddle.center[0]);
          this.direction[0] = xDiff / (paddle.width / 2);
          this.direction[1] = -this.direction[1];
          this.direction = normalize(this.direction);
        }
        if (this.direction[1] > 0.0 && this.collides(outOfBoundsDetector)) {
          // reset the ball state and randomize a new direction.
          this.x = (canvas.width / 2) - this.extent[0];
          this.y = (canvas.height / 2) - this.extent[1];
          this.center[0] = (canvas.width / 2);
          this.center[1] = (canvas.height / 2);
          this.velocity = INITIAL_VELOCITY;
          this.direction = createRandomInitDirection();

          if (players == 2) {
            // TODO handle two player game logics separately.
          } else {
            if (playerBallIndex[activePlayer] == 3) {
              // TODO ... end the game ...
            } else {
              playerBallIndex[activePlayer]++;
              playerBallIndexDigit.value = playerBallIndex[activePlayer];
            }
          }
          // TODO add a timeout before the ball launches again.
        } else {
          // check whether the ball intersects with the court bricks.
          var bricks = playerBricks[activePlayer][playerLevel[activePlayer]];
          for (var i = 0; i < bricks.length; i++) {
            if (this.collides(bricks[i])) {
              // disable the brick from the level.
              bricks[i].visible = false;
              bricks[i].enabled = false;

              // perform actions based on the color of the brick we just hit.
              if (bricks[i].fillStyle == "yellow") {
                playerScores[activePlayer] += 1;
              } else if (bricks[i].fillStyle == "green") {
                playerScores[activePlayer] += 3;
              } else if (bricks[i].fillStyle == "orange") {
                playerScores[activePlayer] += 5;
              } else if (bricks[i].fillStyle == "red") {
                playerScores[activePlayer] += 7;
              }

              // refresh the currently active players score.
              refreshPlayerScoreDigits(activePlayer);

              // determine the reflection direction based on the collision side.
              this.direction[1] = -this.direction[1];
              break;
            }
          }
        }
        this.move(dt);
      }
    }

    /**
     * Refresh the target player score digits.
     *
     * This function is used to refresh the number shown with a four digit
     * group near the top of the screen. All digits are individual numbers
     * that must be separately updated to show the actual score in a user
     * friendly way. Both players have 4 digits to show the player score.
     * One digit (thousand digit) is being hidden until it is required.
     *
     * @param {*} playerIdx The index of the player to score to be refreshed.
     */
    function refreshPlayerScoreDigits(playerIdx) {
      // get the target player score in a string presentation.
      var scoreString = playerScores[playerIdx].toString();

      // ensure that the "secret" fourth number gets visible if required.
      if (scoreString.length == 4) {
        playerScoreDigits[playerIdx][0].visible = true;
      }

      // assign score values to corresponding player score digits.
      for (var i = 0; i < scoreString.length; i++) {
        var value = parseInt(scoreString.charAt((scoreString.length - 1) - i));
        playerScoreDigits[playerIdx][3 - i].value = value;
      }
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
      Movable.call(this, x, y, width, height);
      this.fillStyle = "cyan";
      this.velocity = 0.5;
      this.update = function (dt) {
        this.move(dt);
        if (this.direction[0] < 0.0 && this.collides(leftWall)) {
          this.x = leftWall.x + leftWall.extent[0] * 2;
          this.center[0] = this.x + this.extent[0];
        }
        if (this.direction[0] > 0.0 && this.collides(rightWall)) {
          this.x = rightWall.x - this.extent[0] * 2;
          this.center[0] = this.x + this.extent[0];
        }
      }
    }

    // ========================================================================
    /**
     * A constructor for a single digit instance within the court scene.
     * @param {*} x The x-position of the digit.
     * @param {*} y The y-position of the digit.
     * @param {*} width The width of the digit.
     * @param {*} height The height of the digit.
     */
    function Digit(x, y, width, height) {
      Drawable.call(this, x, y, width, height);
      this.value = 0;

      /** The index for the topmost horizontal line. */
      var HLINE_TOP = 0;
      /** The index for the middle horizontal line. */
      var HLINE_MIDDLE = 1;
      /** The index for the bottom horizontal line. */
      var HLINE_BOTTOM = 2;

      /** The index for the topleft vertical line. */
      var VLINE_LEFT_TOP = 0;
      /** The index for the bottomleft vertical line. */
      var VLINE_LEFT_BOTTOM = 1;
      /** The index for the topright vertical line. */
      var VLINE_RIGHT_TOP = 2;
      /** The index for the bottomright vertical line. */
      var VLINE_RIGHT_BOTTOM = 3;
      /** The index for the center vertical line. */
      var VLINE_CENTER = 4;

      /** The thickness used to draw the borders of the numbers. */
      var thickness = (height / 5);

      /** Horizontal line draw instructions. */
      var hlines = [];
      hlines[HLINE_TOP] = [x, y, width, thickness];
      hlines[HLINE_MIDDLE] = [x, y + (height / 2) - thickness / 2, width, thickness];
      hlines[HLINE_BOTTOM] = [x, y + (height - thickness), width, thickness];

      /** Vertical line draw instructions. */
      var vlines = [];
      vlines[VLINE_LEFT_TOP] = [x, y, thickness, Math.ceil(height / 2)];
      vlines[VLINE_LEFT_BOTTOM] = [x, y + height / 2, thickness, height / 2];
      vlines[VLINE_RIGHT_TOP] = [Math.ceil(x + width - thickness), y, thickness, Math.ceil(height / 2)];
      vlines[VLINE_RIGHT_BOTTOM] = [Math.ceil(x + width - thickness), y + height / 2, thickness, height / 2];
      vlines[VLINE_CENTER] = [x + width / 2 - thickness, y, thickness, height];

      /**
       * Draw the given line instructions on the canvas.
       * @param {[]} line A line instruction set to be drawn.
       */
      function drawLine(line) {
        ctx.fillRect(line[0], line[1], line[2], line[3]);
      }

      this.draw = function () {
        if (this.visible) {
          ctx.fillStyle = "white";
          switch (this.value) {
            case 0:
              drawLine(hlines[HLINE_TOP]);
              drawLine(hlines[HLINE_BOTTOM]);
              drawLine(vlines[VLINE_LEFT_TOP]);
              drawLine(vlines[VLINE_LEFT_BOTTOM]);
              drawLine(vlines[VLINE_RIGHT_TOP]);
              drawLine(vlines[VLINE_RIGHT_BOTTOM]);
              break;
            case 1:
              drawLine(vlines[VLINE_RIGHT_TOP]);
              drawLine(vlines[VLINE_RIGHT_BOTTOM]);
              break;
            case 2:
              drawLine(hlines[HLINE_TOP]);
              drawLine(hlines[HLINE_MIDDLE]);
              drawLine(hlines[HLINE_BOTTOM]);
              drawLine(vlines[VLINE_LEFT_BOTTOM]);
              drawLine(vlines[VLINE_RIGHT_TOP]);
              break;
            case 3:
              drawLine(hlines[HLINE_TOP]);
              drawLine(hlines[HLINE_MIDDLE]);
              drawLine(hlines[HLINE_BOTTOM]);
              drawLine(vlines[VLINE_RIGHT_TOP]);
              drawLine(vlines[VLINE_RIGHT_BOTTOM]);
              break;
            case 4:
              drawLine(hlines[HLINE_MIDDLE]);
              drawLine(vlines[VLINE_LEFT_TOP]);
              drawLine(vlines[VLINE_RIGHT_TOP]);
              drawLine(vlines[VLINE_RIGHT_BOTTOM]);
              break;
            case 5:
              drawLine(hlines[HLINE_TOP]);
              drawLine(hlines[HLINE_MIDDLE]);
              drawLine(hlines[HLINE_BOTTOM]);
              drawLine(vlines[VLINE_LEFT_TOP]);
              drawLine(vlines[VLINE_RIGHT_BOTTOM]);
              break;
            case 6:
              drawLine(hlines[HLINE_TOP]);
              drawLine(hlines[HLINE_MIDDLE]);
              drawLine(hlines[HLINE_BOTTOM]);
              drawLine(vlines[VLINE_LEFT_TOP]);
              drawLine(vlines[VLINE_LEFT_BOTTOM]);
              drawLine(vlines[VLINE_RIGHT_BOTTOM]);
              break;
            case 7:
              drawLine(hlines[HLINE_TOP]);
              drawLine(vlines[VLINE_RIGHT_TOP]);
              drawLine(vlines[VLINE_RIGHT_BOTTOM]);
              break;
            case 8:
              drawLine(hlines[HLINE_TOP]);
              drawLine(hlines[HLINE_MIDDLE]);
              drawLine(hlines[HLINE_BOTTOM]);
              drawLine(vlines[VLINE_LEFT_TOP]);
              drawLine(vlines[VLINE_LEFT_BOTTOM]);
              drawLine(vlines[VLINE_RIGHT_TOP]);
              drawLine(vlines[VLINE_RIGHT_BOTTOM]);
              break;
            case 9:
              drawLine(hlines[HLINE_TOP]);
              drawLine(hlines[HLINE_MIDDLE]);
              drawLine(hlines[HLINE_BOTTOM]);
              drawLine(vlines[VLINE_LEFT_TOP]);
              drawLine(vlines[VLINE_RIGHT_TOP]);
              drawLine(vlines[VLINE_RIGHT_BOTTOM]);
              break;
            default:
              break;
          }
        }
      }
    }

    // ========================================================================
    /**
     * A constructor for an individual brick within the court scene.
     * @param {*} x The x-position of the brick.
     * @param {*} y The y-position of the brick.
     * @param {*} width The width of the brick.
     * @param {*} height The height of the brick.
     */
    function Brick(x, y, width, height, fillStyle) {
      Collideable.call(this, x, y, width, height);
      this.fillStyle = fillStyle;
    }

    // ========================================================================
    /**
     * A constructor for the out-of-bounds detector at the bottom of the court.
     * @param {*} x The x-position of the detector.
     * @param {*} y The y-position of the detector.
     * @param {*} width The width of the detector.
     * @param {*} height The height of the detector.
     */
    function OutOfBounds(x, y, width, height) {
      Collideable.call(this, x, y, width, height);
      this.visible = false;
    }

    var leftWall;
    var rightWall;
    var topWall;
    var ball;
    var paddle;
    var playerIndexDigit;
    var playerBallIndexDigit;
    var playerScoreDigits = [[], []];
    var playerBricks = [[[], []], [[], []]];
    var outOfBoundsDetector;

    /** The currently active player as a zero based index (0|1). */
    var activePlayer = 0;
    /** The definition of the current level (0-based) for both players. */
    var playerLevel = [0, 0];
    /** A definition of the current ball index for both players. */
    var playerBallIndex = [1, 1];
    /** The player scores. */
    var playerScores = [0, 0];

    /** A function that is called when the game enters this scene. */
    function enter() {
      // precalculate some relative size definitions.
      var slotWidth = (canvas.width / SLOT_WIDTH_DIVISOR);
      var slotHeight = (canvas.width / SLOT_HEIGHT_DIVISOR);
      var slotHalfWidth = (slotWidth / 2);
      var slotHalfHeight = (slotHeight / 2);
      var digitHeight = (slotHeight * 5);
      var canvasHalfWidth = (canvas.width / 2);
      var canvasHalfHeight = (canvas.height / 2);

      // calculate the amount of spacing we can reserve between the slots.
      // NOTE: spacing is based on the free space after 2 walls and 14 bricks.
      var slotSpacing = (canvas.width - (2 * slotHeight) - (14 * slotWidth)) / 13;

      // build the left, right and top wall for the court.
      leftWall = new Wall(0, 0, slotHeight, canvas.height);
      rightWall = new Wall((canvas.width - slotHeight), 0, slotHeight, canvas.height);
      topWall = new Wall(0, 0, canvas.width, slotHeight);

      // build the ball of the court.
      var x = (canvasHalfWidth - slotHalfHeight);
      var y = (canvasHalfHeight - slotHalfHeight);
      ball = new Ball(x, y, slotHeight, slotHeight);

      // build the paddle for the player.
      var x = (canvasHalfWidth - slotHalfWidth);
      var y = (canvas.height - 100);
      paddle = new Paddle(x, y, slotWidth, slotHeight);

      // build the digit indicating the current player.
      var x = slotHeight;
      var y = slotHeight;
      playerIndexDigit = new Digit(x, y, slotWidth, digitHeight);
      playerIndexDigit.value = (activePlayer + 1);

      // build the digit indicating the current ball index.
      var x = canvasHalfWidth;
      playerBallIndexDigit = new Digit(x, y, slotWidth, digitHeight);
      playerBallIndexDigit.value = playerBallIndex[activePlayer];

      // build the digits used to show the score for the first player.
      x = slotHeight;
      y += digitHeight + slotSpacing;
      playerScoreDigits[0].push(new Digit(x, y, slotWidth, digitHeight));
      x += slotWidth + slotSpacing;
      playerScoreDigits[0].push(new Digit(x, y, slotWidth, digitHeight));
      x += slotWidth + slotSpacing;
      playerScoreDigits[0].push(new Digit(x, y, slotWidth, digitHeight));
      x += slotWidth + slotSpacing;
      playerScoreDigits[0].push(new Digit(x, y, slotWidth, digitHeight));

      // build the digits used to show the score for the second player.
      x = canvasHalfWidth
      playerScoreDigits[1].push(new Digit(x, y, slotWidth, digitHeight));
      x += slotWidth + slotSpacing;
      playerScoreDigits[1].push(new Digit(x, y, slotWidth, digitHeight));
      x += slotWidth + slotSpacing;
      playerScoreDigits[1].push(new Digit(x, y, slotWidth, digitHeight));
      x += slotWidth + slotSpacing;
      playerScoreDigits[1].push(new Digit(x, y, slotWidth, digitHeight));

      // hide hidden score indicators (fourth numbers).
      playerScoreDigits[0][0].visible = false;
      playerScoreDigits[1][0].visible = false;

      // initialize bricks for both players.
      y += digitHeight + slotSpacing;
      for (var i = 0; i < 8; i++) {
        // resolve the color to be used for this row.
        var fillStyle;
        if (i < 2) {
          fillStyle = "red";
        } else if (i < 4) {
          fillStyle = "orange";
        } else if (i < 6) {
          fillStyle = "green";
        } else if (i < 8) {
          fillStyle = "yellow";
        }

        // start placing from the left wall.
        x = slotHeight;

        // create all bricks for both players and for all levels.
        for (var j = 0; j < 14; j++) {
          playerBricks[0][0].push(new Brick(x, y, slotWidth, slotHeight, fillStyle));
          playerBricks[0][1].push(new Brick(x, y, slotWidth, slotHeight, fillStyle));
          playerBricks[1][0].push(new Brick(x, y, slotWidth, slotHeight, fillStyle));
          playerBricks[1][1].push(new Brick(x, y, slotWidth, slotHeight, fillStyle));
          x += slotWidth + slotSpacing;
        }
        y += slotHeight + slotSpacing;
      }

      // create the hidden out-of-bounds detector.
      outOfBoundsDetector = new OutOfBounds(0, canvas.height + slotHeight, canvas.width, 1000);

      // attach a keyboard key press listeners.
      document.addEventListener("keyup", onKeyUp);
      document.addEventListener("keydown", onKeyDown);
    }

    /** A function that is called when the game exists this scene. */
    function exit() {
      document.removeEventListener("keyup", onKeyUp);
      document.removeEventListener("keydown", onKeyDown);
    }

    /** A function that is called when a keyboard key is released. */
    function onKeyUp(event) {
      var key = event.keyCode ? event.keyCode : event.which;
      switch (key) {
        case KEY_LEFT:
          if (paddle.direction[0] == -1.0) {
            paddle.direction = [0.0, 0.0];
          }
          break;
        case KEY_RIGHT:
          if (paddle.direction[0] == 1.0) {
            paddle.direction = [0.0, 0.0];
          }
          break;
      }
    }

    /** A function that is called when a keyboard key is pressed. */
    function onKeyDown(event) {
      var key = event.keyCode ? event.keyCode : event.which;
      switch (key) {
        case KEY_LEFT:
          paddle.direction = [-1.0, 0.0];
          break;
        case KEY_RIGHT:
          paddle.direction = [1.0, 0.0]
          break;
      }
    }

    /** A function that is called on each main loop iteration. */
    function update(dt) {
      paddle.update(dt);
      ball.update(dt);
    }

    /** A funcion that is called on each rendering frame iteration. */
    function draw() {
      topWall.draw();
      ball.draw();
      paddle.draw();
      playerIndexDigit.draw();
      playerBallIndexDigit.draw();

      // draw the currently act
      for (var i = 0; i < 112; i++) {
        playerBricks[activePlayer][playerLevel[activePlayer]][i].draw();
      }

      playerScoreDigits[0][0].draw();
      playerScoreDigits[0][1].draw();
      playerScoreDigits[0][2].draw();
      playerScoreDigits[0][3].draw();

      playerScoreDigits[1][0].draw();
      playerScoreDigits[1][1].draw();
      playerScoreDigits[1][2].draw();
      playerScoreDigits[1][3].draw();

      leftWall.draw();
      rightWall.draw();
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
  function run(tickTime) {
    // calculate delta time and store current tick time.
    var dt = (tickTime - prevTickTime);
    prevTickTime = tickTime;

    // update and draw the scene only when we have reasonable delta.
    if (dt < 100) {
      deltaAccumulator += dt;
      while (deltaAccumulator >= FPS) {
        scene.update(FPS);
        deltaAccumulator -= FPS;
      }

      // swipe old contents from the draw buffer and draw the scene.
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      scene.draw();
    }

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
