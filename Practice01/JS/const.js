/**
 * 定数の定義用のJS
 */


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
 * 地面の Y 座標
 */
const GROUND_Y = 524;
/**
 * 一画面の横幅当たりのブロックの数
 * @type {number}
 */
const MAP_WIDTH_BLOCK = CANVAS_WIDTH / 40;
/**
 * 一画面の縦幅当たりのブロックの数
 * @type {number}
 */
const MAP_HEIGHT_BLOCK = CANVAS_HEIGHT / 40;
/**
 * マップデータにおける横幅のブロックの数
 * @type {number}
 */
const FIELD_WIDTH_BLOCK = 256;
/**
 * マップデータにおける縦幅のブロックの数
 * @type {number}
 */
const FIELD_HEIGHT_BLOCK = CANVAS_HEIGHT / 40;
/**
 * 背景を流れる光の個数
 * @type {number}
 */
const BACKGROUND_LIGHT_MAX_COUNT = 50;
/**
 * 背景を流れる光の最大サイズ
 * @type {number}
 */
const BACKGROUND_LIGHT_MAX_SIZE = 3;
/**
 * 背景を流れる光の最大速度
 * @type {number}
 */
const BACKGROUND_LIGHT_MAX_SPEED = 1;
