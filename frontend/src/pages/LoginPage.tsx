import Login from '../components/Login.tsx';
import { PageTransition } from '../components/PageTransition.tsx';

const LoginPage = () =>
{
    return(
        <PageTransition>
            <div>
                <Login/>
            </div>
        </PageTransition>
    );
};

export default LoginPage;