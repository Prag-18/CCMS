import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  return (
    <div className="h-screen flex flex-col" style={{ background: "var(--page-bg)" }}>
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main
          className="flex-1 overflow-y-auto p-6"
          style={{ background: "var(--page-bg)" }}
        >
          <div className="max-w-7xl mx-auto w-full fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
