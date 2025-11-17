import { render, screen } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';

import { BrowserRouter } from 'react-router-dom';
import RegisterPage from '../../pages/RegisterPage';

const renderRegisterPage = () => {
    return render(
        <BrowserRouter>
            <RegisterPage />
        </BrowserRouter>
    )
};

describe('Render tests for RegisterPage', () => {
    beforeEach(() => {
        renderRegisterPage();
    })

    test('renders the form inputs and submit button', () => {
        expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
    });

    test('renders header and description', () => {
        expect(screen.getByText(/Register a New User/i)).toBeInTheDocument();
        expect(screen.getByText(/Your email will be sent a verification link/i)).toBeInTheDocument();
    });

    test('renders link to login page', () => {
        const link = screen.getByRole('link', { name: /return to login/i });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', '/login');
    });
});

describe('Test form inputs', () => {
    let user: UserEvent; 
    beforeEach(() => {
        user = userEvent.setup();
        renderRegisterPage();
    });

    test('updates all form fields', async () => {
        const fnameEle = screen.getByLabelText(/First Name/i);
        const lnameEle = screen.getByLabelText(/Last Name/i);
        const unameEle = screen.getByLabelText(/Username/i);
        const emailEle = screen.getByLabelText(/email address/i);
        const passwEle = screen.getByLabelText(/password/i);
        
        await user.type(fnameEle, 'Jason');
        await user.type(lnameEle, 'Laureano');
        await user.type(unameEle, 'jlaure');
        await user.type(emailEle, 'jasons@email.com');
        await user.type(passwEle, '1234');
        
        expect(fnameEle).toHaveValue('Jason');
        expect(lnameEle).toHaveValue('Laureano');
        expect(unameEle).toHaveValue('jlaure');
        expect(emailEle).toHaveValue('jasons@email.com');
        expect(passwEle).toHaveValue('1234');
    });

    test('trims white space from name, username, and email', async () => {
        const fnameEle = screen.getByLabelText(/First Name/i);
        const lnameEle = screen.getByLabelText(/Last Name/i);
        const unameEle = screen.getByLabelText(/Username/i);
        const emailEle = screen.getByLabelText(/email address/i);
        
        await user.type(fnameEle, '  Jason  ');
        await user.type(lnameEle, '  Laureano  ');
        await user.type(unameEle, '  jlaure  ');
        await user.type(emailEle, '  jasons@email.com  ');
        
        expect(fnameEle).toHaveValue('Jason');
        expect(lnameEle).toHaveValue('Laureano');
        expect(unameEle).toHaveValue('jlaure');
        expect(emailEle).toHaveValue('jasons@email.com');
    });

    test('doesn\'t trim password field', async () => {
        const passwEle = screen.getByLabelText(/password/i);
        await user.type(passwEle, '1234');
        expect(passwEle).toHaveValue('1234');
    });
})

describe('Validation checking', () => {
    let user: UserEvent; 
    beforeEach(() => {
        user = userEvent.setup();
        renderRegisterPage();
    });

    test('errors shown when first/last/user name, email, and password are empty', async () => {
        await user.click(screen.getByRole('button', { name: /register/i }));

        expect(await screen.findByText(/first name cannot be blank/i)).toBeInTheDocument();
        expect(await screen.findByText(/last name cannot be blank/i)).toBeInTheDocument();
        expect(await screen.findByText(/username cannot be blank/i)).toBeInTheDocument();
        expect(await screen.findByText(/email cannot be blank/i)).toBeInTheDocument();
        expect(await screen.findByText(/password cannot be blank/i)).toBeInTheDocument();
    });

    test('error shown when password is all spaces', async () => {
        await user.click(screen.getByRole('button', { name: /register/i }));
        expect(await screen.findByText(/password cannot be blank/i)).toBeInTheDocument();
    });

    test('error shown when email is invalid', async () => {
        await user.type(screen.getByLabelText(/email address/i), 'jasonlaureano');
        await user.click(screen.getByRole('button', { name: /register/i }));
        
        expect(await screen.findByText(/invalid email address format/i)).toBeInTheDocument();
    });


    test('validation errors cleared fields are correct', async () => {
        await user.click(screen.getByRole('button', { name: /register/i }));
        expect(await screen.findByText(/first name cannot be blank/i)).toBeInTheDocument();
        expect(await screen.findByText(/last name cannot be blank/i)).toBeInTheDocument();
        expect(await screen.findByText(/username cannot be blank/i)).toBeInTheDocument();
        expect(await screen.findByText(/email cannot be blank/i)).toBeInTheDocument();
        
        await user.type(screen.getByLabelText(/First Name/i), 'Jason');
        await user.type(screen.getByLabelText(/Last Name/i), 'Laureano');
        await user.type(screen.getByLabelText(/Username/i), 'jlaure');
        await user.type(screen.getByLabelText(/email address/i), 'jasons@email.com');

        await user.click(screen.getByRole('button', { name: /register/i }));

        expect(screen.queryByText(/first name cannot be blank/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/last name cannot be blank/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/username cannot be blank/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/email cannot be blank/i)).not.toBeInTheDocument();
    });
});