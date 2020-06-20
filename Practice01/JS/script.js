(() => {
  /**
   * キーの押下状態を調べるためのオブジェクト
   * このオブジェクトはプロジェクトのどこからでも参照できるように
   * window オブジェクトのカスタムプロパティとして設定する
   * @global
   * @type {object}
   */
  window.keyb = {};

  /**
   * Canvas2D API をラップしたユーティリティクラス
   * @type {Canvas2DUtility}
   */
  let util = null;
  /**
   * 描画対象となる Canvas Element
   * @type {HTMLCanvasElement}
   */
  let canvas = null;
  /**
   * Canvas2D API のコンテキスト
   * @type {CanvasRenderingContext2D}
   */
  let ctx = null;
  /**
   * 描画対象となる仮想画面の Canvas Element
   * @type {HTMLCanvasElement}
   */
  let v_canvas = null;
  /**
   * 仮想画面の Canvas2D API のコンテキスト
   * @type {CanvasRenderingContext2D}
   */
  let v_ctx = null;
  /**
   * 仮想画面から実画面への拡大倍率
   * @type {number}
   */
  let magnification = 1;
  /**
   * 実行開始時のタイムスタンプ
   * @type {number}
   */
  let startTime = null;
  /**
   * フレーム数
   * @type {number}
   */
  let frameCount = 0;
  /**
   * 自機キャラクターのインスタンス
   * @type {aozora}
   */
  window.aozora = null;
  /**
   * フィールドのインスタンス
   * @type {field}
   */
  window.field = null;
  /**
   * 背景の光のインスタンス
   * @type {bgFlash}
   */
  let bgflash = null;
  /**
   * 流れる光のインスタンスを格納する配列
   * @type {Array<bgLight>}
   */
  let backgroundLightArray = [];

  /**
   * ページのロードが完了した時に発火する load イベント
   */
  window.addEventListener('load', () => {
    // ユーティリティクラスを初期化
    util = new Canvas2DUtility(document.body.querySelector('#can'));
    // ユーティリティクラスから canvas を取得
    canvas = util.canvas;
    // ユーティリティクラスから 2d コンテキストを取得
    ctx = util.context;
    // 描画対象となる仮想画面の Canvas Element を作成する
    v_canvas = document.createElement('canvas');
    // 仮想画面の Canvas2D API のコンテキストを取得する
    v_ctx = v_canvas.getContext('2d');
    // 仮想画面の canvas の大きさを設定する
    v_canvas.width = CANVAS_WIDTH;
    v_canvas.height = CANVAS_HEIGHT;
    // 実画面の canvas の大きさを設定する
    canvas.width = CANVAS_WIDTH * magnification;
    canvas.height = CANVAS_HEIGHT * magnification;

    // 仮想画面を実画面に描画する際に、
    // 拡大によって画像がぼやけるのを防ぐ
    v_ctx.mozImageSmoothingEnabled    = false;
    v_ctx.msimageSmoothingEnabled     = false;
    v_ctx.webkitimageSmoothingEnabled = false;
    v_ctx.imageSmoothingEnabled       = false;

    // 初期化処理を行う
    initialize();
    // インスタンスの状態を管理する
    loadCheck();
  }, false);

  /**
   * canvas やコンテキストを初期化する
   */
  function initialize () {
    // 自機キャラクターを初期化する
    aozora = new OwnCharacter(v_ctx, 100, GROUND_Y - 128, 128, 128,
        100, GROUND_Y, '../images/character/sprites_sheets/sprite.png');

    // フィールド画像を初期化する
    field = new Field(v_ctx, 40, 40, '../images/bg/pseudo-alter/block/sprite.png');

    // 背景の光源を初期化する
    bgflash = new bgFlash(
        v_ctx, 100, 100, 16, 100, 100, 300,
        "#fff", "#051E4E", "#4A5267", 0.3, 1
    );

    // 流れる光を初期化する
    for (i = 0; i < BACKGROUND_LIGHT_MAX_COUNT; ++i) {
      // 星の速度と大きさはランダムと最大値によって決まるようにする
      let size = 1 + Math.random() * (BACKGROUND_LIGHT_MAX_SIZE - 1);
      let speed = .4 + Math.random() * (BACKGROUND_LIGHT_MAX_SPEED - .4);
      // 光のインスタンスを生成する
      backgroundLightArray[i] = new bgLight(v_ctx, size, speed);
      // 星の初期位置もランダムに決まるようにする
      let x = Math.random() * CANVAS_WIDTH;
      let y = Math.random() * CANVAS_HEIGHT;
      backgroundLightArray[i].set(x, y);
    }
  }

  /**
   * canvas 描画処理を行う
   */
  function render() {
    // 背景の描画を行う
    v_ctx.fillStyle = "#4A5267";
    v_ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 背景の光源の状態を更新する
    bgflash.update();

    // デバッグ情報を表示
    v_ctx.font = "20px 'Impact";
    v_ctx.fillStyle = "#fff";
    v_ctx.fillText("FRAME:"+frameCount, 10, 20);

    // 流れる星の状態を更新する
    backgroundLightArray.map((v) => {
      v.update();
    });

    // フィールドを描画する
    field.update();

    // 自機キャラクターの状態を更新する
    aozora.update();

    // 仮想画面(vcan)に描画したものを実画面(can)に拡大転送する
    ctx.drawImage(
      v_canvas, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT,
      0, 0, CANVAS_WIDTH * magnification, CANVAS_HEIGHT * magnification
    );
  }

  /**
   * インスタンスの準備が完了しているかを確認する
   */
  function loadCheck () {
    // 準備完了を意味する真偽値
    let ready = true;
    // AND 演算で準備完了しているかチェックする
    ready = ready && aozora.ready;

    // 全ての準備が完了したら次の処理に進む
    if (ready === true) {
      // イベントを設定する
      eventSetting();
      // 実行開始時のタイムスタンプを取得する
      startTime = performance.now();
      // メインループを開始する
      mainLoop();
    } else {
      // 準備が完了していない場合は 0.1 秒毎に再帰呼び出しする
      setTimeout(loadCheck, 100);
    }
  }

  /**
   * メインループを行う
   */
  function mainLoop () {
    // 現在の時間を変数に設定する
    let nowTime = performance.now();
    // ループが始動してから経過した時間を変数に設定する
    let nowFrame = (nowTime - startTime) / GAME_FPS;
    // FPS が 60（GAME_FPS） 以上にならないようにする
    if(nowFrame > frameCount) {
      // ループの度に frameCount を１増やす
      frameCount++;
      // 描画処理
      render();
    }
    // 1 秒間に 60 回メインループ処理を行う
    // モニターによっては1秒間で60回以上処理される場合がある
    requestAnimationFrame(mainLoop);
  }

  /**
   * イベントを設定する
   */
  function eventSetting() {
    // キーを押したときに呼び出されるイベントリスナーを設定する
    window.addEventListener('keydown', (e) => {
      // キーの押下状態を管理するオブジェクトに押下されたことを設定する
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
      if( e.keyCode == 69 ) {
        keyb.scxUp = true;
      }
      if( e.keyCode == 81 ) {
        keyb.scxDown = true;
      }
    }, false);

    // キーが離され時に呼び出されるイベントリスナーを設定する
    window.addEventListener('keyup', (e) => {
      // キーが離されたことを設定する
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
      if( e.keyCode == 69 ) {
        keyb.scxUp = false;
      }
      if( e.keyCode == 81 ) {
        keyb.scxDown = false;
      }
    }, false);
  }
})();
