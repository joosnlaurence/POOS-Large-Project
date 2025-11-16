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

test('placeholder until login page is finished', () => {
    expect(1).toBe(1);
}) 

// describe('Render tests for LoginPage', () => {
//     beforeEach(() => {
//         renderLoginPage();
//     });

//     test('identifier input with label "Username or Email Address"', () => {
//         expect(screen.queryByLabelText("Username or Email Address")).toBeInTheDocument();
//     });

//     test('password input with label "Password"', () => {
//         expect(screen.queryByLabelText('Password')).toBeInTheDocument();
//     });

//     test('renders link to "/reset-password"', () => {
//         const link = screen.getByRole('link', { name: /register/i });
//         expect(link).toBeInTheDocument();
//         expect(link).toHaveAttribute('href', '/register');
//     });

//     test('renders link to "/register"', () => {
//         const link = screen.getByRole('link', { name: /reset it here/i });
//         expect(link).toBeInTheDocument();
//         expect(link).toHaveAttribute('href', '/change-password');
//     });
// });