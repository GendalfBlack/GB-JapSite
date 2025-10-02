const crypto = require('crypto');

class AuthService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    hashPassword(password) {
        return crypto.createHash('sha256').update(password).digest('hex');
    }

    validateRegisterPayload({ login = '', profileName = '', email = '', password = '', passwordConfirm = '' }) {
        const trimmed = {
            login: login.trim(),
            profileName: profileName.trim(),
            email: email.trim()
        };

        const errors = [];

        if (!trimmed.login || trimmed.login.length < 3) {
            errors.push('Вкажіть логін щонайменше з 3 символів.');
        }

        if (!trimmed.profileName || trimmed.profileName.length < 2) {
            errors.push('Ім\'я профілю має містити щонайменше 2 символи.');
        }

        if (!trimmed.email) {
            errors.push('Вкажіть електронну адресу.');
        } else {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(trimmed.email)) {
                errors.push('Електронна адреса має некоректний формат.');
            }
        }

        if (!password || password.length < 6) {
            errors.push('Пароль має містити щонайменше 6 символів.');
        }

        if (!passwordConfirm) {
            errors.push('Підтвердіть пароль.');
        } else if (password && password !== passwordConfirm) {
            errors.push('Паролі не співпадають.');
        }

        return { trimmed, errors };
    }

    async registerUser(payload) {
        const { trimmed, errors } = this.validateRegisterPayload(payload);

        if (errors.length) {
            return {
                success: false,
                status: 400,
                registerForm: trimmed,
                messages: { registerErrors: errors }
            };
        }

        const userExists = await this.userRepository.existsWithLoginOrEmail(trimmed.login, trimmed.email);

        if (userExists) {
            return {
                success: false,
                status: 409,
                registerForm: trimmed,
                messages: {
                    registerErrors: ['Користувач із таким логіном або електронною адресою вже існує.']
                }
            };
        }

        const passwordHash = this.hashPassword(payload.password);

        await this.userRepository.createUser({
            login: trimmed.login,
            profileName: trimmed.profileName,
            email: trimmed.email,
            passwordHash,
            subscriptionId: null
        });

        return {
            success: true,
            status: 201,
            registerForm: { login: '', profileName: '', email: '' },
            messages: {
                registerSuccess: 'Обліковий запис успішно створено! Тепер ви можете увійти.'
            }
        };
    }

    async loginUser({ identifier = '', password = '' }) {
        const trimmedIdentifier = identifier.trim();
        const errors = [];

        if (!trimmedIdentifier) {
            errors.push('Вкажіть логін або електронну адресу.');
        }

        if (!password) {
            errors.push('Вкажіть пароль.');
        }

        if (errors.length) {
            return {
                success: false,
                status: 400,
                messages: { loginErrors: errors }
            };
        }

        const user = await this.userRepository.findByLoginOrEmail(trimmedIdentifier);

        if (!user) {
            return {
                success: false,
                status: 404,
                messages: { loginErrors: ['Обліковий запис не знайдено.'] }
            };
        }

        const hashedInput = this.hashPassword(password);

        if (user.passwordHash !== hashedInput) {
            return {
                success: false,
                status: 401,
                messages: { loginErrors: ['Невірний пароль.'] }
            };
        }

        const displayName = user.profileName || user.login;

        return {
            success: true,
            user: {
                id: user.id,
                login: user.login,
                profileName: user.profileName,
                subscriptionId: user.subscriptionId,
                email: user.email,
                displayName,
                avatarUrl: '/img/avatar-default.svg'
            },
            status: 200,
            messages: { loginSuccess: `Ласкаво просимо, ${displayName}!` }
        };
    }
}

module.exports = AuthService;
