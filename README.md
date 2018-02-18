# html5-breakout
A HTML5 implementation of the classic Breakout game.

Contains game modes for a one and two player games.

The game is playable in the URL: https://toivjon.github.io/html5-breakout/

## Scenes
Game is split into following scenes:
1. A welcome scene, which contains the main menu.
2. A court scene, which contains the actual gameplay.

The implementation only contains the following scene transition:
* 1 to 2, when the game is started by selecting the number of players.

## Features
This Breakout implementation contains the following features.
* A support for a one or two player (turn-based) games.
* Each player has three balls.
* Each round lasts until the ball reaches the bottom of the screen or until the court's last brick is being destroyed.
* The game ends after the last ball is missed.
* The end of the game starts the ending animation.
* The color of the destroyed brick (yellow, green, orange and red) defines the amount of points the player receives.
* Ball movement speed increases after the first hit with any orange brick.
* Ball movement speed increases after the first hit with any red brick.
* Ball movement speed increases after the first four hits with the paddle or walls.
* Ball movement speed increases after the first 12 hits with the paddle or walls.
* Active player score digits are blinked after the player receives points.
* Active player index is blinked if the player index is being changed (in two player games only).
* Supports the hidden extra level like the one in the original game. See game.js comment lines 347-353 for more details.

## Screenshots
![alt text](https://github.com/toivjon/html5-breakout/blob/master/Screenshots/welcome-scene.png "WelcomeScene")
![alt text](https://github.com/toivjon/html5-breakout/blob/master/Screenshots/court-scene.png "CourtScene")