const cleanUserLess = (user) => {
  if (user.permissions) user.permissions = undefined;
  if (user.wishlistIds) user.wishlistIds = undefined;
  if (user.followStoreIds) user.followStoreIds = undefined;
  if (user.refreshToken) user.refreshToken = undefined;
  if (user.passwordChangedAt) user.passwordChangedAt = undefined;
  if (user.passwordResetToken) user.passwordResetToken = undefined;
  if (user.passwordResetExpires) user.passwordResetExpires = undefined;
  user.password = undefined;
  user.addressIds = undefined;
  user.eWallet = undefined;
  // user.cart = undefined;

  if (user.email) user.email = user.email.slice(0, 6) + '******';
  if (user.phone) user.phone = '*******' + user.phone.slice(-3);

  return user;
};

const cleanUserMore = (user) => {
  if (user.permissions) user.permissions = undefined;
  if (user.refreshToken) user.refreshToken = undefined;
  if (user.passwordChangedAt) user.passwordChangedAt = undefined;
  if (user.passwordResetToken) user.passwordResetToken = undefined;
  if (user.passwordResetExpires) user.passwordResetExpires = undefined;
  user.password = undefined;

  return user;
};

module.exports = { cleanUserLess, cleanUserMore };
