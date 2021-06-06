//Inicialization of kaboom library
kaboom({
    global: true,
    fullscreen: true,
    scale: 1.5,
    debug: true,
    clearColor: [0,0,0,1]
  })
//loading sprites
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

  //loading sounds
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


//setting up a game scene
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
          '                                              -+  ',
          '                                              ()  ',
          '                                     ==     = ==  ',
          '             %                       =            ',
          '                                   ===            ',
          '                         =    =                   ',
          '                     =                            ',
          '    %       =                                     ',
          '                                                  ',
          '      =                  =*=%=                    ',
          '           =                                      ',
          '?                 ^   ^     ^      ^ ?           =',
          '======================================          ==',
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
      '£!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! !!!!!!!!!!!!!!!!£',
    ],
  ];

  const levelCfg = {
    width: 20,
    height: 20,
    // define each objects
    '=': [sprite('block'), solid()],
    '?': [sprite('block'), solid(), 'bricks'],
    '$': [sprite('coin'), 'coin'],
    '%': [sprite('surprise'), scale(0.5),solid(), 'coin-surprise'],
    '*': [sprite('surprise'), scale(0.5),solid(), 'mushroom-surprise'],
    '}': [sprite('unboxed'), solid()],
    ')': [sprite('pipe-right'), scale(0.5), solid()],
    '(': [sprite('pipe-left'), scale(0.5), solid()],
    '-': [sprite('pipe-top-left'), scale(0.5), solid(), 'pipe', 'bricks'],
    '+': [sprite('pipe-top-right'), scale(0.5), solid(), 'pipe', 'bricks'],
    '^': [sprite('evil-shroom-one'),solid(), body(), 'dangerous', { direction: true}],
    '#': [sprite('mushroom'), body(), 'mushroom'],
    '!': [sprite('blue-block'), scale(0.5), solid()],
    '£': [sprite('blue-brick'), scale(0.5), solid(), 'bricks'],
    'z': [sprite('blue-evil-shroom'), scale(0.5),body(),solid(), 'dangerous',{ direction: true}],
    '@': [sprite('blue-surprise'), scale(0.5), solid(), 'coin-surprise'],
    'x': [sprite('blue-steel'), scale(0.5), solid(),'bricks'],

  };

  //Defining game level
  const gameLevel = addLevel(maps[level], levelCfg);

  //Defining labels and adding them into ui layer.
  const scoreLabel = add([
    text("Score: " + score),
    pos(30, 15),
    layer('ui'),
    {
      value: score,
    },
  ])

  const nameLabel = add([
    text("Name: " + PLAYER_NAME),
    pos(30, 24),
    layer('ui'),
    {
      value: PLAYER_NAME,
    },
  ])


    add(
    [text("Level: " + parseInt(level+ 1)), 
    pos(30, 6)],
    layer('ui'),

    )

//Function that deals with powerUps and holds Mario state
    function big() {
      let timer = 0
      let isBig = false
      return {
        //updating power up
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
        //reduce size of mario
        smallify() {
          this.scale = vec2(1)
          CURRENT_JUMP_FORCE = JUMP_FORCE
          timer = 0
          isBig = false
          play("powerOff")
        },
        //increase size of mario
        biggify(time) {
          this.scale = vec2(2)
          timer = time
          isBig = true
          play("powerUp")
        },
      }
    }

    //defining player
    const player = add([
      sprite('standing-mario'),
      pos(30, 0),
      body(),
      big(),
      origin("bot"),
    ])

    //Moving with mushroom object
    action('mushroom', (m) => {
      m.move(10, 0);
    })

    // grow an mushroom or flower if player head bumps into an obj with "surprise" tag
    player.on('headbump', (obj) => {
      if (obj.is('coin-surprise')) {
        gameLevel.spawn('$', obj.gridPos.sub(0, 1));
        destroy(obj);
        gameLevel.spawn('}', obj.gridPos.sub(0, 0));
      }
      if (obj.is('mushroom-surprise')) {
        gameLevel.spawn('#', obj.gridPos.sub(0, 1));
        destroy(obj);
        gameLevel.spawn('}', obj.gridPos.sub(0, 0));
      }
    })

    // player increase size if he collides with an "mushroom" obj
    player.collides('mushroom', (m) => {
      destroy(m);
      player.biggify(6);
    })

    // increase score if colides with coin
    player.collides('coin', (c) => {
      destroy(c);
      play("coin");
      scoreLabel.value++;
      scoreLabel.text = "Score: " + scoreLabel.value;
    })


    //if player jumps on enemy, enemy will die
    player.collides('dangerous', (d) => {
      if (isJumping) {
        destroy(d);
      } else {
        go('lose', { score: scoreLabel.value, name: nameLabel.value });
      }
    })

    //moving with enemies
    action('dangerous', (m) => {
      if(m.direction) {
        m.move(-ENEMY_SPEED, 0)
      } else {
        m.move(ENEMY_SPEED, 0)
      }  
      })

      //If enemy collides with  bricks or with another enemy, he will change his direction
      collides ('dangerous','bricks',(m,b) => {
        if(m.direction) {
          m.direction = false;
        } else {
          m.direction = true;

        }
      })

      collides ('dangerous','dangerous',(m,d) => {
        temp = d.direction;
        d.direction = m.direction;
        m.direction = temp;
  
      })

      //player actions
    player.action(() => {
      // center camera to player
      camPos(player.pos);
      // check fall death
      if (player.pos.y >= FALL_DEATH) {
        go('lose', { score: scoreLabel.value, name: nameLabel.value });
      }
    })
    //checking if we can jump
    player.action(() => {
      if (player.grounded()) {
        isJumping = false;
      }
    })
  //if player collide with pipe he can go to another level
    player.collides('pipe', () => {
      keyPress('down', () => {
        play("stageClear");
        go("game", {
          level: (level + 1) % maps.length,
          score: scoreLabel.value,
          name: PLAYER_NAME,
        });
      })
    })

    // jump, moving with arrows
    keyPress('up', () => {
      if (player.grounded()) {
        isJumping = true;
        if(player.isBig()){
          play("jumpSuper");
        } else {
          play("jumpSmall");
        }
        player.jump(CURRENT_JUMP_FORCE );
      }
    })

    keyDown('left', () => {
      player.move(-MOVE_SPEED, 0)
    })

    keyDown('right', () => {
      player.move(MOVE_SPEED, 0)
    })

  });

  //lose scene
scene('lose', ({ score , name}) => {
  //checking if player beated high score if so it will be stored in LocalStorage
  var highScore =  localStorage.getItem('highScore');
  if(highScore < score) {
    localStorage.setItem('highScore', score);
    localStorage.setItem('nameofPlayer', name);
  }    
  //adding text into canvas
  add([text("Your score: "+ score, 32), origin('center'), pos(width() / 2, height() / 2 - 58)])
  add([text("Press enter", 32), origin('center'), pos(width() / 2, height() / 2 - 25)])
  add([text("to play again !!", 32), origin('center'), pos(width() / 2, height() / 2 + 5)])
  add([text("High Score: ", 32), origin('center'), pos(width() / 2, 32)])
  add([text(localStorage.getItem('nameofPlayer') + " with " + localStorage.getItem('highScore') + " points.", 32), origin('center'), pos(width() / 2, 70)])
  
  play("deadSound")
	
  //if player presses enter we will return on menu screen
  keyPressRep("enter", () => {
    go("menu", {})
	});

})


//menu scene
scene('menu', () => {
  //adding text to canvas
  add([text("Fill up your name", 32), origin('center'), pos(width() / 2, height() / 2 - 32)])
  add([text("and press enter!", 32), origin('center'), pos(width() / 2, height() / 2 )])

  //creating input cons and adding it to canvas
  const input = add([
		text("your name", 24, {
			width: width(),
		}),      
    origin('center'), 
    pos(width() / 2, 
    height() / 2 + 32)
	]);

  //adding chars pressed to input
	charInput((ch) => {
		input.text += ch;
	});

  //if we press enter the game will start
	keyPressRep("enter", () => {
    go("game", {level: 0, score: 0, name: input.text})
	});

    //if we press backspace it will delete one char
	keyPressRep("backspace", () => {
		input.text = input.text.substring(0, input.text.length - 1);
	});

})

//game is starting on menu scene
start("menu", { level: 0, score: 0, });
