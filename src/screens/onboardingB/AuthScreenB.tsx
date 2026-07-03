// Auth screen for variant B currently reuses the control implementation because
// the auth flow is business-critical (real signup, PostHog identify, etc.).
// When variant B needs a different auth UI, replace this export with a full impl.
export { AuthScreen as AuthScreenB } from '../onboarding/AuthScreen';
