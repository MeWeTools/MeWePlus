// Remove caching of purchased items
Object.keys(localStorage).forEach(key => {
	if (key.startsWith("purchaseStore")) localStorage.removeItem(key);
});
