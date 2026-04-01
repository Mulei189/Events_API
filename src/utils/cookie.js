export const cookies = {
    getOptions: () => ({
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 15 * 60 * 1000, // 15 minutes
    }),
    setCookie:(res, name, value, options = {}) => {
        res.cookie(name, value, {...cookies.getOptions(), ...options})
    },
    clearCookie: (res, name, value, options = {}) => {
        res.clearCookie(name, value, {...cookies.getOptions(), ...options})
    },
    get: (req, name) => req.cookies[name],
}