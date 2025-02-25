import { useEffect, useState } from 'react';

const useDebounced = (value, delay = 5000) => {
	const [debouncedValue, setDebouncedValue] = useState(value, delay);

	useEffect(() => {
		const timeout = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		return () => clearTimeout(timeout);
	}, [value, delay]);

	return debouncedValue;
};

export default useDebounced;
