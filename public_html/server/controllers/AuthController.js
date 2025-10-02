class AuthController {
    constructor(authService) {
        this.authService = authService;

        this.showRegister = this.showRegister.bind(this);
        this.register = this.register.bind(this);
        this.login = this.login.bind(this);
        this.logout = this.logout.bind(this);
    }

    renderRegisterPage(res, options = {}) {
        const { status = 200, registerForm = {}, messages = {} } = options;

        const defaultForm = {
            login: '',
            profileName: '',
            email: ''
        };

        const defaultMessages = {
            registerErrors: [],
            registerSuccess: null,
            loginErrors: [],
            loginSuccess: null
        };

        res.status(status).render('register', {
            active: 'auth',
            registerForm: { ...defaultForm, ...registerForm },
            messages: { ...defaultMessages, ...messages }
        });
    }

    showRegister(req, res) {
        this.renderRegisterPage(res);
    }

    async register(req, res) {
        try {
            const result = await this.authService.registerUser(req.body);

            if (!result.success) {
                return this.renderRegisterPage(res, result);
            }

            return this.renderRegisterPage(res, result);
        } catch (error) {
            console.error('Error registering user:', error);
            return this.renderRegisterPage(res, {
                status: 500,
                registerForm: {
                    login: req.body.login || '',
                    profileName: req.body.profileName || '',
                    email: req.body.email || ''
                },
                messages: {
                    registerErrors: ['Сталася помилка під час створення акаунта. Спробуйте ще раз пізніше.']
                }
            });
        }
    }

    async login(req, res) {
        try {
            const result = await this.authService.loginUser(req.body);

            if (!result.success) {
                return this.renderRegisterPage(res, result);
            }

            req.session.user = result.user;
            res.locals.currentUser = result.user;
            if (result.messages && result.messages.loginSuccess) {
                req.session.loginSuccess = result.messages.loginSuccess;
            }
            return res.redirect('/profile');
        } catch (error) {
            console.error('Error logging in user:', error);
            return this.renderRegisterPage(res, {
                status: 500,
                messages: {
                    loginErrors: ['Сталася помилка під час входу. Спробуйте ще раз пізніше.']
                }
            });
        }
    }

    logout(req, res) {
        req.session.destroy(error => {
            if (error) {
                console.error('Error destroying session during logout:', error);
            }
            res.redirect('/');
        });
    }
}

module.exports = AuthController;
