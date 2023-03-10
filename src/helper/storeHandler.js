const cleanStore = (store) => {
  if (!store) return undefined;

  store.ownerId = undefined;
  store.eWallet = undefined;
  return store;
};

module.exports = { cleanStore };
