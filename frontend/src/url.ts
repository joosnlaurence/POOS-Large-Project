export const app_name = '4lokofridays.com';
export function buildPath(route: string): string {
    if(import.meta.env.MODE != 'development'){
        return `https://${app_name}/${route}`;
    }
    else{
        console.log("localhost");
        return `http://localhost:5000/${route}`;
    }
}