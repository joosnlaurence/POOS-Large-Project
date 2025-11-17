import { render, screen } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';

import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../../pages/LoginPage';

const renderLoginPage = () => {
    return render(
        <BrowserRouter>
            <LoginPage />
        </BrowserRouter>
    )
};

describe('Render tests for LoginPage', () => {
    beforeEach(() => {
        renderLoginPage();
    });

    test('identifier input with label "Username or Email Address"', () => {
        expect(screen.queryByLabelText("Username or Email Address")).toBeInTheDocument();
    });

    test('password input with label "Password"', () => {
        expect(screen.queryByLabelText('Password')).toBeInTheDocument();
    });

    test('renders login button with label "login"', () => {
        expect(screen.getByRole('button', {name: /login/i})).toBeInTheDocument();
    })

    test('renders title', () => {
        expect(screen.queryByAltText(/Water text logo/i)).toBeInTheDocument();
    });

    test('renders link to "/register"', () => {
        const link = screen.getByRole('link', { name: /register here/i });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', '/register');
    });

    test('renders link to "/reset-password"', () => {
        const link = screen.getByRole('link', { name: /reset it here/i });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', '/reset-password');
    });
});

describe('Test form inputs', () => {
    let user: UserEvent; 
    beforeEach(() => {
        user = userEvent.setup();
        renderLoginPage();
    });

     test('updates all form fields', async () => {
        const loginEle = screen.getByLabelText(/Username or email address/i);
        const passwEle = screen.getByLabelText(/password/i);
        
        await user.type(loginEle, 'jlaure');
        await user.type(passwEle, '1234');
        
        expect(loginEle).toHaveValue('jlaure');
        expect(passwEle).toHaveValue('1234');
    });

    test('does not trim white space for setting input value', async () => {
        const loginEle = screen.getByLabelText(/Username or email address/i);
        const passwEle = screen.getByLabelText(/password/i);
        
        await user.type(loginEle, '  jlaure  ');
        await user.type(passwEle, '  1234  ');
        
        expect(loginEle).toHaveValue('  jlaure  ');
        expect(passwEle).toHaveValue('  1234  ');
    })
}); 

describe('Validation checks', () => {
    let user: UserEvent; 
    beforeEach(() => {
        user = userEvent.setup();
        renderLoginPage();
    });
    
    test('display "blank" error for blank login name', async () => {
        await user.click(screen.getByRole('button', {name: /login/i}));

        expect(screen.getByText(/Please give your username or email/i)).toBeInTheDocument();
    });

    test('display "blank" error for blank password', async () => {
        await user.type(screen.getByLabelText(/username or email address/i), 'a');
        
        await user.click(screen.getByRole('button', {name: /login/i}));

        expect(screen.getByText(/Please give your password/i)).toBeInTheDocument();
    });
});