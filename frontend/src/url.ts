export const app_name = '4lokofridays.com';
export function buildPath(route: string): string {
    if(import.meta.env.MODE != 'development')
        return `http://${app_name}/${route}`;
    else
        return `http://localhost:5000/${route}`;
}