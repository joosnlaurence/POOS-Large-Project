import { render, screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';

import { BrowserRouter } from 'react-router-dom';
import RegisterPage from '../../pages/RegisterPage';

import { 
    kevin,
    registerSuccessResponse,
    registerErrorResponse,
    loginSuccessResponse,
 } from '../handlers';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

const renderRegisterPage = () => {
    return render(
        <BrowserRouter>
            <RegisterPage />
        </BrowserRouter>
    )
};

describe('Register page integration tests', () => {
    let user: UserEvent;
    
    beforeEach(() => {
        user = userEvent.setup();
        mockNavigate.mockReset();
        localStorage.clear();

        renderRegisterPage();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('successful register that stores user data in local storage and navigates to /home', async () => {
        const fetchMock = jest
            .spyOn(global, 'fetch' as any)
            .mockResolvedValueOnce({
                ok: true,
                status: 201,
                json: async () => registerSuccessResponse,
            } as any)
            .mockResolvedValueOnce({
                ok: true,
                status: 201,
                json: async () => loginSuccessResponse,
            } as any);

        await user.type(screen.getByLabelText(/first name/i), kevin.firstName);
        await user.type(screen.getByLabelText(/last name/i), kevin.lastName);
        await user.type(screen.getByLabelText(/username/i), kevin.user);
        await user.type(screen.getByLabelText(/email/i), kevin.email);
        await user.type(screen.getByLabelText(/password/i), kevin.password);

        await user.click(screen.getByRole('button', {name: /register/i}));

        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalledTimes(2);
        });

        const [url, options] = fetchMock.mock.calls[0];
        expect(String(url)).toMatch(/\/api\/users\/register/);

        const body = JSON.parse((options as RequestInit).body as string);
        expect(body).toMatchObject({
            firstName: kevin.firstName,
            lastName: kevin.lastName,
            user: kevin.user,
            email: kevin.email,
            password: kevin.password
        });

        await waitFor(() => {expect(mockNavigate).toHaveBeenCalledWith('/home')});
        
        const userData = JSON.parse(localStorage.getItem('user_data') || '{}');

        expect(userData.id).toBe(kevin._id);
        expect(userData.username).toBe(kevin.user);
        expect(userData.email).toBe(kevin.email);
    });

    test('shows "Username/email already in use" when username/email already exists in DB', async () => {
        const fetchMock = jest
            .spyOn(global, 'fetch' as any)
            .mockResolvedValueOnce({
                ok: true,
                status: 409,
                json: async () => registerErrorResponse,
            } as any);

        await user.type(screen.getByLabelText(/first name/i), kevin.firstName);
        await user.type(screen.getByLabelText(/last name/i), kevin.lastName);
        await user.type(screen.getByLabelText(/username/i), kevin.user);
        await user.type(screen.getByLabelText(/email/i), kevin.email);
        await user.type(screen.getByLabelText(/password/i), kevin.password);

        await user.click(screen.getByRole('button', {name: /register/i}));

        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalledTimes(1);
        });

        const [url, options] = fetchMock.mock.calls[0];
        expect(String(url)).toMatch(/\/api\/users\/register/);

        expect(screen.getByText(/username\/email already in use/i)).toBeInTheDocument();
    });

    test('does not call api if there are validation errors', async () => {
        const fetchMock = jest.spyOn(global, 'fetch' as any).mockResolvedValue({} as any);

        await user.click(screen.getByRole('button', { name: /register/i }));

        expect(await screen.findByText(/first name cannot be blank/i)).toBeInTheDocument();
        expect(screen.getByText(/last name cannot be blank/i)).toBeInTheDocument();
        expect(screen.getByText(/username cannot be blank/i)).toBeInTheDocument();
        expect(screen.getByText(/email cannot be blank/i)).toBeInTheDocument();
        expect(screen.getByText(/password cannot be blank/i)).toBeInTheDocument();

        expect(fetchMock).not.toHaveBeenCalled();
    });
});