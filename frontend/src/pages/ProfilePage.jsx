import { useState } from "react";

import Card from "../shared/Card/Card.component";
import { useAuth } from "../hooks/useAuth.js";

export default function ProfilePage() {
  const { user } = useAuth();
   

  const [name, setName] = useState(user?.displayName || "Ramona");
  const [goals, setGoals] = useState("");
  const [theme, setTheme] = useState("Light");
  const [notifications, setNotifications] = useState(true);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [deleteEmailInput, setDeleteEmailInput] = useState("");

  const [toastMessage, setToastMessage] = useState("");
  const [avatarError, setAvatarError] = useState("");

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    showToast("Profile updated successfully!");
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png"];
    const maxSize = 2 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      setAvatarError("Friendly Warning: Please upload a JPG or PNG file only.");
      return;
    }
    if (file.size > maxSize) {
      setAvatarError("Friendly Warning: File is too large! Maximum size allowed is 2MB.");
      return;
    }
    setAvatarError("");
    showToast("Avatar uploaded successfully!");
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (!currentPassword) {
      alert("Current password is required!");
      return;
    }
    showToast("Password changed! Sessions invalidated on other devices.");
    setCurrentPassword("");
    setNewPassword("");
  };

  const handleDeleteAccount = (e) => {
    e.preventDefault();
    if (deleteEmailInput !== user?.email && deleteEmailInput !== "ramona@example.com") {
      alert("Email mismatch! Please type your exact account email to confirm deletion.");
      return;
    }
    alert(`Account marked for soft-deletion (30-day grace period initiated). Profile hidden.`);
  };

  const getInitials = (nameStr) => {
    if (!nameStr) return "??";
    return nameStr
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  //   if (!isAuthenticated) {
  //     return (
  //       <EmptyState
  //         icon="🔐"
  //         title="Sign in to view your profile"
  //         message="Manage your preferences, view learning milestones, and update security metrics after signing in."
  //         action={
  //           <Link
  //             to={ROUTES.LOGIN}
  //             className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 py-2.5 font-semibold text-on-primary hover:bg-primary-hover"
  //           >
  //             Go to sign in
  //           </Link>
  //         }
  //       />
  //     )
  //   }

  return (
    <section className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-md bg-green-600 px-5 py-3 font-semibold text-white shadow-lg animate-bounce">
          🍞 {toastMessage}
        </div>
      )}

      <header className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-surface-raised p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-white shadow-sm">
            {getInitials(name)}
          </div>
          <div>
            <h1 className="font-heading text-h3 font-bold text-heading">
              {name || "User Profile"}
            </h1>
            <p className="text-small text-neutral-600">
              Manage your profile metrics and preferences.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-neutral-100 bg-surface-app px-4 py-3 shadow-inner">
          <div className="text-center">
            <span className="block text-small font-semibold text-primary uppercase tracking-wide">
              XP Points
            </span>
            <span className="font-heading text-h5 font-bold text-heading">
              {user?.xp !== undefined ? user.xp.toLocaleString() : "0"}
            </span>
          </div>
          <div className="h-8 w-px bg-neutral-200" />
          <div className="text-center">
            <span className="block text-small font-semibold text-primary uppercase tracking-wide">
              Streak
            </span>
            <span className="font-heading text-h5 font-bold text-heading">
              {user?.streak !== undefined ? `${user.streak} Days` : "0 Days"}
            </span>
          </div>
        </div>
      </header>

      <Card className="space-y-4">
        <h2 className="font-heading text-h4 font-bold text-heading">Identity & Goals</h2>
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div className="space-y-1">
            <label className="text-small font-semibold text-heading block">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-neutral-300 bg-surface-app px-3 py-2 text-heading shadow-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-small font-semibold text-heading block">
              Current Learning Goals
            </label>
            <textarea
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="What are you working on..."
              className="w-full h-20 rounded-md border border-neutral-300 bg-surface-app px-3 py-2 text-heading shadow-sm focus:border-primary focus:outline-none resize-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-small font-semibold text-heading block">
              Update Profile Picture
            </label>
            <input
              type="file"
              accept="image/png, image/jpeg"
              onChange={handleAvatarChange}
              className="block w-full text-sm text-neutral-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-surface-inset file:text-heading hover:file:bg-neutral-200"
            />
            {avatarError && <p className="text-xs text-red-600 font-medium">{avatarError}</p>}
          </div>
          <button
            type="submit"
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 py-2.5 font-semibold text-on-primary hover:bg-primary-hover transition-colors"
          >
            Save Profile
          </button>
        </form>
      </Card>

      <Card className="space-y-4">
        <h2 className="font-heading text-h4 font-bold text-heading">Preferences</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div>
              <p className="font-semibold text-heading">Interface Theme</p>
              <p className="text-xs text-neutral-500">Toggle dark styling layouts</p>
            </div>

            <select
              value={theme}
              onChange={(e) => {
                setTheme(e.target.value);
                showToast(`Changed theme to ${e.target.value}`);
              }}
              className="rounded-md border border-neutral-300 bg-surface-app px-3 py-1.5 text-heading shadow-sm focus:outline-none"
            >
              <option value="Light">Light Mode</option>
              <option value="Dark">Dark Mode</option>
            </select>
          </div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => {
                setNotifications(e.target.checked);
                showToast(e.target.checked ? "Notifications active" : "Notifications muted");
              }}
              className="mt-1 h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
            />
            <div>
              <p className="font-semibold text-heading">Enable Task Notifications</p>
              <p className="text-xs text-neutral-500">
                Receive periodic update emails on missing course assignments
              </p>
            </div>
          </label>
        </div>
      </Card>

      <Card className="space-y-4">
        <h2 className="font-heading text-h4 font-bold text-heading">Security & Credentials</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div className="space-y-1">
            <label className="text-small font-semibold text-heading block">Current Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-md border border-neutral-300 bg-surface-app px-3 py-2 text-heading shadow-sm focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-small font-semibold text-heading block">New Password</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-md border border-neutral-300 bg-surface-app px-3 py-2 text-heading shadow-sm focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="inline-flex min-h-10 items-center justify-center rounded-md bg-neutral-600 px-4 py-2 font-semibold text-white hover:bg-neutral-700 transition-colors text-sm"
          >
            Update Password
          </button>
        </form>
      </Card>

      <div className="rounded-2xl border-2 border-dashed border-red-300 bg-red-50/50 p-6 space-y-4">
        <header className="space-y-1">
          <h2 className="font-heading text-h4 font-bold text-red-600">Danger Zone</h2>
          <p className="text-small text-neutral-600">
            Deleting your account triggers an irreversible data purge. You will immediately lose
            platform streaks, course rewards, and accumulated lesson progress records.
          </p>
        </header>

        <form onSubmit={handleDeleteAccount} className="space-y-3 max-w-md">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-700 block">
              Type account email to verify permanent extraction:
            </label>
            <input
              type="email"
              required
              value={deleteEmailInput}
              onChange={(e) => setDeleteEmailInput(e.target.value)}
              placeholder="you@domain.com"
              className="w-full rounded-md border border-red-300 bg-surface-app px-3 py-2 text-heading shadow-sm focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
          <button
            type="submit"
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-red-600 px-5 py-2.5 font-semibold text-white hover:bg-red-700 transition-colors shadow-sm"
          >
            Delete Account
          </button>
        </form>
      </div>
    </section>
  );
}
