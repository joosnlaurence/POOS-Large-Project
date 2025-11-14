import 'dotenv/config'

export const app_name = '4lokofridays.com';
export function buildPath(route) {
    if(process.env.NODE_ENV != 'development'){
        return `https://${app_name}/${route}`;
    }
    else{
        return `http://localhost:5000/${route}`;
    }
}