// 分数管理模块
const Scores = {
    // 获取用户数据
    getUserData(username) {
        const users = Auth.getUsers();
        return users[username] || null;
    },

    // 获取指定模式的最高分
    getHighScore(username, mode) {
        const userData = this.getUserData(username);
        if (!userData) return 0;
        return userData.scores[mode] || 0;
    },

    // 获取所有模式的最高分
    getAllHighScores(username) {
        const userData = this.getUserData(username);
        if (!userData) return { easy: 0, normal: 0, hard: 0 };
        return userData.scores;
    },

    // 更新最高分（如果新分数更高）
    updateHighScore(username, mode, score) {
        const users = Auth.getUsers();
        if (!users[username]) return false;

        const currentHighScore = users[username].scores[mode] || 0;

        if (score > currentHighScore) {
            users[username].scores[mode] = score;
            Auth.saveUsers(users);
            return true; // 返回 true 表示打破了记录
        }

        return false; // 返回 false 表示没有打破记录
    },

    // 检查是否打破记录
    isHighScore(username, mode, score) {
        const currentHighScore = this.getHighScore(username, mode);
        return score > currentHighScore;
    },

    // 获取鼓励消息
    getEncourageMessage() {
        const messages = [
            '继续加油，你一定能突破记录！',
            '差一点点就破纪录了，再试一次！',
            '别灰心，下次一定行！',
            '再接再厉，胜利就在眼前！',
            '失败是成功之母，继续努力！'
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    },

    // 获取恭喜消息
    getCelebrateMessage() {
        const messages = [
            '恭喜！你打破了该模式的最高记录！',
            '太棒了！新纪录诞生！',
            '不可思议！你创造了新记录！',
            '太厉害了！无人能敌！',
            '王者归来！新纪录达成！'
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    }
};
