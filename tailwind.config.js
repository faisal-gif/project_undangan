import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
                heading: ['Fraunces', ...defaultTheme.fontFamily.serif],
            },
            colors: {
                ati: {
                    ink: '#12060A',
                    wine: '#2A0B12',
                    maroon: '#7A0F1F',
                    gold: '#D6A249',
                    'gold-light': '#F0D28C',
                    cream: '#F7EDE0',
                },
            },
        },
    },

    plugins: [require('daisyui')],
};
