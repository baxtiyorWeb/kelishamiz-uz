export const useGenerateUuid = () => {
	const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
	const letters = [
		'a',
		'b',
		'c',
		'd',
		'e',
		'f',
		'g',
		'h',
		'i',
		'j',
		'k',
		'l',
		'm',
		'n',
		'o',
		'p',
		'q',
		'r',
		's',
		't',
		'u',
		'v',
		'w',
		'x',
		'y',
		'z',
	];
	const symbols = ['!', '@', '#', '$', '%', '^', '&', '*', '(', '_', '+'];

	const generateUuid = (length = 16) => {
		const allCharacters = [
			...numbers,
			...letters,
			...letters.map(l => l.toUpperCase()),
			...symbols,
		];
		let uuid = '';

		for (let i = 0; i < length; i++) {
			const randomIndex = Math.floor(Math.random() * allCharacters.length);
			uuid += allCharacters[randomIndex];
		}

		return uuid;
	};

	return { generateUuid };
};
