import RegisterPage from '../pages/auth/register/register-page';
import LoginPage from '../pages/auth/login/login-page';
import HomePage from '../pages/home/home-page';
import ReportDetailPage from '../pages/story-detail/story-detail-page';
import NewPage from '../pages/new/new-page';
import addPage from '../pages/add-story/add-story-page';
import BookmarkPage from '../pages/bookmark/bookmark-page';
import { checkAuthenticatedRoute, checkUnauthenticatedRouteOnly } from '../utils/auth';

export const routes = {
  '/login': () => checkUnauthenticatedRouteOnly(new LoginPage()),
  '/register': () => checkUnauthenticatedRouteOnly(new RegisterPage()),
  '/add-story': () => checkUnauthenticatedRouteOnly(new addPage()),

  '/': () => checkAuthenticatedRoute(new HomePage()),
  '/new': () => checkAuthenticatedRoute(new NewPage()),
  '/bookmark': () => checkAuthenticatedRoute(new BookmarkPage()),
  '/story/:id': () => checkAuthenticatedRoute(new ReportDetailPage()),
};
