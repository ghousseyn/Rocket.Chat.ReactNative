import { Component } from 'react';
import { Linking } from 'react-native';
import { Navigation } from 'react-native-navigation';

import store from './lib/createStore';
import { appInit } from './actions';
import { iconsLoaded } from './Icons';
import { registerScreens } from './views';
import { deepLinkingOpen } from './actions/deepLinking';
import parseQuery from './lib/methods/helpers/parseQuery';
import I18n from './i18n';
import { initializePushNotifications } from './push';

const startLogged = () => {
	Navigation.startSingleScreenApp({
		screen: {
			screen: 'RoomsListView',
			title: I18n.t('Messages')
		},
		drawer: {
			left: {
				screen: 'Sidebar'
			}
		},
		animationType: 'fade'
	});
};

const startNotLogged = () => {
	Navigation.startSingleScreenApp({
		screen: {
			screen: 'OnboardingView',
			navigatorStyle: {
				navBarHidden: true
			}
		},
		animationType: 'fade',
		appStyle: {
			orientation: 'portrait'
		}
	});
};

const handleOpenURL = ({ url }) => {
	if (url) {
		url = url.replace(/rocketchat:\/\/|https:\/\/go.rocket.chat\//, '');
		const regex = /^(room|auth)\?/;
		if (url.match(regex)) {
			url = url.replace(regex, '');
			const params = parseQuery(url);
			store.dispatch(deepLinkingOpen(params));
		}
	}
};

registerScreens(store);
iconsLoaded();

export default class App extends Component {
	constructor(props) {
		super(props);
		store.dispatch(appInit());
		store.subscribe(this.onStoreUpdate.bind(this));
		initializePushNotifications();

		Linking
			.getInitialURL()
			.then(url => handleOpenURL({ url }))
			.catch(e => console.warn(e));
		Linking.addEventListener('url', handleOpenURL);
	}

	onStoreUpdate = () => {
		const { root } = store.getState().app;

		if (this.currentRoot !== root) {
			this.currentRoot = root;
			if (root === 'outside') {
				startNotLogged();
			} else if (root === 'inside') {
				startLogged();
			}
		}
	}

	setDeviceToken(deviceToken) {
		this.deviceToken = deviceToken;
	}
}
