import React from 'react';
import Icon from '../icons/Icon';
import styles from './ErrorBoundary.module.css';

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
        <div className={styles['error-container']}>
          <div className={styles['error-card']}>
            <div className={styles['error-icon']}>
              <Icon name="triangle-exclamation" />
            </div>
            <h2 className={styles['error-title']}>Noe gikk galt</h2>
            <p className={styles['error-message']}>Last siden på nytt for å prøve igjen.</p>
            <button
              className={styles['error-button']}
              onClick={() => window.location.reload()}
            >
              Last siden på nytt
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
