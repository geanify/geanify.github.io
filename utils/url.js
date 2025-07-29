// Get the base URL with proper fallback
const getBaseUrl = () => {
    if (process.env.BASE_URL && process.env.BASE_URL !== 'undefined') {
        return process.env.BASE_URL;
    }
    const host = process.env.HOST || 'localhost';
    const port = process.env.PORT || 3000;
    return `http://${host}:${port}`;
};

module.exports = {
    getBaseUrl
}; 