import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { logoutAction } from "@/app/admin/actions/auth.action";

export default async function AdminLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <>{children}</>;
  }

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("id, email, role")
    .eq("id", user.id)
    .single();

  if (!adminUser) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-100">
      {/* Sidebar / Mobile Top Nav */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col justify-between p-4 shrink-0 shadow-lg md:shadow-none">
        <div>
          <div className="flex items-center justify-between md:justify-start gap-3 px-3 py-3 md:py-4 border-b border-slate-800 mb-4 md:mb-6">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold">
                JP
              </div>
              <div>
                <div className="font-bold text-sm text-white">Joglo Print</div>
                <div className="text-[11px] text-amber-400 font-medium">Admin Panel</div>
              </div>
            </div>
            {/* Quick logout for mobile */}
            <div className="md:hidden">
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-900/50"
                >
                  Keluar
                </button>
              </form>
            </div>
          </div>

          <nav className="flex md:flex-col gap-1.5 overflow-x-auto pb-2 md:pb-0">
            <Link
              href="/admin/kategori"
              className="flex items-center gap-2 md:gap-3 px-3 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-semibold bg-slate-800 md:bg-amber-500/10 text-white md:text-amber-400 border border-slate-700 md:border-amber-500/20 whitespace-nowrap"
            >
              <span>📁</span>
              <span>Kategori</span>
            </Link>
            <Link
              href="/admin/produk"
              className="flex items-center gap-2 md:gap-3 px-3 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-semibold text-slate-300 md:text-slate-400 hover:bg-slate-800 hover:text-white transition whitespace-nowrap"
            >
              <span>📦</span>
              <span>Produk</span>
            </Link>
            <Link
              href="/admin/info-bisnis"
              className="flex items-center gap-2 md:gap-3 px-3 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-semibold text-slate-300 md:text-slate-400 hover:bg-slate-800 hover:text-white transition whitespace-nowrap"
            >
              <span>🏢</span>
              <span>Info Bisnis</span>
            </Link>
            <Link
              href="/admin/banners"
              className="flex items-center gap-2 md:gap-3 px-3 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-semibold text-slate-300 md:text-slate-400 hover:bg-slate-800 hover:text-white transition whitespace-nowrap"
            >
              <span>🖼️</span>
              <span>Banners</span>
            </Link>
          </nav>
        </div>

        <div className="hidden md:block border-t border-slate-800 pt-4">
          <div className="text-xs text-slate-400 mb-2 truncate">{user.email}</div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full rounded-xl bg-slate-800 py-2 text-xs font-semibold text-slate-300 hover:bg-red-900/50 hover:text-red-300 transition"
            >
              Keluar (Logout)
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">{children}</main>
    </div>
  );
}
