/**
 * 座標を管理するためのクラス
 */
class Position {
  /**
   * @constructor
   * @param {number} x - X 座標
   * @param {number} y - Y 座標
   */
  constructor (x, y) {
    /**
     * X 座標
     * @type {number}
     */
    this.x = x;
    /**
     * Y 座標
     * @type {number}
     */
    this.y = y;
  }

  /**
   * 値を設定する
   * @param {number} [x] - 設定する X 座標
   * @param {number} [y] - 設定する Y 座標
   */
  set (x, y) {
    if (x != null) {
      this.x = x;
    }
    if (y != null) {
      this.y = y;
    }
  }
}

/**
 * キャラクター管理のための基幹クラス
 */
class Character {
  /**
   * @constructor
   * @param {CanvasRenderingContext2D} vctx - 描画などに利用する2Dコンテキスト(仮想画面)
   * @param {number} x - X 座標
   * @param {number} y - Y 座標 (groundPosition - h を初期値とする)
   * @param {number} w - 幅
   * @param {number} h - 高さ
   * @param {number} life - キャラクターのライフ (生存フラグを兼ねる)
   * @param {number} groundPosition - 地面の Y 座標
   * @param {string} imagePath - キャラクター用の画像のパス
   */
  constructor (vctx, x, y, w, h, life, groundPosition, imagePath) {
    /**
     * @type {CanvasRenderingContext2D}
     */
    this.vctx = vctx;
    /**
     * @type {Position}
     */
    this.position = new Position(x << 5, y << 5);
    /**
     * @type {Position}
     */
    this.vector = new Position(1.0, 0.0);
    /**
     * @type {number}
     */
    this.angle = 0 * Math.PI / 180;
    /**
     * @type {number}
     */
    this.w = w;
    /**
     * @type {number}
     */
    this.h = h;
    /**
     * @type {number}
     */
    this.life = life;
    /**
     * @type {boolean}
     */
    this.ready = false;
    /**
     * @type {number}
     */
    this.groundPosition = groundPosition;
    /**
     * @type {Image}
     */
    this.image = new Image();
    this.image.addEventListener('load', () => {
      // 画像のロードが完了したら準備完了フラグを立てる
      this.ready = true;
    }, false);
    this.image.src = imagePath;
  }
  /**
   * 進行方向を設定する
   * @param {number} x - X 方向の移動量
   * @param {number} y - Y 方向の移動量
   */
  setVector (x, y) {
    // 自身の vector プロパティに設定する
    this.vector.set(x, y);
  }

  /**
   * 進行方向を角度を基に設定する
   * @param {number} angle - 回転量 (ラジアン)
   */
  setVectorFromAngle (angle) {
    // 自身の回転量を設定する
    this.angle = angle;
    // ラジアンからサインとコサインを求める
    let sin = Math.sin(angle);
    let cos = Math.cos(angle);
    // 自身の vector プロパティに設定する
    this.setVector(cos, sin);
  }

  /**
   * スプライト画像からキャラクター等を表示する
   * @param {number} spriteNum - スプライト画像の番号
   * @param {*} x - キャラクターを表示する X 座標
   * @param {*} y - キャラクターを表示する Y 座標
   */
  draw (spriteNum, x, y) {
    // キャラクターの幅を考慮してオフセットする量
    let offsetX = this.w / 2;
    let sx = (spriteNum % 14) * 64;
    let sy = Math.floor(spriteNum / 14) * 64;
    this.vctx.drawImage(this.image, sx, sy, this.w, this.h,
      x - offsetX, y,
      this.w, this.h);
    console.log(x + ':' + y);
  }
}

/**
 * OwnCharacter クラス
 */
class OwnCharacter extends Character {
  /**
   * @constructor
   * @param {CanvasRenderingContext2D} vctx - 描画などに利用する 2D コンテキスト(仮想画面)
   * @param {number} x - X 座標
   * @param {number} y - Y 座標 (groundPosition - h を初期値とする)
   * @param {number} w - 幅
   * @param {number} h - 高さ
   * @param {number} life - ライフ
   * @param {string} imagePath - キャラクター用の画像のパス
   */
  constructor (vctx, x, y, w, h, life, groundPosition, imagePath) {
    // Charactor クラスを継承しているので、まずは継承元となる
    // Charactor クラスのコンストラクタを呼び出すことで初期化する
    // (super が継承元のコンストラクタの呼び出しに相当する)
    super (vctx, x, y, w, h, life, groundPosition, imagePath);

    /**
     * X 軸方向への 1 フレーム毎の加速量
     * @type {number}
     */
    this.accelarationX = 0;
    /**
     * Y 軸方向への 1 フレーム毎の加速量
     * @type {number}
     */
    this.accelarationY = 0;
    /**
     * 自身の歩き移動の加速上限
     * @type {number}
     */
    this.walkUpperLimit = 96;
    /**
     * 自身の走り移動スピード (update 一回当たりの移動量)
     * @type {number}
     */
    this.dashUpperLimit = 192;
    /**
     * 歩く、または走る際の加速量
     * @type {number}
     */
    this.speed = 6;
    /**
     * 重力による加速量
     * @type {number}
     */
    this.gravity = 16;
    /**
     * 重力による加速量の最大値
     * @type {number}
     */
    this.maxGravity = 320;
    /**
     * 地面の Y 座標
     * @type {number}
     */
    this.groundPosition = groundPosition;
    /**
     * 自身のジャンプ力
     * @type {number}
     */
    this.jumpingPower = 220;
    /**
     * 大ジャンプの時の加速量
     * @type {number}
     */
    this.BigJumpingPower = 280;
    /**
     * Own Character がジャンプ中かどうかを表すフラグ
     * @type {boolean}
     */
    this.isJumping = false;
    /**
     * ジャンプボタンを長押ししているフレーム数
     * @type {number}
     */
    this.jumpBtnCount = 0;
    /**
     * ジャンプしてから経過したフレーム数
     * @type {number}
     */
    this.jumpFrameCount = 0;
    /**
     * 着地してから経過したフレーム数
     * @type {number}
     */
    this.landFrameCount = 0;
    /**
     * 進行中のキャラクターのアニメーション名
     * @type {string} [animation name = standing] - 初期値は立ち状態の'standing'
     */
    this.animation = 'standing';
    /**
     * アニメーションの進行度
     * @type {number}
     */
    this.animationCount = 0;
    /**
     * スプライト画像の中で表示したいエリアの番号
     * @type {number}
     */
    this.sprite = 0;
  }

  /**
   * ジャンプボタンを押されたとき
   */
  jump () {
    // まだジャンプしていない状態ならばジャンプするようにする
    if( !this.isJumping ) {
      this.isJumping = true;
      this.animation = 'jumping';
      // ジャンプ開始時に、ジャンプしてからのフレーム数カウントと
      // 着地してからのフレーム数カウントをリセットする
      this.jumpFrameCount = 0;
      this.landFrameCount = 0;
      // ジャンプボタンを長押ししているフレーム数をカウントする
      this.jumpBtnCount = 1
    }
    // 大ジャンプ
    if( this.jumpBtnCount < 15 ) {
      this.accelarationY = - (this.BigJumpingPower - this.jumpBtnCount);
    }
  }

  /**
   * 左方向に走るボタンを押されたとき
   */
  leftRun () {
    // 左に走っているアニメーションにおける加速度などを設定する
    // キャラクターのアニメーション名
    // と進行方向を設定する
    if( !this.isJumping ) {
      // ジャンプしていない状態なら他のアニメーションができるようにする
      this.animation = 'running';
      // ジャンプしている間は方向転換できない
      this.angle = 180 * Math.PI / 180;
    }
    // 加速の上限を設定する
    if( this.accelarationX > - this.dashUpperLimit ) {
      this.accelarationX -= this.speed;
    }
    if( this.accelarationX > 0 ) {
      this.accelarationX -= this.speed;
    }
  }

  /**
   * 右方向に走るボタンを押されたとき
   */
  rightRun () {
    // 右に走っているアニメーションにおける加速度などを設定する
    if( !this.isJumping ) {
      // ジャンプしていない状態なら他のアニメーションができるようにする
      this.animation = 'running';
      // ジャンプしている間は方向転換できない
      this.angle = 0 * Math.PI / 180;
    }
    if( this.accelarationX < this.dashUpperLimit ) {
      this.accelarationX += this.speed;
    }
    if( this.accelarationX < 0 ) {
      this.accelarationX += this.speed;
    }
  }

  /**
   * 左方向に歩くボタンを押されたとき
   */
  leftWalk () {
    // 左に歩いているアニメーションにおける加速度などを設定する
    // キャラクターのアニメーション名
    // と進行方向を設定する
    if( !this.isJumping ) {
      // ジャンプしていない状態なら他のアニメーションができるようにする
      this.animation = 'walking';
      // ジャンプしている間は方向転換できない
      this.angle = 180 * Math.PI / 180;
    }
    // 加速の上限を設定する
    if( this.accelarationX <= - this.walkUpperLimit ) {
      this.accelarationX += this.speed;
    }
    if( this.accelarationX > - this.walkUpperLimit ) {
      this.accelarationX -= this.speed / 2;
    }
    // 進行方向とは逆（右側）に加速度が生じている場合に
    // 加速度が 0 になるまで進行方向への加速度を増やす
    if( this.accelarationX > 0 ) {
      this.accelarationX -= this.speed / 2;
    }
  }

  /**
   * 右方向に歩くボタンを押されたとき
   */
  rightWalk () {
    // 右に歩いているアニメーションにおける加速度などを設定する
    if( !this.isJumping ) {
      // ジャンプしていない状態なら他のアニメーションができるようにする
      this.animation = 'walking';
      // ジャンプしている間は方向転換できない
      this.angle = 0 * Math.PI / 180;
    }
    // 加速度が歩きアニメーションの上限を超えていた場合
    // その上限まで加速度を下げる
    if( this.accelarationX >= this.walkUpperLimit) {
      this.accelarationX -= this.speed;
    }
    if( this.accelarationX < this.walkUpperLimit ) {
      this.accelarationX += this.speed / 2;
    }
    if( this.accelarationX < 0 ) {
      this.accelarationX += this.speed / 2;
    }
  }

  /**
   * 立つ以外のアクションを何もしていない時
   */
  standing () {
    if( !this.isJumping ) {
      // 移動キーが押されていないとき
      // 加速度を 0 に近づける
      if( this.accelarationX > 0 ) {
        // 加速度が一定よりも高い場合は減速を強める
        if( this.accelarationX > this.walkUpperLimit ) {
          this.accelarationX -= this.speed * 2;
        }
        this.accelarationX -= this.speed;
        if( this.accelarationX < 0 ) {
          this.accelarationX = 0;
        }
      }
      if( this.accelarationX < 0 ) {
        if( this.accelarationX < - this.walkUpperLimit ) {
          this.accelarationX += this.speed * 2;
        }
        this.accelarationX += this.speed;
        if( this.accelarationX > 0 ) {
          this.accelarationX = 0;
        }
      }
      if( this.accelarationX == 0 && this.accelarationY == 0
          && this.position.y == ( this.groundPosition - this.h ) << 5
        ) {
        // 加速度が 0 になったとき、立ち状態にする
        this.animation = 'standing';
      }
    }
  }

  /**
   * キャラクターの状態を更新し描画を行う
   */
  update () {
    // 前のフレームの this.h を変数に代入する
    let previousFrameImgHeight = this.h;
    // 重力を加味する
    if( this.accelarationY < this.maxGravity ) {
      this.accelarationY += this.gravity;
    }
    if( this.jumpFrameCount == 8 ) {
      // 上方向に加速する
      this.accelarationY = - this.jumpingPower;
    }
    // 大ジャンプにするために必要なカウント
    if( this.jumpBtnCount ) {
      this.jumpBtnCount++;
    }
    // 床にぶつかるようにする
    // 着地してから 8f 後にジャンプフラグを false にし、
    // jumpBtnCount をリセット、キャラクターのアニメーションを
    // 'walking' に変更する
    if( this.position.y >= (this.groundPosition - this.h) << 5 ) {
      if( this.animation == 'jumping' ) {
        // 着地してからのフレーム数を数える
        this.landFrameCount++;
        if( this.landFrameCount > 7 ) {
          this.isJumping = false;
          this.jumpBtnCount = 0;
          this.animation = 'walking';
        }
      }
      // 床の高さに到達した時に加速を 0 にする
      this.accelarationY = 0;
      // 床の高さよりも下に行ってしまった場合に
      // キャラの Y 座標を床の高さに戻す
      this.position.y = ( this.groundPosition - this.h ) << 5;
      if(this.animationCount < 5) {
        console.log(this.h);
      }
    }
    // キーの押下状態を調べて挙動を変える
    if( keyb.Space ) {

      this.jump();

    } else if( keyb.Left && keyb.Shift ) {

      this.leftRun();

    } else if( keyb.Right && keyb.Shift ) {

      this.rightRun();

    } else if( keyb.Left ) {

      this.leftWalk();

    } else if( keyb.Right ) {

      this.rightWalk();

    } else {

      this.standing();

    }

    this.animationCount++;
    // キャラクターの状態の応じて画像の大きさやスプライト番号を変える
    switch ( this.animation ) {
      case 'jumping':
        // ジャンプのアニメーション中に、ジャンプしてからのフレーム数カウントを1ずつ増やす
        this.jumpFrameCount++;
        // ジャンプしてからのフレーム数に応じて使用するスプライト画像と
        // その画像の高さ、幅を設定する
        if( this.jumpFrameCount < 4 ) {
          this.sprite = 84;
          this.h = 96;
          this.w = 84;
        } else if ( this.jumpFrameCount < 8 ) {
          this.sprite = 86;
          this.h = 91;
          this.w = 90;
        } else if ( this.jumpFrameCount < 12 ) {
          this.sprite = 88;
          this.h = 141;
          this.w = 66;
        } else if ( this.jumpFrameCount > 11 ) {
          // 着地した後のキャラ画像を表示する
          if( this.landFrameCount > 0 ) {
            this.sprite = 94;
            this.h = 107;
            this.w = 79;
            console.log('landFrameCount: ' + this.landFrameCount);
          } else if ( this.accelarationY <= 0 ) {
            this.sprite = 90;
            this.h = 175;
            this.w = 60;
          } else if ( this.accelarationY > 0 ) {
            this.sprite = 92;
            this.h = 158;
            this.w = 60;
          }
        }
        if( this.angle == 180 * Math.PI / 180 ) {
          this.sprite += 42;
        }
        break;

      case 'standing':
        this.w = 64;
        this.h = 128;
        this.sprite = 0;
        if (this.angle == 180 * Math.PI / 180) {
          this.sprite += 7;
        }
        break;

      case 'walking':
        this.w = 64;
        this.h = 128;
        // 8 フレームごとに表示する画像を変更する
        this.sprite = 1 + (Math.floor(this.animationCount / 8)) % 6;
        if (this.angle == 180 * Math.PI / 180) {
          this.sprite += 7;
        }
        break;

      case 'running':
        this.w = 128;
        this.h = 128;
        this.sprite = 28 + (Math.floor((this.animationCount / 8)) % 6) * 2;
        if( this.angle == 180 * Math.PI / 180 ) {
          this.sprite += 28;
        }
        break;

      default:
        break;
    }
    // 加速度の分 X・Y 座標を増減させる
    this.position.x += this.accelarationX;
    // キャラクターの画像を足元の Y 座標を基準に表示する
    this.position.y += this.accelarationY + ( ( previousFrameImgHeight - this.h ) << 5 );

    // 自機キャラクターを描画する
    this.draw(this.sprite, this.position.x >> 5, this.position.y >> 5);
  }
}
