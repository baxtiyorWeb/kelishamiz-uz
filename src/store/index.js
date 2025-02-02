import { get } from 'lodash';
import { create } from 'zustand';
import api from '../config/auth/api';

const useAuthStore = create((set, getState) => ({
	accessToken: localStorage.getItem('accessToken'),
	refreshToken: localStorage.getItem('refreshToken'),
	isAuthenticated: !!localStorage.getItem('accessToken'), // Token borligini tekshirish

	login: async credentials => {
		try {
			const response = await api.post('/authority/sign-in', credentials);
			const { accessToken, refreshToken } = get(response, 'data.data');

			set({
				accessToken,
				refreshToken,
				isAuthenticated: true,
			});

			localStorage.setItem('accessToken', accessToken);
			localStorage.setItem('refreshToken', refreshToken);

			window.location.href = '/';
		} catch (error) {
			console.error('Login failed', error);
		}
	},

	logout: () => {
		set({
			accessToken: null,
			refreshToken: null,
			isAuthenticated: false,
		});

		localStorage.removeItem('accessToken');
		localStorage.removeItem('refreshToken');

		console.log('Logged out');
		window.location.href = '/login'; // Login sahifasiga yo'naltirish
	},

	refreshAccessToken: async () => {
		try {
			const state = getState(); // useAuthStore.getState() ni to‘g‘ri ishlatish
			if (!state.refreshToken) {
				console.log('No refresh token found, logging out...');
				state.logout();
				return;
			}

			const response = await api.post('/authority/refresh-token', {
				refreshToken: state.refreshToken,
			});

			const newAccessToken = get(response, 'data.accessToken');
			if (!newAccessToken) {
				console.log('Failed to retrieve new access token, logging out...');
				state.logout();
				return;
			}

			set({ accessToken: newAccessToken });
			localStorage.setItem('accessToken', newAccessToken);
			console.log('Access token refreshed');
		} catch (error) {
			console.error('Failed to refresh access token', error);
			if (error.response?.status === 401 || error.response?.status === 403) {
				getState().logout();
			}
		}
	},
}));

export default useAuthStore;
