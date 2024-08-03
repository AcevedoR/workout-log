export const isDevModeEnabled: boolean = process.env.NODE_ENV && process.env.NODE_ENV != 'production';
console.log("process.env.NODE_ENV: ", process.env.NODE_ENV);

export const appShortDescription = "A simple app to help you log your workout sessions";
export const appDevelopmentInformations = "Hey, this minimalistic app is still in early development, the code source is (until further notice) open source and available here: https://github.com/AcevedoR/workout-log";