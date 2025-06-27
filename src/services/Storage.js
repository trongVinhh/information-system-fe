export const storeUserData = (data)=>{
    localStorage.setItem('idToken',data.session.access_token);
    localStorage.setItem('userId',data.session.user.email);
}

export const getUserData = ()=>{
    return localStorage.getItem('idToken');
}

export const getUserId = ()=>{
    return localStorage.getItem('userId');
}

export const removeUserData = ()=>{
     localStorage.removeItem('idToken')
}