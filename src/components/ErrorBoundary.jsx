import { Component } from "react";
import ErrorPage from "./ErrorPage";

// Catches anything that throws while rendering and shows the themed error page instead of a blank screen.
export default class ErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error, info) {
    console.error("MindSync crashed:", error, info?.componentStack);
  }

  render() {
    if (this.state.failed) {
      return <ErrorPage kind="crash" onRetry={() => this.setState({ failed: false })} />;
    }
    return this.props.children;
  }
}
