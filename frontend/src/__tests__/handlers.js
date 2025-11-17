export const kevin = {
    _id: '507f1f77bcf86cd799439011',
    user: 'kevinbevin',
    email: 'kevinbevin@gmail.com',
    firstName: 'Kevin',
    lastName: 'Bevin',
    password: '1006',
    isVerified: true,
};

export const loginSuccessResponse = {
    ...kevin,
    accessToken: 'test-access-token-for-kevin',
    success: true,
    error: '',
};

export const loginErrorResponse = {
    success: false, 
    error: 'Login/Password combination incorrect',
};

export const registerSuccessResponse = {
    userId: kevin._id,
    success: true,
    error: '',
};

export const registerErrorResponse = {
    userId: -1,
    success: false,
    error: 'Username/email already in use'
}

