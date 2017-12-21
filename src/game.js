/**
 * el 画布元素
 * ctx 画布context
 * statusEl 状态元素
 * player 当前玩家，true白棋，false黑棋
 * firstInit 是否初次渲染
 * waiting 是否游戏已结束，等待初始化
 * rowNum 行格子数量
 * colNum 列格子数量
 * row 行长度
 * col 列长度
 * chessGrid 格子大小
 * chessmanSize 棋子大小
 */
class GAME {
    constructor(canvasSelector, statusSelector) {
        this.el = document.querySelector(canvasSelector);
        this.ctx = this.el.getContext('2d');
        this.statusEl = document.querySelector(statusSelector);
        this.player = false;
        this.firstInit = true; // 是否第一次初始化
        this.waiting = false;
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
        // 画先跳
        this.ctx.fillStyle = "#FF0000";
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
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(station[0], station[1], this.chessmanSize, 0, 2 * Math.PI);
        this.ctx.stroke();
        this.ctx.closePath();
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
                this.createChessman(this.player, [this.chessGrid * xCount, this.chessGrid * yCount]);
                this.status[xCount - 1][yCount - 1] = this.player;
                this.statusEl.innerHTML += (this.player ? '白棋' : '黑棋') + '走：(' + xCount + ',' + yCount + ')<br/>';
                // 判断游戏是否结束
                if (this.judgeGameOver(xCount - 1, yCount - 1, 1) ||
                    this.judgeGameOver(xCount - 1, yCount - 1, 2) ||
                    this.judgeGameOver(xCount - 1, yCount - 1, 3) ||
                    this.judgeGameOver(xCount - 1, yCount - 1, 4)) {
                    this.statusEl.innerHTML += (this.player ? '白棋' : '黑棋') + '胜！';
                    this.waiting = true;
                    setTimeout(() => {
                        this.statusEl.innerText = '';
                        this.init(this.rowNum, this.colNum, this.row, this.col);
                        this.waiting = false;
                    }, 3000)
                }
                this.player = !this.player;
            }
        })
    }
}
export { GAME };