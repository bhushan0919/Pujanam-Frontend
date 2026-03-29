const authStorage = {
// Save auth data (token + user)
setAuth: (role, data) => {
if (!role || !data?.token) return;


localStorage.setItem(`${role}_token`, data.token);

// user object can be named differently (admin, pandit, customer)
const userData = data.user || data.admin || data.pandit || data.customer;

if (userData) {
  localStorage.setItem(`${role}_user`, JSON.stringify(userData));
}

},

// Get token
getToken: (role) => {
return localStorage.getItem(`${role}_token`);
},

// Get user
getUser: (role) => {
const user = localStorage.getItem(`${role}_user`);
return user ? JSON.parse(user) : null;
},

// Remove specific role (logout)
logout: (role) => {
localStorage.removeItem(`${role}_token`);
localStorage.removeItem(`${role}_user`);
},

// Clear everything (full logout)
clearAll: () => {
localStorage.clear();
}
};

export default authStorage;
