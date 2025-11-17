import { render, screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../../pages/LoginPage'; 

import {
    kevin,
    loginSuccessResponse,
    loginErrorResponse,
} from '../handlers';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

const renderLoginPage = () => {
    return render(
        <BrowserRouter>
            <LoginPage />
        </BrowserRouter>,
    );
};

describe('LoginPage integration tests', () => {
    let user: UserEvent;

    beforeEach(() => {
        user = userEvent.setup();
        mockNavigate.mockReset();
        localStorage.clear();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('successful login stores user data in localStorage and navigates to /home', async () => {
        const fetchMock = jest
            .spyOn(global, 'fetch' as any)
            .mockResolvedValueOnce({
                ok: true,
                status: 201,
                json: async () => loginSuccessResponse,
            } as any);

        renderLoginPage();

        await user.type(screen.getByLabelText(/username or email address/i), kevin.user);
        await user.type(screen.getByLabelText(/password/i), kevin.password);

        await user.click(
            screen.getByRole('button', { name: /login/i }),
        );

        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalledTimes(1);
        });

        const [url, options] = fetchMock.mock.calls[0];
        expect(String(url)).toMatch(/\/api\/users\/login/);

        const body = JSON.parse((options as RequestInit).body as string);
        expect(body).toMatchObject({ident: kevin.user, password: kevin.password});

        await waitFor(() => {expect(mockNavigate).toHaveBeenCalledWith('/home')});

        const userData = JSON.parse(localStorage.getItem('user_data') || '{}');

        expect(userData.id).toBeDefined();
        expect(userData.username).toBe(kevin.user);
        expect(userData.email).toBe(kevin.email);
    });

    test('shows error for invalid username/password', async () => {
        const fetchMock = jest
            .spyOn(global, 'fetch' as any)
            .mockResolvedValueOnce({
                ok: false,
                status: 401,
                json: async () => loginErrorResponse,
            } as any);

        renderLoginPage();

        await user.type(screen.getByLabelText(/username or email address/i), 'wronguser');
        await user.type(screen.getByLabelText(/password/i), 'wrongpassword');

        await user.click(screen.getByRole('button', { name: /login/i }));

        await waitFor(() => {expect(fetchMock).toHaveBeenCalledTimes(1)});

        expect(await screen.findByText(/login\/password combination incorrect/i)).toBeInTheDocument();

        expect(mockNavigate).not.toHaveBeenCalled();
    });
});
