import React from 'react';
import { render, fireEvent, act, screen } from '@testing-library/react';
import axios from 'axios';
import DiscordAuth from '../components/DiscordOAuth';

jest.mock('axios');
jest.mock('react-oauth-popup', () => (props) => <button onClick={() => props.onCode(null, new URLSearchParams({ code: 'mockCode' }))}>Mock Login</button>);

describe('DiscordAuth component', () => {
  it('renders login button when user is not authenticated', async () => {
    axios.get.mockResolvedValueOnce({ data: { isAuthenticated: false } });

    render(<DiscordAuth onLogin={jest.fn()} />);

    // Wait for axios and useEffect to complete
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(screen.getByText('Mock Login')).toBeInTheDocument();
  });

  it('renders welcome message when user is authenticated', async () => {
    axios.get.mockResolvedValueOnce({ data: { isAuthenticated: true } });
    axios.get.mockResolvedValueOnce({ data: { user: { global_name: 'John' } } });

    render(<DiscordAuth onLogin={jest.fn()} />);

    // Wait for axios and useEffect to complete
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(screen.getByText('Welcome, John')).toBeInTheDocument();
  });
});
