module.exports = {
    mode: "jit",
    purge: ["./src/**/*.{js,jsx,ts,tsx}"],
    darkMode: "media",
    theme: {
        extend: {},
    },
    plugins: [
        require('daisyui'),
        require("@tailwindcss/typography")
    ],
    daisyui: {
        styled: true,
        themes: [
            'light',
            'dracula',
            'halloween'
        ],
        base: true,
        utils: true,
        logs: true,
        rtl: false,
    },
}