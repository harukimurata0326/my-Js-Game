/**
 * Canvas2D API をラップしたユーティリティクラス
 */
class Canvas2DUtility {
  /**
   * @constructor
   * @param {HTMLCanvasElement} canvas - 対象となる canvas element
   */
  constructor (canvas) {
    /**
     * @type {HTMLCanvasElement}
     */
    this.canvasElement = canvas;
    /**
     * @type {CanvasRenderingContext2D}
     */
    this.context2d = canvas.getContext('2d');
  }

  /**
   * @return {HTMLCanvasElement}
   */
  get canvas () {
    return this.canvasElement;
  }
  /**
   * @return {CanvasRenderingContext2D}
   */
  get context() {
    return this.context2d;
  }
}
