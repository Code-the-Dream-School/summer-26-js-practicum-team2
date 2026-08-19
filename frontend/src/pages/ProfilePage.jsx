import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router";

import { useAuthContext } from "../context/AuthContext";
import {
  changeProfilePassword,
  deleteProfile,
  getProfile,
  notifyDashboardProgressChanged,
  updateProfile,
} from "../services/api";

import Button from "../shared/Button/Button.component";
import Input from "../shared/Input/Input.component";
import Toast from "../shared/Toast/Toast.component";
import Card from "../shared/Card/Card.component";

const errorMessage = (error) =>
  error.errors?.length ? error.errors.join(" ") : error.message || "uh oh spaghetti-o";

const Stat=({label, value}) => {
  return <p className="text-center"><span>{label}</span><span>{value}</span></p>
}

export default function ProfilePage() {
  const { csrfToken, logout } = useAuthContext();

  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);

  const [name, setName] = useState("");
  const [goals, setGoals] = useState("");
  // const [theme, setTheme] = useState("Light");
  const [notifications, setNotifications] = useState(true);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [deleteEmail, setDeleteEmail] = useState("");

  const [toastMessage, setToastMessage] = useState("");
  const [pending, setPending] = useState("");
  const [loading, setLoading] = useState(true);
  // const [avatarError, setAvatarError] = useState("");

  const showToast = useCallback((message, variant = "default") => {
    setToastMessage({ isOpen: true, message, variant });
  }, []);

  const closeToast = useCallback(() => {setToastMessage((value)=> ({...value, isOpen:false}))},[])

  const applyProfile = useCallback((user) => {
    if (!user) return;
    setProfile(user);
    setName(user.name);
    setGoals(user.goals);
  });

  // useEffect(
  //   () => {
  //     let active = true;
  //     getProfile()
  //       .then(({ user }) => {
  //         if (!active) return;
  //         applyProfile(user);
  //       })
  //       .catch((error) => active && showToast(errorMessage(error)))
  //       .finally(() => active && setLoading(false));
  //       return () => {
  //         active=false
  //       }
  //   },
  //    [applyProfile, showToast]
  // );

  const saveProfile = async (event) => {
    event.preventDefault();
    setPending("Profile");
    try {
      const result = await updateProfile({name, goals, notifications, csrfToken});
      applyProfile(result.user);
      notifyDashboardProgressChanged({ avatarLabel: result.user?.name?.charAt(0) || "A" });
      showToast(result.message, "success");
    } catch (error) {
      showToast(errorMessage(error));
    } finally {
      setPending("");
    }
  };

  const changePassword = async(event) =>{
    event.preventDefault();
    setPending("Password");
    try{
      const result = await updateProfilePassword({currentPassword, newPassword, csrfToken});
      setCurrentPassword("")
      setNewPassword("")
      showToast(result.message, "success");
    } catch(error) {
      showToast(errorMessage(error));
    } finally {
      setPending("");
    }
  };


  const deleteAccount = async(event) => {
    event.preventDefault();
    setPending("Delete");
    try{
      await deleteProfile({email:deleteEmail, csrfToken})
      try{
        await logout()
      }catch{}  
    }catch(error) {
      showToast(result.message, "success");
    } finally{
      setPending("");
    }
  };

  if(loading){
    return<p>Loading profile...</p>
  }

  const savedDisplayName = profile?.name || "username" 
  // const handleAvatarChange = (e) => {
  // const file = e.target.files[0];
  // if (!file) return;

  // const allowedTypes = ["image/jpeg", "image/png"];
  // const maxSize = 2 * 1024 * 1024;

  //   if (!allowedTypes.includes(file.type)) {
  //     setAvatarError("Friendly Warning: Please upload a JPG or PNG file only.");
  //     return;
  //   }
  //   if (file.size > maxSize) {
  //     setAvatarError("Friendly Warning: File is too large! Maximum size allowed is 2MB.");
  //     return;
  //   }
  //   setAvatarError("");
  //   showToast("Avatar uploaded successfully!");
  // };

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


  return (
    <section className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <Toast {...toastMessage} onClose={closeToast}/>
      <header className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-surface-raised p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
            <h1 className="font-heading text-h3 font-bold text-heading">
              {savedDisplayName}
            </h1>
            <p className="text-small text-neutral-600">
              Manage your profile and preferences.
            </p>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-neutral-100 bg-surface-app px-4 py-3 shadow-inner">
         <Stat label="xp points" value={(profile?.xp??0).toLocaleString()}/>
          <div className="h-8 w-px bg-neutral-200" />
            <Stat label="streak" value={`${profile?.streak??0} days`}/>
        </div>
      </header>

      <Card className="space-y-4">
        <h2 className="font-heading text-h4 font-bold text-heading">Identity & Goals</h2>
        <form onSubmit={saveProfile} className="space-y-4">
         
          <Input id="profile-name" label="Display Name" required minLength={2} maxLength={30} value={name} onChange={e => setName(e.target.value)}/>

        </form>
      </Card>

      <Card className="space-y-4">
        <h2 className="font-heading text-h4 font-bold text-heading">Security & Credentials</h2>
        <form onSubmit={changePassword} className="space-y-4 max-w-md">
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

        <form onSubmit={deleteAccount} className="space-y-3 max-w-md">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-700 block">
              Type account email to verify permanent extraction:
            </label>
            <input
              type="email"
              required
              value={deleteEmail}
              onChange={(e) => setDeleteEmail(e.target.value)}
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
