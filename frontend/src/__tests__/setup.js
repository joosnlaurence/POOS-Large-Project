import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import 'whatwg-fetch';

Object.assign(globalThis, {
    TextEncoder,
    TextDecoder,
});

jest.mock('../url.ts', () => ({
    buildPath: (path) => `http://localhost:5000/${path}`,
}));
