import { Link, NavLink, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Home, User, MessageCircle, LogOut } from "lucide-react";
import Avatar from "./Avatar";
import { getUnreadCount } from "../api/notifications";
import { getStoredUser } from "../utils";

const links = [
  { to: "/", label: "Feed", icon: Home },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/notifications", label: "Notifications", icon: MessageCircle },
];

export default function Navbar() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const user = getStoredUser();

  // polls every 30s, and is refreshed whenever a notification changes
  const { data: unread = 0 } = useQuery({
    queryKey: ["unread-count"],
    queryFn: getUnreadCount,
    refetchInterval: 30_000,
  });

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    qc.clear(); // don't leak this user's cached data to the next login
    navigate("/auth");
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-20 max-w-[1500px] items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand text-[10px] font-extrabold text-white">
            ROUTE
          </div>
          <span className="text-2xl font-bold">Route Posts</span>
        </div>

        <nav className="hidden gap-1 rounded-full border border-slate-200 bg-slate-50 p-1.5 md:flex">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-full px-5 py-2.5 font-semibold transition ${
                  isActive ? "bg-blue-50 text-brand" : "text-slate-700 hover:bg-slate-100"
                }`}>
              <Icon className="h-5 w-5" /> {label}
              {to === "/notifications" && unread > 0 && (
                <span className="ml-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
                  {unread > 99 ? "99+" : unread}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 py-1.5 pl-2 pr-4">
          <Link to="/profile" className="flex items-center gap-3">
            <Avatar name={user?.name} photo={user?.photo} size={36} />
            <span className="hidden font-medium sm:block">{user?.name ?? "User"}</span>
          </Link>
          <button onClick={logout} title="Log out" className="text-slate-500 hover:text-red-600">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}