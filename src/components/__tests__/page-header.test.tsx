import React from 'react';
import { render, screen } from '@testing-library/react';
import { PageHeader } from '@/components/page-header';

describe('PageHeader', () => {
  it('renders the title', () => {
    render(<PageHeader title="Test Title" />);
    
    // Check if the heading with the title is in the document
    const titleElement = screen.getByRole('heading', { name: /test title/i });
    expect(titleElement).toBeInTheDocument();
  });

  it('renders children when provided', () => {
    render(
      <PageHeader title="Test Title">
        <button>Click Me</button>
      </PageHeader>
    );

    // Check if the child button is rendered
    const buttonElement = screen.getByRole('button', { name: /click me/i });
    expect(buttonElement).toBeInTheDocument();
  });

  it('does not render the children container if no children are provided', () => {
    render(<PageHeader title="Test Title" />);
    
    // The button should not be there
    const buttonElement = screen.queryByRole('button');
    expect(buttonElement).not.toBeInTheDocument();
  });
});
