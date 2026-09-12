import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import Incidents from '@modules/helpdesk/pages/incidents/Incidents';
import type { Incident } from '@modules/helpdesk/services/incidents/incidentApi';

vi.mock('@shared/store/apiEndpoints', () => ({
  useListIncidentsQuery: vi.fn(),
}));

vi.mock('@core/auth/useAuth', () => ({
  useAuth: () => ({
    user: { role: 'agent', permissions: ['*'] },
    tenant: null,
    modules: ['helpdesk'],
    loading: false,
    hasPermission: () => true,
    hasModule: () => true,
    hasAnyPermission: () => true,
    refreshModules: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

import { useListIncidentsQuery } from '@shared/store/apiEndpoints';

const mockedUseListIncidentsQuery = vi.mocked(useListIncidentsQuery);

function queryReturn(overrides: Partial<ReturnType<typeof useListIncidentsQuery>>) {
  return {
    data: undefined,
    isLoading: false,
    isError: false,
    error: undefined,
    refetch: vi.fn(),
    ...overrides,
  } as ReturnType<typeof useListIncidentsQuery>;
}

function makeIncident(overrides: Partial<Incident> = {}): Incident {
  return {
    _id: '1',
    title: 'Login broken',
    description: '',
    status: 'open',
    priority: 'critical',
    impact: 'high',
    createdAt: new Date().toISOString(),
    ...overrides,
  } as Incident;
}

describe('Incidents page (RTK Query hook)', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'tok');
    localStorage.setItem('user', JSON.stringify({ role: 'agent' }));
    mockedUseListIncidentsQuery.mockReset();
  });
  afterEach(() => {
    cleanup();
  });

  it('renders incidents returned by useListIncidentsQuery', () => {
    mockedUseListIncidentsQuery.mockReturnValue(
      queryReturn({ data: { incidents: [makeIncident()] } }),
    );

    render(<Incidents />);

    expect(screen.getByText('Incidents')).toBeInTheDocument();
    expect(screen.getByText('Login broken')).toBeInTheDocument();
    expect(mockedUseListIncidentsQuery).toHaveBeenCalled();
  });

  it('shows a loading state while isLoading', () => {
    mockedUseListIncidentsQuery.mockReturnValue(queryReturn({ isLoading: true }));

    render(<Incidents />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('shows a permission message when the list returns 403', () => {
    mockedUseListIncidentsQuery.mockReturnValue(
      queryReturn({ isError: true, error: { status: 403 } as never }),
    );

    render(<Incidents />);

    expect(
      screen.getByText('You do not have permission to view incidents.'),
    ).toBeInTheDocument();
  });

  it('shows a retry message on other failures', () => {
    mockedUseListIncidentsQuery.mockReturnValue(
      queryReturn({ isError: true, error: { status: 500 } as never }),
    );

    render(<Incidents />);

    expect(
      screen.getByText('Unable to load incidents. Please retry.'),
    ).toBeInTheDocument();
  });

  it('shows "No incidents" for an empty list', () => {
    mockedUseListIncidentsQuery.mockReturnValue(queryReturn({ data: { incidents: [] } }));

    render(<Incidents />);

    expect(screen.getByText('No incidents')).toBeInTheDocument();
  });
});