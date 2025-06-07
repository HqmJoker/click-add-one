// index.js - 游戏主页面逻辑
const app = getApp();

const adController = require('./../../utils/ad-controller.js');

Page({
  // 页面的初始数据
  data: {
    board: [], // 5x5 棋盘
    clicksLeft: 5, // 剩余点击次数
    maxClicks: 5, // 最大点击次数
    boardSize: 5, // 棋盘大小
    isAnimating: false, // 动画进行中标记
    score: 0, // 积分
    maxNumberInGame: 1, // 本局游戏中的最大数字
    recordHighestNumber: 1,
    recordHighestScore: 0,
    theme: 'light', // 主题，默认亮色
    colors: {}, // 数字格子颜色配置
    modalVisible: false, // 模态框是否可见
    modalType: '', // 模态框类型: 'gameEnd', 'confirm'
    modalTitle: '', // 模态框标题
    modalMessage: '', // 模态框消息
    gameEndStats: {}, // 游戏结束统计数据
    // 进度条宽度百分比
    progressPercent: 100,
    // 进度条颜色
    progressColor: ''
  },

  // 生命周期函数--监听页面加载
  onLoad: function() {
    // 初始化主题
    this.initTheme();
    
    // 初始化游戏
    this.initGame();
    
    // 设置格子颜色配置
    this.initCellColors();
  },
  
  // 页面显示时触发
  onShow: function() {
    // 如果有必要，可以在此处更新数据
  },
  
  // 初始化主题
  initTheme: function() {
    try {
      const savedTheme = wx.getStorageSync('theme') || 'light';
      this.setData({
        theme: savedTheme
      });
    } catch (e) {
      console.error('主题初始化失败:', e);
    }
  },
  
  // 切换主题
  toggleTheme: function() {
    const newTheme = this.data.theme === 'light' ? 'dark' : 'light';
    this.setData({
      theme: newTheme
    });
    
    try {
      wx.setStorageSync('theme', newTheme);
    } catch (e) {
      console.error('保存主题失败:', e);
    }
  },
  
  // 初始化数字格子颜色配置
  initCellColors: function() {
    const lightColors = {
      1: '#a2d2ff', 2: '#bde0fe', 3: '#ffafcc', 4: '#ffc8dd', 
      5: '#cdb4db', 6: '#98f5e1', 7: '#8eecf5', 8: '#90dbf4', 
      9: '#f08080', 10: '#f4a261', 11: '#e9c46a', 12: '#2a9d8f', 
      13: '#e76f51', 14: '#606c38', 15: '#dda15e', 16: '#bc6c25', 
      17: '#8338ec', 18: '#3a86ff', 19: '#fb8500', 20: '#ef233c'
    };
    
    const darkColors = {
      1: '#01295f', 2: '#013a8b', 3: '#5f0140', 4: '#7a0158', 
      5: '#4a0155', 6: '#014d40', 7: '#016064', 8: '#014f86', 
      9: '#6a040f', 10: '#9c2c13', 11: '#9a6a15', 12: '#005f56', 
      13: '#9c3311', 14: '#283809', 15: '#935a15', 16: '#773e15', 
      17: '#4715a7', 18: '#0750c7', 19: '#a94900', 20: '#a31630'
    };
    
    this.setData({
      colors: {
        light: lightColors,
        dark: darkColors
      }
    });
  },
  
  // 初始化游戏
  initGame: function() {
    // 尝试从Storage加载游戏状态
    try {
      const savedState = wx.getStorageSync('tapmeGameState');
      
      if (savedState) {
        // 如果有已保存的状态，加载它
        const gameState = JSON.parse(savedState);
        this.setData({
          board: gameState.board,
          clicksLeft: gameState.clicksLeft,
          score: gameState.score || 0,
          maxNumberInGame: gameState.maxNumberInGame || 1
        });
      } else {
        // 否则初始化新游戏
        this.setData({
          clicksLeft: this.data.maxClicks,
          score: 0,
          maxNumberInGame: 1
        });
        this.initializeBoard();
      }
    } catch (e) {
      console.error('加载游戏状态失败:', e);
      // 初始化新游戏
      this.setData({
        clicksLeft: this.data.maxClicks,
        score: 0,
        maxNumberInGame: 1
      });
      this.initializeBoard();
    }
    
    // 加载历史记录
    try {
      const highestNumber = wx.getStorageSync('tapmeHighestNumber') || 1;
      const highestScore = wx.getStorageSync('tapmeHighestScore') || 0;
      this.setData({
        recordHighestNumber: highestNumber,
        recordHighestScore: highestScore
      });
    } catch (e) {
      console.error('加载历史记录失败:', e);
    }
    
    // 更新点击次数显示和进度条
    this.updateClicksDisplay();
    this.setData({
      isAnimating: false
    });
  },
  
  // 更新点击次数显示和进度条
  updateClicksDisplay: function() {
    // 计算进度条百分比
    const progressPercent = (this.data.clicksLeft / this.data.maxClicks) * 100;
    
    // 根据剩余次数更改进度条颜色
    let progressColor = '';
    if (progressPercent <= 20) {
      progressColor = '#ff5252'; // 红色
    } else if (progressPercent <= 60) {
      progressColor = '#ffd740'; // 黄色
    } else {
      progressColor = this.data.theme === 'light' ? '#4caf50' : '#2e7d32'; // 默认颜色
    }
    
    this.setData({
      progressPercent: progressPercent,
      progressColor: progressColor
    });
  },
  
  // 保存游戏状态
  saveGameState: function() {
    const stateToSave = {
      board: this.data.board,
      clicksLeft: this.data.clicksLeft,
      score: this.data.score,
      maxNumberInGame: this.data.maxNumberInGame
    };
    
    try {
      wx.setStorageSync('tapmeGameState', JSON.stringify(stateToSave));
    } catch (e) {
      console.error('保存游戏状态失败:', e);
    }
  },
  
  // 初始化棋盘，保证初始状态没有连通组
  initializeBoard: function() {
    let board = [];
    
    // 创建随机棋盘
    for (let i = 0; i < this.data.boardSize; i++) {
      board[i] = [];
      for (let j = 0; j < this.data.boardSize; j++) {
        board[i][j] = Math.floor(Math.random() * 5) + 1; // 1-5的随机数
      }
    }
    
    this.setData({ board: board });
    
    // 检查并修复初始连通组
    while (this.hasConnectedGroups()) {
      for (let i = 0; i < this.data.boardSize; i++) {
        for (let j = 0; j < this.data.boardSize; j++) {
          board[i][j] = Math.floor(Math.random() * 5) + 1;
        }
      }
      this.setData({ board: board });
    }
  },
  
  // 处理格子点击事件
  handleCellTap: function(e) {
    // 当动画正在进行时，或者没有剩余点击次数时，阻止用户点击
    if (this.data.isAnimating || this.data.clicksLeft <= 0) return;
    
    const dataset = e.currentTarget.dataset;
    const row = parseInt(dataset.row);
    const col = parseInt(dataset.col);
    
    if (this.data.board[row][col] === null) return;
    
    // 增加点击的格子值
    let board = this.data.board;
    const oldValue = board[row][col];
    const newValue = oldValue + 1;
    board[row][col] = newValue;
    
    // 更新本局游戏中的最大数字
    let maxNumberInGame = this.data.maxNumberInGame;
    if (newValue > maxNumberInGame) {
      maxNumberInGame = newValue;
    }
    
    // 减少点击次数
    const clicksLeft = this.data.clicksLeft - 1;
    
    this.setData({
      board: board,
      maxNumberInGame: maxNumberInGame,
      clicksLeft: clicksLeft,
      ['cellHighlight.' + row + '.' + col]: true
    });
    
    // 更新点击次数显示
    this.updateClicksDisplay();
    
    // 保存游戏状态
    this.saveGameState();
    
    // 在短暂延迟后移除高亮效果并检查连通组
    setTimeout(() => {
      this.setData({
        ['cellHighlight.' + row + '.' + col]: false
      });
      
      // 检查连通组并处理
      this.processConnectedGroups(row, col);
      
      // 检查游戏是否结束
      if (this.data.clicksLeft <= 0) {
        // 创建一个等待函数来检查动画是否完成
        const checkAnimationStatus = () => {
          if (this.data.isAnimating) {
            // 如果仍在动画中，继续等待
            setTimeout(checkAnimationStatus, 300);
          } else {
            // 动画完成后，检查剩余点击次数
            if (this.data.clicksLeft <= 0) {
              // 如果仍然为0，才真正结束游戏
              // 更新历史记录
              this.checkGameEndAndUpdateRecords();
              
              // 显示游戏结束弹框
              this.showGameEndModal();
              
              // 清除存档
              wx.removeStorageSync('tapmeGameState');
            } else {
              // 否则继续游戏
              console.log('连锁反应增加了点击次数，游戏继续！');
              // 保存游戏状态
              this.saveGameState();
            }
          }
        };
        
        // 开始检查
        setTimeout(checkAnimationStatus, 300);
      }
    }, 150);
  },
  
  // 检查并处理连通组
  processConnectedGroups: function(clickedRow, clickedCol) {
    const connectedGroups = this.findAllConnectedGroups();
    
    if (connectedGroups.length > 0) {
      this.setData({
        isAnimating: true
      });
      
      // 依次处理连通组
      this.processNextGroup(connectedGroups, 0, clickedRow, clickedCol);
    }
  },
  
  // 递归处理连通组，一次处理一个
  processNextGroup: function(groups, index, clickedRow, clickedCol) {
    if (index >= groups.length) {
      // 所有连通组都处理完毕，进行下落
      setTimeout(() => {
        this.applyGravity();
      }, 50);
      return;
    }
    
    const group = groups[index];
    
    if (group.length >= 3) {
      // 判断点击的格子是否在连通组中
      let clickedInGroup = false;
      let targetCell = null;
      
      for (const cell of group) {
        if (cell.row === clickedRow && cell.col === clickedCol) {
          clickedInGroup = true;
          targetCell = cell;
          break;
        }
      }
      
      // 如果点击的格子不在连通组中，选择最上/最右的格子作为目标
      if (!clickedInGroup) {
        targetCell = group[0];
        for (const cell of group) {
          if (cell.row > targetCell.row || 
              (cell.row === targetCell.row && cell.col < targetCell.col)) {
            targetCell = cell;
          }
        }
      }
      
      // 筛选出需要清除的格子（不包括目标格子）
      const cellsToClear = group.filter(cell => 
        cell.row !== targetCell.row || cell.col !== targetCell.col
      );
      
      // 计算增加的积分
      const baseValue = this.data.board[targetCell.row][targetCell.col];
      const scoreIncrease = baseValue * cellsToClear.length;
      
      // 显示得分动画
      this.showScorePopup(targetCell.row, targetCell.col, scoreIncrease);
      
      // 增加积分
      this.setData({
        score: this.data.score + scoreIncrease
      });
      
      // 处理格子消除
      let board = this.data.board;
      for (const cell of cellsToClear) {
        board[cell.row][cell.col] = null;
      }
      
      this.setData({
        board: board
      });
      
      // 短暂延迟后增加目标格子的值并处理下一组
      setTimeout(() => {
        // 增加目标格子的值
        let board = this.data.board;
        board[targetCell.row][targetCell.col]++;
        
        // 更新本局游戏中的最大数字
        let maxNumberInGame = this.data.maxNumberInGame;
        if (board[targetCell.row][targetCell.col] > maxNumberInGame) {
          maxNumberInGame = board[targetCell.row][targetCell.col];
        }
        
        // 当出现连通数>=3时，增加计数器的值，但最大为5
        const clicksLeft = Math.min(this.data.clicksLeft + 1, this.data.maxClicks);
        
        this.setData({
          board: board,
          maxNumberInGame: maxNumberInGame,
          clicksLeft: clicksLeft
        });
        
        // 更新点击次数显示
        this.updateClicksDisplay();
        
        // 处理下一个连通组
        setTimeout(() => {
          this.processNextGroup(groups, index + 1, clickedRow, clickedCol);
        }, 50);
      }, 200);
    } else {
      // 如果当前连通组不满足条件，处理下一个
      this.processNextGroup(groups, index + 1, clickedRow, clickedCol);
    }
  },
  
  // 显示得分动画
  showScorePopup: function(row, col, score) {
    // 微信小程序中使用setData来显示动画
    this.setData({
      scorePopup: {
        visible: true,
        row: row,
        col: col,
        score: score
      }
    });
    
    // 淡出动画
    setTimeout(() => {
      this.setData({
        'scorePopup.fadeOut': true
      });
      
      setTimeout(() => {
        this.setData({
          scorePopup: {
            visible: false,
            fadeOut: false
          }
        });
      }, 1000);
    }, 10);
  },
  
  // 应用重力效果（下落）
  applyGravity: function() {
    let hasFalling = false;
    let board = this.data.board;
    
    // 从底部向上处理下落
    for (let col = 0; col < this.data.boardSize; col++) {
      for (let row = this.data.boardSize - 1; row > 0; row--) {
        if (board[row][col] === null) {
          let sourceRow = row - 1;
          while (sourceRow >= 0 && board[sourceRow][col] === null) {
            sourceRow--;
          }
          
          if (sourceRow >= 0) {
            board[row][col] = board[sourceRow][col];
            board[sourceRow][col] = null;
            hasFalling = true;
          }
        }
      }
    }
    
    // 填充顶部空格
    for (let col = 0; col < this.data.boardSize; col++) {
      if (board[0][col] === null) {
        board[0][col] = Math.floor(Math.random() * 5) + 1;
        hasFalling = true;
      }
    }
    
    this.setData({
      board: board
    });
    
    if (hasFalling) {
      // 如果有格子下落，延迟后再次检查
      setTimeout(() => {
        this.applyGravity();
      }, 300);
    } else {
      // 下落完成后检查是否有新的连通组
      this.checkForNewConnectedGroups();
    }
  },
  
  // 下落后检查新连通组
  checkForNewConnectedGroups: function() {
    const newGroups = this.findAllConnectedGroups();
    
    if (newGroups.length > 0) {
      console.log(`下落后发现${newGroups.length}个新连通组`);
      
      // 高亮显示新连通组
      let newConnected = {};
      for (const group of newGroups) {
        for (const cell of group) {
          newConnected[`${cell.row}-${cell.col}`] = true;
        }
      }
      
      this.setData({
        newConnected: newConnected
      });
      
      // 短暂延迟后处理新连通组
      setTimeout(() => {
        this.setData({
          newConnected: {}
        });
        
        // 依次处理连通组
        this.processConnectedGroups(-1, -1);
      }, 400);
    } else {
      // 没有新的连通组，结束动画状态
      this.setData({
        isAnimating: false
      });
      
      // 保存最终状态
      this.saveGameState();
    }
  },
  
  // 查找所有连通组
  findAllConnectedGroups: function() {
    const visited = Array(this.data.boardSize).fill().map(() => Array(this.data.boardSize).fill(false));
    const groups = [];
    
    // 检查每个单元格
    for (let i = 0; i < this.data.boardSize; i++) {
      for (let j = 0; j < this.data.boardSize; j++) {
        if (!visited[i][j] && this.data.board[i][j] !== null) {
          const group = [];
          const value = this.data.board[i][j];
          
          // 使用队列进行广度优先搜索
          const queue = [{row: i, col: j}];
          visited[i][j] = true;
          
          while (queue.length > 0) {
            const cell = queue.shift();
            group.push(cell);
            
            // 检查四个方向
            const directions = [
              {row: cell.row - 1, col: cell.col}, // 上
              {row: cell.row + 1, col: cell.col}, // 下
              {row: cell.row, col: cell.col - 1}, // 左
              {row: cell.row, col: cell.col + 1}  // 右
            ];
            
            for (const dir of directions) {
              const row = dir.row;
              const col = dir.col;
              
              // 检查边界和是否已访问
              if (row >= 0 && row < this.data.boardSize && 
                  col >= 0 && col < this.data.boardSize && 
                  !visited[row][col] && 
                  this.data.board[row][col] === value) {
                
                visited[row][col] = true;
                queue.push({row, col});
              }
            }
          }
          
          if (group.length >= 3) {
            groups.push(group);
          }
        }
      }
    }
    
    return groups;
  },
  
  // 检查是否存在连通组
  hasConnectedGroups: function() {
    return this.findAllConnectedGroups().length > 0;
  },
  
  // 检查游戏是否结束并更新记录
  checkGameEndAndUpdateRecords: function() {
    // 获取历史记录
    const highestNumber = parseInt(this.data.recordHighestNumber);
    const highestScore = parseInt(this.data.recordHighestScore);
    
    // 保存破纪录状态供游戏结束弹框使用
    const isNewNumberRecord = this.data.maxNumberInGame > highestNumber;
    const isNewScoreRecord = this.data.score > highestScore;
    
    // 检查并更新最高数字记录
    if (isNewNumberRecord) {
      wx.setStorageSync('tapmeHighestNumber', this.data.maxNumberInGame);
      this.showNewRecordMessage('新的最高数字记录！');
    }
    
    // 检查并更新最高分记录
    if (isNewScoreRecord) {
      wx.setStorageSync('tapmeHighestScore', this.data.score);
      this.showNewRecordMessage('新的最高积分记录！');
    }
    
    // 更新显示
    this.setData({
      recordHighestNumber: isNewNumberRecord ? this.data.maxNumberInGame : highestNumber,
      recordHighestScore: isNewScoreRecord ? this.data.score : highestScore
    });
    
    return {
      isNewNumberRecord,
      isNewScoreRecord
    };
  },
  
  // 显示新记录消息
  showNewRecordMessage: function(message) {
    wx.showToast({
      title: message,
      icon: 'success',
      duration: 2000
    });
  },
  
  // 显示游戏结束弹框
  showGameEndModal: function() {
    // 准备游戏结束统计数据
    const gameEndStats = {
      score: this.data.score,
      maxNumber: this.data.maxNumberInGame,
      isNewNumberRecord: this.data.maxNumberInGame > this.data.recordHighestNumber,
      isNewScoreRecord: this.data.score > this.data.recordHighestScore
    };
    
    this.setData({
      gameEndStats: gameEndStats,
      modalVisible: true,
      modalType: 'gameEnd',
      modalTitle: '游戏结束'
    });
  },
  
  // 显示确认弹框
  showConfirmModal: function() {
    this.setData({
      modalVisible: true,
      modalType: 'confirm',
      modalTitle: '确定要重新开始游戏吗？',
      modalMessage: '当前游戏进度将丢失。'
    });
  },
  
  // 关闭模态框
  closeModal: function() {
    this.setData({
      modalVisible: false
    });
  },
  
  // 确认模态框
  confirmModal: function() {
    if (this.data.modalType === 'confirm' || this.data.modalType === 'gameEnd') {
      // adController.showRewardedAd(() => {
      //   // 激励广告完整观看后，重置游戏
      //   wx.removeStorageSync('tapmeGameState');
      //   this.initGame();
      // });
      
      wx.removeStorageSync('tapmeGameState');
      this.initGame();
    }
    
    this.closeModal();
  },
  
  // 重新开始游戏
  restartGame: function() {
    this.showConfirmModal();
  },
  
  // 获取格子的样式
  getCellStyle: function(value) {
    if (value === null) return '';
    
    const themeColors = this.data.colors[this.data.theme];
    const color = themeColors[value] || themeColors[1]; // 默认使用1的颜色
    
    return `background-color: ${color}; color: ${this.data.theme === 'dark' ? '#fff' : '#000'};`;
  }
}); 