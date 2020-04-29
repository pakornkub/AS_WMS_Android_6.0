self.addEventListener('activate', function (event) {
	console.log('activate==',event);
});

self.addEventListener('fetch', function (event) {
	// console.log('fetch==',event);
});

self.addEventListener('push', function (event) {
	console.log('push==',event);
});

