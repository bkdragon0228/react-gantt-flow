import plugin from "tailwindcss/plugin";

/** @type {import('tailwindcss').Config} */
module.exports = {
    // prefix: "gantt-",
    important: true,
    content: ["./src/**/*.{js,jsx,ts,tsx,html}"],
    // plugins: [
    //     plugin(function ({ addUtilities }) {
    //         addUtilities({
    //             ".scrollbar-hide": {
    //                 /* Firefox */
    //                 "scrollbar-width": "none",
    //                 /* IE and Edge */
    //                 "-ms-overflow-style": "none",
    //                 /* Chrome, Safari and Opera */
    //                 "&::-webkit-scrollbar": {
    //                     display: "none",
    //                 },
    //             },
    //         });
    //     }),
    // ],
    // theme: {
    //     extend: {
    //         animation: {
    //             "spin-fast": "spin 0.6s linear infinite",
    //         },
    //     },
    // },
};
