export const app_name = '4lokofridays.com';
export function buildPath(route: string): string {
    if(route[0] === '/') {
        route = route.substring(1);
    }

    if(import.meta.env.MODE != 'development'){
        return `https://${app_name}/${route}`;
    }
    else{
        return `http://localhost:5000/${route}`;
    }
}