// This is an example of a third-party store
// that you might need to integrate with React.

// If your app is fully built with React,
// we recommend using React state instead.

let listeners = [];
let reason = [];

export const rerenderStore = {
	emit() {
		reason = [];
		emitChange();
	},
	subscribe(listener) {
		listeners = [...listeners, listener];
		return () => {
			listeners = listeners.filter((l) => l !== listener);
		};
	},
	getSnapshot() {
		return reason;
	},
};

function emitChange() {
	for (let listener of listeners) {
		listener();
	}
}
