// 用户认证模块
const Auth = {
    // 简单哈希函数（仅用于演示，生产环境应使用更安全的方式）
    hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(16);
    },

    // 获取所有用户
    getUsers() {
        const users = localStorage.getItem('snakeUsers');
        return users ? JSON.parse(users) : {};
    },

    // 保存用户数据
    saveUsers(users) {
        localStorage.setItem('snakeUsers', JSON.stringify(users));
    },

    // 获取当前用户
    getCurrentUser() {
        return localStorage.getItem('snakeCurrentUser');
    },

    // 设置当前用户
    setCurrentUser(username) {
        localStorage.setItem('snakeCurrentUser', username);
    },

    // 清除当前用户（登出）
    clearCurrentUser() {
        localStorage.removeItem('snakeCurrentUser');
    },

    // 注册用户
    register(username, password) {
        if (!username || !password) {
            return { success: false, message: '用户名和密码不能为空' };
        }

        if (username.length < 2 || username.length > 20) {
            return { success: false, message: '用户名长度需在2-20个字符之间' };
        }

        const users = this.getUsers();

        if (users[username]) {
            return { success: false, message: '用户名已存在' };
        }

        users[username] = {
            password: this.hashPassword(password),
            scores: {
                easy: 0,
                normal: 0,
                hard: 0
            }
        };

        this.saveUsers(users);
        this.setCurrentUser(username);

        return { success: true, message: '注册成功' };
    },

    // 登录
    login(username, password) {
        if (!username || !password) {
            return { success: false, message: '用户名和密码不能为空' };
        }

        const users = this.getUsers();
        const user = users[username];

        if (!user) {
            return { success: false, message: '用户不存在' };
        }

        if (user.password !== this.hashPassword(password)) {
            return { success: false, message: '密码错误' };
        }

        this.setCurrentUser(username);
        return { success: true, message: '登录成功' };
    },

    // 登出
    logout() {
        this.clearCurrentUser();
    },

    // 检查是否已登录
    isLoggedIn() {
        return this.getCurrentUser() !== null;
    }
};
