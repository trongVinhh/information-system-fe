// Lưu user data vào localStorage với thời gian hết hạn (1 giờ)
export const storeUserData = (data) => {
  const expiresAt = Date.now() + 60 * 60 * 1000; // 1 giờ = 3600000 ms

  localStorage.setItem("idToken", data.session.access_token);
  localStorage.setItem("userId", data.session.user.email);
  localStorage.setItem("expiresAt", expiresAt.toString());
};

// Lấy token nếu chưa hết hạn
export const getUserData = () => {
  const expiresAt = parseInt(localStorage.getItem("expiresAt") || "0", 10);
  if (Date.now() > expiresAt) {
    removeUserData();
    return null;
  }
  return localStorage.getItem("idToken");
};

// Lấy userId nếu chưa hết hạn
export const getUserId = () => {
  const expiresAt = parseInt(localStorage.getItem("expiresAt") || "0", 10);
  if (Date.now() > expiresAt) {
    removeUserData();
    return null;
  }
  return localStorage.getItem("userId");
};

// Xóa toàn bộ thông tin người dùng
export const removeUserData = () => {
  localStorage.removeItem("idToken");
  localStorage.removeItem("userId");
  localStorage.removeItem("expiresAt");
};
