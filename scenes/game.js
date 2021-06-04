kaboom({
    global: true,
    fullscreen: false,
    scale: 1.5,
    debug: true,
    clearColor: [0,0,0,1]
  })

  loadRoot('sprites/')
  loadSprite('coin', 'coin.png')
  loadSprite('evil-shroom-one', 'evil-shroom-1.png')
  loadSprite('evil-shroom-two', 'evil-shroom-1.png')
  loadSprite('brick', 'brick.png')
  loadSprite('block', 'block.png')
  loadSprite('standing-mario', 'mario-standing.png')
  loadSprite('mushroom', 'mushroom.png')
  loadSprite('surprise', 'blue-surprise.png')
  loadSprite('unboxed', 'unboxed.png')
  loadSprite('pipe-top-left', 'pipe-top-left-side.png')
  loadSprite('pipe-top-right', 'pipe-top-right-side.png')
  loadSprite('pipe-left', 'pipe-left.png')
  loadSprite('pipe-right', 'pipe-right.png')

  loadSprite('blue-block', 'blue-block.png')
  loadSprite('blue-brick', 'blue-brick.png')
  loadSprite('blue-steel', 'blue-steel.png')
  loadSprite('blue-evil-shroom', 'blue-evil-shroom.png')
  loadSprite('blue-surprise', 'blue-surprise.png')

  loadRoot('sounds/')
  loadSound("deadSound", "deadMario.wav");
  loadSound("powerOff", "smb_pipe.wav");
  loadSound("gameOver", "smb_gameover.wav");
  loadSound("coin", "smb_coin.wav");
  loadSound("powerUp", "smb_powerup.wav");
  loadSound("powerUpAppears", "smb_powerup_appears.wav");
  loadSound("jumpSmall", "smb_jump-small.wav");
  loadSound("jumpSuper", "smb_jump-super.wav");
  loadSound("stageClear", "smb_stage_clear.wav");



  scene('game', ({ level, score, name }) => {
  const JUMP_FORCE = 360
  const BIG_JUMP_FORCE = 550
  let CURRENT_JUMP_FORCE = JUMP_FORCE
  const MOVE_SPEED = 120
  const FALL_DEATH = 640
  const ENEMY_SPEED = 20
  let isJumping = false

  const PLAYER_NAME = name;

  // draw background on the bottom, ui on top, layer "obj" is default
  layers(['bg', 'obj', 'ui'], 'obj')

  const maps = [
      [
          '                                                ',
          '                                                ',
          '                                                ',
          '             %                                  ',
          '                                                ',
          '                                                ',
          '                                                ',
          '                                                ',
          '    %      =*=%=                                ',
          '                                                ',
          '                                  -+            ',
          '                       ^      ^   ()            ',
          '=====================================    =======',
        ],
    [
      '£                                                £',
      '£                                                £',
      '£                                                £',
      '£                                                £',
      '£                                                £',
      '£                                                £',
      '£                                                £',
      '£                                                £',
      '£                              x x               £',
      '£          @@@@@             x x x x             £',
      '£                          x x x x x  x       -+ £',
      '£              z z       x x x x x x  x       () £',
      '£!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!£',
    ],
  ];

  const levelCfg = {
    width: 20,
    height: 20,
          // define each object as a list of components
          '=': [sprite('block'), solid()],
          '$': [sprite('coin'), 'coin'],
          '%': [sprite('surprise'), scale(0.5),solid(), 'coin-surprise'],
          '*': [sprite('surprise'), scale(0.5),solid(), 'mushroom-surprise'],
          '}': [sprite('unboxed'), solid()],
          ')': [sprite('pipe-right'), scale(0.5), solid()],
          '(': [sprite('pipe-left'), scale(0.5), solid()],
          '-': [sprite('pipe-top-left'), scale(0.5), solid(), 'pipe'],
          '+': [sprite('pipe-top-right'), scale(0.5), solid(), 'pipe'],
          '^': [
            sprite('evil-shroom-one'),
            solid(),
            //tags as strings
            'dangerous',
          ],
    '#': [sprite('mushroom'), body(), 'mushroom'],
    '!': [sprite('blue-block'), scale(0.5), solid()],
    '£': [sprite('blue-brick'), scale(0.5), solid()],
    'z': [sprite('blue-evil-shroom'), scale(0.5), 'dangerous'],
    '@': [sprite('blue-surprise'), scale(0.5), solid(), 'coin-surprise'],
    'x': [sprite('blue-steel'), scale(0.5), solid()],

  };

  const gameLevel = addLevel(maps[level], levelCfg);

  const scoreLabel = add([
    text(score),
    pos(30, 6),
    layer('ui'),
    {
      value: score,
    },
  ])

  const nameLabel = add([
    text(PLAYER_NAME),
    pos(100, 6),
    layer('ui'),
    {
      value: PLAYER_NAME,
    },
  ])


    add([text('level ' + parseInt(level+ 1)), pos(40, 6)])


    function big() {
      let timer = 0
      let isBig = false
      return {
        update() {
          if (isBig) {
            CURRENT_JUMP_FORCE = BIG_JUMP_FORCE
            timer -= dt()
            if (timer <= 0) {
              this.smallify()
            }
          }
        },
        isBig() {
          return isBig
        },
        smallify() {
          this.scale = vec2(1)
          CURRENT_JUMP_FORCE = JUMP_FORCE
          timer = 0
          isBig = false
          play("powerOff")
        },
        biggify(time) {
          this.scale = vec2(2)
          timer = time
          isBig = true
          play("powerUp")
        },
      }
    }

    const player = add([
      sprite('standing-mario'),
      //give it position to apply gravity
      pos(30, 0),
      //makes it fall with gravity
      body(),
      big(),
      origin("bot"),
    ])

    action('mushroom', (m) => {
      m.move(10, 0)
    })

    // grow an mushroom or flower if player's head bumps into an obj with "surprise" tag
    player.on('headbump', (obj) => {
      if (obj.is('coin-surprise')) {
        gameLevel.spawn('$', obj.gridPos.sub(0, 1)),
        destroy(obj)
        gameLevel.spawn('}', obj.gridPos.sub(0, 0))
      }
      if (obj.is('mushroom-surprise')) {
        gameLevel.spawn('#', obj.gridPos.sub(0, 1))
        destroy(obj)
        gameLevel.spawn('}', obj.gridPos.sub(0, 0))
      }
    })

    // player grows big collides with an "mushroom" obj
    player.collides('mushroom', (m) => {
      destroy(m)
      // as we defined in the big() component
      player.biggify(6)
    })

    // increase score if meets coin
    player.collides('coin', (c) => {
      destroy(c)
      play("coin");
      scoreLabel.value++
      scoreLabel.text = scoreLabel.value
    })

    player.collides('dangerous', (d) => {
      if (isJumping) {
        destroy(d)
      } else {
        localStorage.setItem(PLAYER_NAME, score);
        go('lose', { score: scoreLabel.value })
      }
    })

    action('dangerous', (m) => {
      m.move(-ENEMY_SPEED, 0)
    })

    // action() runs every frame
    player.action(() => {
      // center camera to player
      camPos(player.pos)
      // check fall death
      if (player.pos.y >= FALL_DEATH) {
        localStorage.setItem(PLAYER_NAME, score);
    
        go('lose', { score: scoreLabel.value })
      }
    })

    player.action(() => {
      if (player.grounded()) {
        isJumping = false
      }
    })

    player.collides('pipe', () => {
      keyPress('down', () => {
        play("stageClear");
        go("game", {
          level: (level + 1) % maps.length,
          score: scoreLabel.value,
          name: PLAYER_NAME,
        })
      })
    })

    // jump with space
    keyPress('space', () => {
      if (player.grounded()) {
        isJumping = true
        if(player.isBig()){
          play("jumpSuper");
        } else {
          play("jumpSmall");
        }
        player.jump(CURRENT_JUMP_FORCE )
      }
    })

    keyDown('left', () => {
      player.move(-MOVE_SPEED, 0)
    })

    keyDown('right', () => {
      player.move(MOVE_SPEED, 0)
    })

  });

scene('lose', ({ score }) => {
  add([text(score, 32), origin('center'), pos(width() / 2, height() / 2 - 32)])
  add([text("Press enter", 32), origin('center'), pos(width() / 2, height() / 2)])
  add([text("to play again !!", 32), origin('center'), pos(width() / 2, height() / 2 + 32)])

  play("deadSound")


	keyPressRep("enter", () => {
    go("menu", {})
	});

})


scene('menu', () => {
  add([text("Fill up your name", 32), origin('center'), pos(width() / 2, height() / 2 - 32)])
  add([text("and press enter!", 32), origin('center'), pos(width() / 2, height() / 2 )])

  const input = add([
		text("Your name", 24, {
			width: width(),
		}),      
    origin('center'), 
    pos(width() / 2, 
    height() / 2 + 32)
	]);

	charInput((ch) => {
		input.text += ch;
	});

	keyPressRep("enter", () => {
    go("game", {level: 0, score: 0, name: input.text})
	});

	keyPressRep("backspace", () => {
		input.text = input.text.substring(0, input.text.length - 1);
	});

})


start("menu", { level: 0, score: 0, });
