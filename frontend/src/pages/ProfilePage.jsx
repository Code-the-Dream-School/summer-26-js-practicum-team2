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

const Stat = ({label, value}) => {
  return (
    <p className="text-center">
      <span>{label}</span>
      <span>{value}</span>
    </p>
  );
};

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
  }, []);

  useEffect(() => {
      let active = true;
      getProfile()
        .then(({ user }) => {if (!active) return;
          applyProfile(user);
        })
        .catch((error) => active && showToast(errorMessage(error)))
        .finally(() => active && setLoading(false));
        return () => {
          active=false;
        };
    }, [applyProfile, showToast]);

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
  // const handleAvatarChange = (e) => {       ollllllddddd codeeee donot activate again
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
  // }; -> END OF OLD CODE

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

      {/* Header Profile Summary */}
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
         <Stat label="xp points" value={(profile?.xp?? 0).toLocaleString()}/>
          <div className="h-8 w-px bg-neutral-200" />
            <Stat label="streak" value={`${profile?.streak??0} days`}/>
        </div>
      </header>

      {/* Identity & Goals Card */}
      <Card className="space-y-4">
        <h2 className="font-heading text-h4 font-bold text-heading">
          Identity & Goals
          </h2>
        <form onSubmit={saveProfile} className="space-y-4 max-w-md">
          <Input id="profile-name" label="Display Name" required minLength={2} maxLength={30} value={name} onChange={e => setName(e.target.value)}/>
          <button type="submit" className="inline-flex min-h-10 items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visble:ring-2 focus-visible:ring-primary">
            Save Changes 
          </button>
        </form>
      </Card>

    {/* Security & Credentials */}
      <Card className="space-y-4">
        <h2 className="font-heading text-h4 font-bold text-heading">
          Security & Credentials
          </h2>
        <form onSubmit={changeProfilePassword} className="space-y-4 max-w-md">
            <label className="text-small font-semibold text-heading block">Current Password</label>
            <input
              id="current-password"
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
            />
            <input
              id="new-password"
              type="password"
              label="New Password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
            />
          <button
            type="submit"
            disable={pending==="password"}
            className="rounded-xl bg-neutral-700 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
          >
            {pending==="password"?"Updating...":"Update Password"}
          </button>
        </form>
      </Card>

      {/* Danger Zone */}
      <div className="space-y-4 rounded-2xl border-2 border-dashed border-danger/40 bg-danger/5 p-6">
        <header className="space-y-1">
          <h2 className="font-heading text-h4 font-bold text-danger">
            Danger Zone
          </h2>
          <p className="text-small text-neutral-600">
            Deleting your account triggers an irreversible data purge. You will immediately lose
            platform streaks, course rewards, and accumulated lesson progress records.
          </p>
        </header>

        <form onSubmit={handleDeleteAccount} className="space-y-4 max-w-md">
          <Input
            id="delete-account-email"
            type="email"
            label="Type account email to verify permanent deletion:"
            required
            value={deleteEmail}
            onChange={(e) => setDeleteEmail(e.target.value)}
            placeholder="you@domain.com"
          />
          <Button
            type="submit"
            disabled={pending === "delete"}
            className="rounded-xl bg-danger px-5 py-2.5 text-sm font-semibold text-white hover:bg-danger/90"
          >
            {pending === "delete" ? "Deleting..." : "Delete Account"}
          </Button>
        </form>
      </div>
    </section>
  );
}
