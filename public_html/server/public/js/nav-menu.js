(function () {
    const profileMenu = document.querySelector('[data-profile-menu]');

    if (!profileMenu) {
        return;
    }

    const toggle = profileMenu.querySelector('[data-profile-toggle]');
    const closeMenu = () => {
        profileMenu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
    };

    const openMenu = () => {
        profileMenu.classList.add('is-open');
        toggle.setAttribute('aria-expanded', 'true');
    };

    toggle.addEventListener('click', event => {
        event.stopPropagation();
        const isOpen = profileMenu.classList.contains('is-open');
        if (isOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    document.addEventListener('click', event => {
        if (!profileMenu.contains(event.target)) {
            closeMenu();
        }
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            closeMenu();
            toggle.focus();
        }
    });
})();
