import { useState, useCallback, useEffect } from "react";

import { useAuthContext } from "../context/AuthContext";
import {
  changeProfilePassword,
  // deleteProfile,
  getProfile,
  notifyDashboardProgressChanged,
  updateProfile,
} from "../services/api";

import Button from "../shared/Button/Button.component";
import Input from "../shared/Input/Input.component";
import Toast from "../shared/Toast/Toast.component";
import Card from "../shared/Card/Card.component";
import Skeleton from "../shared/Skeleton/Skeleton.component";

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
  const { csrfToken } = useAuthContext();
  const [profile, setProfile] = useState(null);

  const [name, setName] = useState("");
  const [goals, setGoals] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  // const [deleteEmail, setDeleteEmail] = useState("");

  const [toastMessage, setToastMessage] = useState("");
  const [pending, setPending] = useState("");
  const [loading, setLoading] = useState(true);

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
      const result = await updateProfile({name, goals, csrfToken});
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
      const result = await changeProfilePassword({currentPassword, newPassword, csrfToken});
      setCurrentPassword("")
      setNewPassword("")
      showToast(result.message, "success");
    } catch(error) {
      showToast(errorMessage(error));
    } finally {
      setPending("");
    }
  };


  // const deleteAccount = async(event) => {
  //   event.preventDefault();
  //   setPending("Delete");
  //   try{
  //     await deleteProfile({email:deleteEmail, csrfToken})
  //     try{
  //       await logout()
  //     }catch{}  
  //   }catch(error) {
  //     showToast(result.message, "success");
  //   } finally{
  //     setPending("");
  //   }
  // };

  if(loading){
    return <Skeleton />
  }

  const savedDisplayName = profile?.name || "username"


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
         <Stat label="XP Points:" value={` ${(profile?.xp?? 0).toLocaleString()}`}/>
          <div className="h-8 w-px bg-neutral-200" />
            <Stat label="Streak:" value={` ${profile?.streak?? 0} days`}/>
        </div>
      </header>

      {/* Identity & Goals Card */}
      <Card className="space-y-4">
        <h2 className="font-heading text-h4 font-bold text-heading">
          Identity & Goals
          </h2>
        <form onSubmit={saveProfile} className="space-y-4 max-w-md">
          <Input id="profile-name" label="Display Name" required minLength={2} maxLength={30} value={name} onChange={e => setName(e.target.value)}/>
          <Button type="submit">
            Save Changes 
          </Button>
        </form>
      </Card>

    {/* Security & Credentials */}
      <Card className="space-y-4">
        <h2 className="font-heading text-h4 font-bold text-heading">
          Security & Credentials
          </h2>
        <form onSubmit={changePassword} className="space-y-4 max-w-md">
            <label className="text-small font-semibold text-heading block"> Current Password</label>
            <Input
              id="current-password"
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
            />
            <Input
              id="new-password"
              type="password"
              label="New Password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
            />
          <Button
            type="submit"
            disable={pending==="password"}
          >
            {pending==="password"?"Updating...":"Update Password"}
          </Button>
        </form>
      </Card>

      {/* Danger Zone - Don't comment in we are no longer using this
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

        <form onSubmit={deleteAccount} className="space-y-4 max-w-md">
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
    </div> */}
    </section>
  );
}
