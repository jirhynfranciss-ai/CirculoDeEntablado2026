import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

// Layouts
import PublicLayout from './components/layout/PublicLayout';
import AdminLayout from './components/layout/AdminLayout';

// Public Pages
import HomePage from './pages/public/HomePage';
import OurStoryPage from './pages/public/OurStoryPage';
import MissionVisionPage from './pages/public/MissionVisionPage';
import MembersPage from './pages/public/MembersPage';
import OfficersPage from './pages/public/OfficersPage';
import AchievementsPage from './pages/public/AchievementsPage';
import ShowsPage from './pages/public/ShowsPage';
import ShowArchivesPage from './pages/public/ShowArchivesPage';
import PhotoGalleryPage from './pages/public/PhotoGalleryPage';
import VideoGalleryPage from './pages/public/VideoGalleryPage';
import PressReviewsPage from './pages/public/PressReviewsPage';
import ContactPage from './pages/public/ContactPage';

// Admin Pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMembers from './pages/admin/AdminMembers';
import AdminOfficers from './pages/admin/AdminOfficers';
import AdminAchievements from './pages/admin/AdminAchievements';
import AdminProductions from './pages/admin/AdminProductions';
import AdminPhotos from './pages/admin/AdminPhotos';
import AdminVideos from './pages/admin/AdminVideos';
import AdminPressReviews from './pages/admin/AdminPressReviews';
import AdminMessages from './pages/admin/AdminMessages';
import AdminSettings from './pages/admin/AdminSettings';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#8B0000', secondary: '#fff' },
            },
          }}
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="about" element={<Navigate to="/about/our-story" replace />} />
            <Route path="about/our-story" element={<OurStoryPage />} />
            <Route path="about/mission-vision" element={<MissionVisionPage />} />
            <Route path="about/members" element={<MembersPage />} />
            <Route path="about/officers" element={<OfficersPage />} />
            <Route path="about/achievements" element={<AchievementsPage />} />
            <Route path="shows" element={<Navigate to="/shows/current" replace />} />
            <Route path="shows/current" element={
              <ShowsPage
                statusFilter="current"
                title="Current Season"
                subtitle="Productions currently on stage"
                badgeLabel="On Stage"
                badgeColor="bg-green-600"
              />
            } />
            <Route path="shows/coming-soon" element={
              <ShowsPage
                statusFilter="coming_soon"
                title="Coming Soon"
                subtitle="Upcoming productions to look forward to"
                badgeLabel="Coming Soon"
                badgeColor="bg-[#A0522D]"
              />
            } />
            <Route path="shows/past" element={
              <ShowsPage
                statusFilter="past"
                title="Past Performances"
                subtitle="A look back at our previous productions"
                badgeLabel="Past"
                badgeColor="bg-[#5C3D2E]"
              />
            } />
            <Route path="shows/archives" element={<ShowArchivesPage />} />
            <Route path="media" element={<Navigate to="/media/photos" replace />} />
            <Route path="media/photos" element={<PhotoGalleryPage />} />
            <Route path="media/videos" element={<VideoGalleryPage />} />
            <Route path="media/press" element={<PressReviewsPage />} />
            <Route path="contact" element={<ContactPage />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="members" element={<AdminMembers />} />
            <Route path="officers" element={<AdminOfficers />} />
            <Route path="achievements" element={<AdminAchievements />} />
            <Route path="productions" element={<AdminProductions />} />
            <Route path="photos" element={<AdminPhotos />} />
            <Route path="videos" element={<AdminVideos />} />
            <Route path="press" element={<AdminPressReviews />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
