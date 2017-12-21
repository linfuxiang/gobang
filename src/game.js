/**
 * el 画布元素
 * ctx 画布context
 * statusEl 状态元素
 * resultEl 游戏结束提示元素
 * player 当前玩家，true白棋，false黑棋
 * firstInit 是否初次渲染
 * waiting 是否游戏已结束，等待初始化
 * process 游戏过程
 * lastImg 上一个画布（用于清除s当前棋子的提示）
 * rowNum 行格子数量
 * colNum 列格子数量
 * row 行长度
 * col 列长度
 * chessGrid 格子大小
 * chessmanSize 棋子大小
 */
class GAME {
    constructor(canvasSelector, statusSelector, resultSelector) {
        this.el = document.querySelector(canvasSelector);
        this.ctx = this.el.getContext('2d');
        this.statusEl = document.querySelector(statusSelector);
        this.resultEl = document.querySelector(resultSelector);
        this.player = false;
        this.firstInit = true; // 是否第一次初始化
        this.waiting = false;
        this.process = [];
        this.lastImg = null;
    }
    /**
     * 初始化棋盘
     * @param  {Number} rowNum 行格子数量
     * @param  {Number} colNum 列格子数量
     * @param  {Number} row 行长度
     * @param  {Number} col 列长度
     */
    init(rowNum, colNum, row, col) {
        if (row / rowNum != col / colNum) {
            alert('格子非正方形，不能初始化.');
            return false;
        }
        this.rowNum = rowNum;
        this.colNum = colNum;
        this.row = row;
        this.col = col;
        // 设置格子大小
        this.chessGrid = row / rowNum;
        // 设置棋子大小
        this.chessmanSize = row / rowNum / 2 - 2;

        // 用二维数组设置棋局
        this.status = [];
        for (let i = 0; i < rowNum - 1; i++) {
            this.status[i] = [];
            for (let j = 0; j < colNum - 1; j++) {
                this.status[i][j] = null;
            }
        }

        // 画棋盘
        // 画背景
        this.ctx.fillStyle = "#FFF";
        this.ctx.fillRect(0, 0, row, col);
        // 画线条
        this.ctx.strokeStyle = "#000";
        this.ctx.beginPath();
        let i = 1;
        while (i < rowNum) {
            this.ctx.moveTo(0, i * row / rowNum);
            this.ctx.lineTo(row, i * row / rowNum);
            i++;
        }
        i = 1;
        while (i < colNum) {
            this.ctx.moveTo(i * col / colNum, 0);
            this.ctx.lineTo(i * col / colNum, col);
            i++;
        }
        this.ctx.stroke();
        if (this.firstInit) {
            this.firstInit = false;
            this.bindEvent();
        }
        this.statusEl.innerText = '';
        this.waiting = false;
        this.player = false;
        this.process = [];
    }
    /**
     * 创建棋子
     * @param  {Boolean} type 黑棋type=false,白棋type=true
     * @param  {Array} station [横坐标, 纵坐标]
     */
    createChessman(type, station) {
        this.ctx.fillStyle = type ? '#fff' : '#000';
        this.ctx.beginPath();
        this.ctx.arc(station[0], station[1], this.chessmanSize, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.strokeStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(station[0], station[1], this.chessmanSize, 0, 2 * Math.PI);
        this.ctx.stroke();
        this.ctx.closePath();
    }

    /**
     * 创建最后一次下的棋子是哪个的提示
     * @param  {Array} station [横坐标, 纵坐标]
     * @param  {Boolean} isClear 是否为清除操作
     */
    createCurrentTip(station, isClear) {
        let length = this.chessmanSize / 2;
        this.ctx.strokeStyle = isClear ? '#fff' : '#f75000';
        this.ctx.lineJoin = 'miter';
        this.ctx.beginPath();
        // 左上角
        this.ctx.moveTo(station[0] - this.chessmanSize + length, station[1] - this.chessmanSize);
        this.ctx.lineTo(station[0] - this.chessmanSize, station[1] - this.chessmanSize);
        this.ctx.lineTo(station[0] - this.chessmanSize, station[1] - this.chessmanSize + length);
        // 左下角
        this.ctx.moveTo(station[0] - this.chessmanSize, station[1] + this.chessmanSize - length);
        this.ctx.lineTo(station[0] - this.chessmanSize, station[1] + this.chessmanSize);
        this.ctx.lineTo(station[0] - this.chessmanSize + length, station[1] + this.chessmanSize);
        // 右下角
        this.ctx.moveTo(station[0] + this.chessmanSize - length, station[1] + this.chessmanSize);
        this.ctx.lineTo(station[0] + this.chessmanSize, station[1] + this.chessmanSize);
        this.ctx.lineTo(station[0] + this.chessmanSize, station[1] + this.chessmanSize - length);
        // 右上角
        this.ctx.moveTo(station[0] + this.chessmanSize, station[1] - this.chessmanSize + length);
        this.ctx.lineTo(station[0] + this.chessmanSize, station[1] - this.chessmanSize);
        this.ctx.lineTo(station[0] + this.chessmanSize - length, station[1] - this.chessmanSize);
        this.ctx.stroke();
    }

    /**
     * 判断是否有同样颜色的棋子
     * @param  {Boolean} type 黑棋type=false,白棋type=true
     * @param  {Number} x X坐标
     * @param  {Number} y Y坐标
     * @return {Boolean}   true白棋，false黑棋，null空，undefined超出边界
     */
    checkIfChess(x, y) {
        // 由于有可能越出边界，所以使用trc-catch方便判断
        try {
            let status = this.status[x][y];
            return status;
        } catch (e) {
            return undefined;
        }
    }

    /**
     * 判断游戏是否结束
     * @param  {Number} x X坐标
     * @param  {Number} y Y坐标
     * @param  {Number} way 1横，2竖，3左上-右下，4左下-右上
     * @param  {Boolean} direc 方向：1前，2后
     * @param  {Number} count 计数
     * @return {Boolean} [description]
     */
    judgeGameOver(x, y, way) {
        let count = 1;
        let flagL = false,
            flagR = false;
        switch (way) {
            case 1:
                for (let i = 1; i <= 4; i++) {
                    let res = this.checkIfChess(x - i, y);
                    if (res === this.player) {
                        count++;
                    } else if (res === null) {
                        flagL = true;
                        break;
                    } else {
                        break;
                    }
                }
                for (let i = 1; i <= 4; i++) {
                    let res = this.checkIfChess(x + i, y);
                    if (res === this.player) {
                        count++;
                    } else if (res === null) {
                        flagR = true;
                        break;
                    } else {
                        break;
                    }
                }
                if (count == 5 || (flagL && flagR && count == 4)) {
                    return true;
                }
                break;
            case 2:
                for (let i = 1; i <= 4; i++) {
                    let res = this.checkIfChess(x, y - i);
                    if (res === this.player) {
                        count++;
                    } else if (res === null) {
                        flagL = true;
                        break;
                    } else {
                        break;
                    }
                }
                for (let i = 1; i <= 4; i++) {
                    let res = this.checkIfChess(x, y + i);
                    if (res === this.player) {
                        count++;
                    } else if (res === null) {
                        flagR = true;
                        break;
                    } else {
                        break;
                    }
                }
                if (count == 5 || (flagL && flagR && count == 4)) {
                    return true;
                }
                break;
            case 3:
                for (let i = 1; i <= 4; i++) {
                    let res = this.checkIfChess(x - i, y - i);
                    if (res === this.player) {
                        count++;
                    } else if (res === null) {
                        flagL = true;
                        break;
                    } else {
                        break;
                    }
                }
                for (let i = 1; i <= 4; i++) {
                    let res = this.checkIfChess(x + i, y + i);
                    if (res === this.player) {
                        count++;
                    } else if (res === null) {
                        flagR = true;
                        break;
                    } else {
                        break;
                    }
                }
                if (count == 5 || (flagL && flagR && count == 4)) {
                    return true;
                }
                break;
            case 4:
                for (let i = 1; i <= 4; i++) {
                    let res = this.checkIfChess(x + i, y - i);
                    if (res === this.player) {
                        count++;
                    } else if (res === null) {
                        flagL = true;
                        break;
                    } else {
                        break;
                    }
                }
                for (let i = 1; i <= 4; i++) {
                    let res = this.checkIfChess(x - i, y + i);
                    if (res === this.player) {
                        count++;
                    } else if (res === null) {
                        flagR = true;
                        break;
                    } else {
                        break;
                    }
                }
                if (count == 5 || (flagL && flagR && count == 4)) {
                    return true;
                }
                break;
        }
        /*// 判断横
        if (this.checkIfChess(x - 1, y) || this.checkIfChess(x + 1, y)) {
            console.log('横')
        }
        // 判断竖
        if (this.checkIfChess(x, y - 1) || this.checkIfChess(x, y + 1)) {
            console.log('竖')
        }
        // 判断斜（左上-右下）
        if (this.checkIfChess(x - 1, y - 1) || this.checkIfChess(x + 1, y + 1)) {
            console.log('左上-右下')
        }
        // 判断斜（左下-右上）
        if (this.checkIfChess(x - 1, y + 1) || this.checkIfChess(x + 1, y - 1)) {
            console.log('左下-右上')
        }*/
    }



    /**
     * 绑定事件（下棋用）
     * @return {[type]} [description]
     */
    bindEvent() {
        this.el.addEventListener('click', (e) => {
            if (this.waiting) {
                return false;
            }
            let x, y;
            if (e.layerX || e.layerX == 0) {
                x = e.layerX;
                y = e.layerY;
            } else if (e.offsetX || e.offsetX == 0) { // Opera  
                x = e.offsetX;
                y = e.offsetY;
            }
            let xCount = Math.floor((x - this.chessGrid / 2) / this.chessGrid) + 1,
                yCount = Math.floor((y - this.chessGrid / 2) / this.chessGrid) + 1;
            // 满足下棋条件之后，下棋并判断是否游戏结束
            if (xCount &&
                yCount &&
                xCount < this.rowNum &&
                yCount < this.colNum &&
                this.status[xCount - 1][yCount - 1] === null) {
                if (this.process.length) {
                    this.ctx.putImageData(this.lastImg, 0, 0);
                }
                this.createChessman(this.player, [this.chessGrid * xCount, this.chessGrid * yCount]);
                this.lastImg = this.ctx.getImageData(0, 0, this.el.width, this.el.height)
                this.createCurrentTip([this.chessGrid * xCount, this.chessGrid * yCount]);
                this.status[xCount - 1][yCount - 1] = this.player;
                this.statusEl.innerHTML += (this.player ? '白棋' : '黑棋') + '走：(' + xCount + ',' + yCount + ')<br/>';
                this.process.push([xCount, yCount]);
                // 判断游戏是否结束
                if (this.judgeGameOver(xCount - 1, yCount - 1, 1) ||
                    this.judgeGameOver(xCount - 1, yCount - 1, 2) ||
                    this.judgeGameOver(xCount - 1, yCount - 1, 3) ||
                    this.judgeGameOver(xCount - 1, yCount - 1, 4)) {
                    this.statusEl.innerHTML += (this.player ? '白棋' : '黑棋') + '胜！';
                    document.querySelector('#result').style.display = 'block';
                    this.resultEl.innerText = (this.player ? '白棋' : '黑棋') + '胜！';
                    this.waiting = true;
                    // setTimeout(() => {
                        // this.init(this.rowNum, this.colNum, this.row, this.col);
                    // }, 3000)
                } else {
                    this.player = !this.player;
                }
            }
        });
    }
}
export { GAME };