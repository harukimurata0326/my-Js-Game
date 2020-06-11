/**
 * 描画対象となる CanvasElement
 * @type {HTMLCanvasElement}
 */
let can = document.body.querySelector('#can');
/**
 * Canvas2D API のコンテキスト
 * @type {CanvasRenderingContext2D}
 */
let con = can.getContext('2d');
/**
 * 描画対象となる仮想画面の CanvasElement
 * @type {HTMLCanvasElement}
 */
let vcan = document.createElement('canvas');
/**
 * 仮想画面の Canvas2D API のコンテキスト
 */
let vcon = vcan.getContext('2d');
/**
 * キャラクターの画像のインスタンス
 * @type {Image}
 */
let chImg = new Image();
/**
 * フレーム数
 * @type {number}
 */
let frameCount = 0;
/**
 * 描画されてからの時間を格納する
 * @type {number}
 */
let startTime = null;
/**
 * 拡大倍率
 * @type {number}
 */
let magnification = 1;
/**
 * 表示されているキャラクターの X 座標情報
 * @type {number}
 */
let operatedCh_x = 100<<5;
/**
 * 表示されているキャラクターの Y 座標情報
 * @type {number}
 */
let operatedCh_y = 0;
/**
 * オブジェクトが X 軸方向に移動する際の加速度
 * @type {number}
 */
let accelarationX = 0;
/**
 * オブジェクトが Y 軸方向に移動する際の加速度
 * @type {number}
 */
let accelarationY = 0;
/**
 * スプライト画像の中で表示したいエリアの番号
 * @type {number}
 */
let cha_sprite = 0;
/**
 * アニメーションの進行度
 * @type {number}
 */
let animationCount = 0;
/**
 * キャラクターが現在行っているアニメーション
 * @type {string}
 */
let chaAnimation = 'standing';
/**
 * キャラクターが向いている方向
 * @type {string}
 */
let chaDirection = 'right';
/**
 * 操作しているキャラクター画像の幅
 * @type {number}
 */
let chaImgWidth = 0;
/**
 * 操作しているキャラクター画像の高さ
 * @type {number}
 */
let chaImgHeight = 0;
/**
 * キャラクターがジャンプしているかどうかのフラグ
 * @type {boolean}
 */
let chaJump = false;
/**
 * ジャンプしてから経過したフレーム数
 * @type {number}
 */
let jumpFrameCount = 0;
/**
 * 着地してから経過したフレーム数
 * @type {number}
 */
let landFrameCount = 0;
/**
 * 地面の Y 座標
 * @type {number}
 */
let groundPosition = 500;
/**
 * ひとつ前のフレームのキャラクター画像の高さ
 */
let previousFrameImgHeight = 0;
/**
 * ジャンプボタンが長押しされているフレーム数
 */
let jumpBtnCount = 0;
/**
 * canvas の幅
 * @type {number}
 */
const CANVAS_WIDTH = 800;
/**
 * canvas の高さ
 * @type {number}
 */
const CANVAS_HEIGHT = 600;
/**
 * モニターの FPS
 * @type {number}
 */
const GAME_FPS = 1000 / 60;
/**
 * 重力の値
 * @type {number}
 */
const GRAVITY = 16;

/**
 * キーの押下状態を調べるためのオブジェクト
 * @global
 * @type {object}
 */
window.keyb = {};

// 仮想画面の canvas の高さと幅を設定する
vcan.width = CANVAS_WIDTH;
vcan.height = CANVAS_HEIGHT;

// 実画面の canvas の高さと幅を設定する
can.width = CANVAS_WIDTH * magnification;
can.height = CANVAS_HEIGHT * magnification;

// 仮想画面を実画面に描画する際に、
// 拡大によって画像がぼやけるのを防ぐ
vcon.mozImageSmoothingEnabled    = false;
vcon.msimageSmoothingEnabled     = false;
vcon.webkitimageSmoothingEnabled = false;
vcon.imageSmoothingEnabled       = false;

// キャラクターの画像の src パスを指定する
chImg.src = '../images/character/sprites_sheets/sprite.png';
// キャラクターの画像がロード完了した時に draw 関数を発火する
// chImg.onload = draw;

  // 表示されている操作キャラクターに応じて
  // キャラクター画像の高さの初期値を設定する
  // previousFrameImgHeight の初期値を chaImgHeight の初期値と
  // 同じものを設定する
  chaImgHeight = 128;
  previousFrameImgHeight = 128;

  // キャラクターを表示する Y 座標の初期値を設定する
  operatedCh_y = ( groundPosition  - previousFrameImgHeight ) << 5;

/**
 * 更新処理のための関数
 */
function update() {
  // 前のフレームの chaImgHeight を変数に代入する
  previousFrameImgHeight = chaImgHeight;
  // 重力を加味する
  if( accelarationY < 320 ) {
    accelarationY += GRAVITY;
  }
  if( jumpFrameCount == 8 ) {
  // 上方向に加速する
  accelarationY = - 220;
  }
  // 大ジャンプにするために必要なカウント
  if( jumpBtnCount ) {
    jumpBtnCount++;
  }
  // 床にぶつかるようにする
  // 着地してから 8f 後にジャンプフラグを false にし、
  // jumpBtnCount をリセット、キャラクターのアニメーションを
  // 'walking' に変更する
  if( operatedCh_y >= (groundPosition - chaImgHeight) << 5 ) {
    if( chaAnimation = 'jumping' ) {
      // 着地してからのフレーム数を数える
      landFrameCount++;
      if( landFrameCount > 7 ) {
        chaJump = false;
        jumpBtnCount = 0;
        chaAnimation = 'walking';
      }
    }
    // 床の高さに到達した時に加速を 0 にする
    accelarationY = 0;
    // 床の高さよりも下に行ってしまった場合に
    // キャラの Y 座標を床の高さに戻す
    operatedCh_y = ( groundPosition - chaImgHeight ) << 5;
  }
  if( keyb.Space ) {
    // まだジャンプしていない状態ならばジャンプするようにする
    if( !chaJump ) {
      chaJump = true;
      chaAnimation = 'jumping';
      // ジャンプ開始時に、ジャンプしてからのフレーム数カウントと
      // 着地してからのフレーム数カウントをリセットする
      jumpFrameCount = 0;
      landFrameCount = 0;
      // ジャンプボタンを長押ししているフレーム数をカウントする
      jumpBtnCount = 1
    }
    // 大ジャンプ
    if( jumpBtnCount < 15 ) {
      accelarationY = - (280 - jumpBtnCount);
    }
  } else if( keyb.Left && keyb.Shift ) {
    // 左に走っているアニメーションにおける加速度などを設定する
    // キャラクターのアニメーション名
    // と進行方向を設定する
    if( !chaJump ) {
      // ジャンプしていない状態なら他のアニメーションができるようにする
      chaAnimation = 'running';
      // ジャンプしている間は方向転換できない
      chaDirection = 'left';
    }
    // 加速の上限を設定する
    if( accelarationX > -192 ) {
      accelarationX -= 6;
    }
    if( accelarationX > 0 ) {
      accelarationX -= 6;
    }
  } else if( keyb.Right && keyb.Shift ) {
    // 右に走っているアニメーションにおける加速度などを設定する
    if( !chaJump ) {
      // ジャンプしていない状態なら他のアニメーションができるようにする
      chaAnimation = 'running';
      // ジャンプしている間は方向転換できない
      chaDirection = 'right';
    }
    if( accelarationX < 192 ) {
      accelarationX += 6;
    }
    if( accelarationX < 0 ) {
      accelarationX += 6;
    }
  } else if( keyb.Left ) {
    // 左に歩いているアニメーションにおける加速度などを設定する
    // キャラクターのアニメーション名
    // と進行方向を設定する
    if( !chaJump ) {
      // ジャンプしていない状態なら他のアニメーションができるようにする
      chaAnimation = 'walking';
      // ジャンプしている間は方向転換できない
      chaDirection = 'left';
    }
    // 加速の上限を設定する
    if( accelarationX <= -96 ) {
      accelarationX += 6;
    }
    if( accelarationX > -96 ) {
    accelarationX -= 3;
    }
    // 進行方向とは逆（右側）に加速度が生じている場合に
    // 加速度が 0 になるまで進行方向への加速度を増やす
    if( accelarationX > 0 ) {
      accelarationX -= 3;
    }
  } else if( keyb.Right ) {
    // 右に歩いているアニメーションにおける加速度などを設定する
    if( !chaJump ) {
      // ジャンプしていない状態なら他のアニメーションができるようにする
      chaAnimation = 'walking';
      // ジャンプしている間は方向転換できない
      chaDirection = 'right';
    }
    // 加速度が歩きアニメーションの上限を超えていた場合
    // その上限まで加速度を下げる
    if( accelarationX >= 96) {
      accelarationX -= 6;
    }
    if( accelarationX < 96 ) {
      accelarationX += 3;
    }
    if( accelarationX < 0 ) {
      accelarationX += 3;
    }
  } else {
    if( !chaJump ) {
      // 移動キーが押されていないとき
      // 加速度を 0 に近づける
      if( accelarationX > 0 ) {
        // 加速度が一定よりも高い場合は減速を強める
        if( accelarationX > 96 ) {
          accelarationX -= 12;
        }
        accelarationX -= 6;
        if( accelarationX < 0 ) {
          accelarationX = 0;
        }
      }
      if( accelarationX < 0 ) {
        if( accelarationX < -96 ) {
          accelarationX += 12;
        }
        accelarationX += 6;
        if( accelarationX > 0 ) {
          accelarationX = 0;
        }
      }
      if( accelarationX == 0 && accelarationY == 0
          && operatedCh_y == ( groundPosition - chaImgHeight ) << 5
        ) {
        // 加速度が 0 になったとき、立ち状態にする
        chaAnimation = 'standing';
      }
    }

  }
  animationCount++;
  // キャラクターの状態の応じて画像の大きさやスプライト番号を変える
  if( chaAnimation == 'jumping' ) {
    // ジャンプのアニメーション中に、ジャンプしてからのフレーム数カウントを1ずつ増やす
    jumpFrameCount++;
    // ジャンプしてからのフレーム数に応じて使用するスプライト画像と
    // その画像の高さ、幅を設定する
    if( jumpFrameCount < 4 ) {
      cha_sprite = 84;
      chaImgHeight = 96;
      chaImgWidth = 84;
    } else if ( jumpFrameCount < 8 ) {
      cha_sprite = 86;
      chaImgHeight = 91;
      chaImgWidth = 90;
    } else if ( jumpFrameCount < 12 ) {
      cha_sprite = 88;
      chaImgHeight = 141;
      chaImgWidth = 66;
    } else if ( jumpFrameCount > 11 ) {
      // 着地した後のキャラ画像を表示する
      if( landFrameCount > 0 ) {
        cha_sprite = 94;
        chaImgHeight = 107;
        chaImgWidth = 79;
        console.log('landFrameCount: ' + landFrameCount);
      } else if ( accelarationY <= 0 ) {
        cha_sprite = 90;
        chaImgHeight = 175;
        chaImgWidth = 60;
      } else if ( accelarationY > 0 ) {
        cha_sprite = 92;
        chaImgHeight = 158;
        chaImgWidth = 60;
      }
    }
    if( chaDirection == 'left' ) {
      cha_sprite += 42;
    }
  } else if( chaAnimation == 'standing' ) {
    chaImgWidth = 64;
    chaImgHeight = 128;
    cha_sprite = 0;
    if (chaDirection == 'left') {
      cha_sprite += 7;
    }
  } else if ( chaAnimation == 'walking' ) {
    chaImgWidth = 64;
    chaImgHeight = 128;
    // 8 フレームごとに表示する画像を変更する
    cha_sprite = 1 + (Math.floor(animationCount / 8)) % 6;
    if (chaDirection == 'left') {
      cha_sprite += 7;
    }
  } else if( chaAnimation == 'running' ) {
    chaImgWidth = 128;
    chaImgHeight = 128;
    cha_sprite = 28 + (Math.floor((animationCount / 8)) % 6) * 2;
    if( chaDirection == 'left' ) {
      cha_sprite += 28;
    }
  }
  // 加速度の分 X・Y 座標を増減させる
  operatedCh_x += accelarationX;
  // キャラクターの画像を足元の Y 座標を基準に表示する
  operatedCh_y += accelarationY + ( ( previousFrameImgHeight - chaImgHeight ) << 5 );
}

/**
 * スプライト画像からキャラクター等を表示する
 * @param {number} spriteNum - スプライト画像の番号
 * @param {*} x - キャラクターを表示する X 座標
 * @param {*} y - キャラクターを表示する Y 座標
 */
function drawSprite(spriteNum, x, y) {
  let sx = (spriteNum % 14) * 64;
  let sy = Math.floor(spriteNum / 14) * 64;
  vcon.drawImage(chImg, sx, sy, chaImgWidth, chaImgHeight,
    x - chaImgWidth / 2, y,
    chaImgWidth, chaImgHeight);
}

/**
 * canvas 描画処理を行う
 */
function render() {
  // 背景の描画を行う
  vcon.fillStyle = "#6af";
  vcon.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  // キャラクターの描画を行う
  drawSprite(cha_sprite, operatedCh_x >> 5, operatedCh_y >> 5);
  // デバッグ情報を表示
  vcon.font = "20px 'Impact";
  vcon.fillStyle = "#fff";
  vcon.fillText("FRAME:"+frameCount, 10, 20);

  // 仮想画面(vcan)に描画したものを実画面(can)に拡大転送する
  con.drawImage(
    vcan, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT,
    0, 0, CANVAS_WIDTH * magnification, CANVAS_HEIGHT * magnification
  );
}

/**
 * window のロードが完了したらメインループを開始する
 */
window.onload = function() {
  // 処理開始時の時間を格納する
  startTime = performance.now();
  // メインループ開始
  mainLoop();
}

/**
 * メインループを行う
 */
function mainLoop() {
  // 現在の時間を変数に設定する
  let nowTime = performance.now();
  // ループが始動してから経過した時間を変数に設定する
  let nowFrame = (nowTime - startTime) / GAME_FPS;
  // FPS が 60（GAME_FPS） 以上にならないようにする
  if(nowFrame > frameCount) {
    // ループの度に frameCount を１増やす
    frameCount++;
    // 更新処理
    update();
    // 描画処理
    render();
  }
  // 1 秒間に 60 回メインループ処理を行う
  // モニターによっては1秒間で60回以上処理される場合がある
  requestAnimationFrame(mainLoop);
}

// キーボードが押下されたときに呼ばれる
document.onkeydown = function(e) {
  // キーが押下された時に keyb オブジェクトにキーと値を追加する
  if( e.keyCode == 39 || e.keyCode == 68 ) {
    keyb.Right = true;
  }
  if( e.keyCode == 37 || e.keyCode == 65 ) {
    keyb.Left = true;
  }
  if( e.keyCode == 16 ) {
    keyb.Shift = true;
  }
  if( e.keyCode == 32 ) {
    keyb.Space = true;
  }
}

// キーボードが離されたときに呼ばれる
document.onkeyup = function(e) {
  if( e.keyCode == 39 || e.keyCode == 68 ) {
    keyb.Right = false;
  }
  if( e.keyCode == 37 || e.keyCode == 65 ) {
    keyb.Left = false;
  }
  if( e.keyCode == 16 ) {
    keyb.Shift = false;
  }
  if( e.keyCode == 32 ) {
    keyb.Space = false;
  }
}
