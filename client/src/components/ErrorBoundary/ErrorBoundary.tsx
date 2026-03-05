import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container text-center py-5">
          <h2>Noe gikk galt</h2>
          <p className="text-muted">Last siden på nytt for å prøve igjen.</p>
          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Last siden på nytt
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
