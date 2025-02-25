/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			colors: {
				textColor: '#fff',
				btnColor: '#FFBE1E',
				btnDarkColor: '#000',
				textDarkColor: '000',
				textPrimaryColor: '#959EA7',
			},
		},
	},
	plugins: [],
};
