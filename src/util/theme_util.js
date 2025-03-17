export const darkMode = (theme) => {
    if (theme === "dark") return true;
    if (theme === "light") return false;
    const now = new Date()
    const currentHour = now.getHours();
    const isDayTime = currentHour >= 6 && currentHour < 18; // Example: 6 AM to 6 PM is daytime
    return !isDayTime;
};