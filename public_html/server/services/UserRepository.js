class UserRepository {
    constructor(pool) {
        this.pool = pool;
    }

    async findByLoginOrEmail(identifier) {
        const [rows] = await this.pool.query(
            'SELECT id, login, profile_name AS profileName, password_hash AS passwordHash, subscription_id AS subscriptionId FROM users WHERE login = ? OR email = ? LIMIT 1',
            [identifier, identifier]
        );
        return rows[0] || null;
    }

    async existsWithLoginOrEmail(login, email) {
        const [rows] = await this.pool.query(
            'SELECT id FROM users WHERE login = ? OR email = ? LIMIT 1',
            [login, email]
        );
        return rows.length > 0;
    }

    async createUser({ login, profileName, email, passwordHash, subscriptionId }) {
        await this.pool.query(
            `INSERT INTO users (login, profile_name, email, password_hash, subscription_id, is_admin)
             VALUES (?, ?, ?, ?, ?, 0)`,
            [login, profileName, email, passwordHash, subscriptionId || null]
        );
    }
}

module.exports = UserRepository;
