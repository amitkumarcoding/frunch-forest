import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import "./Account.css";
import { auth, db } from "../../services/firebase";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

// Same authorized accounts as admin — keep these two lists in sync.
const ALLOWED_ADMINS = [
    "frunchforest@gmail.com",
    "amitaquarius13@gmail.com",
    "bhardwajakash78@gmail.com",
];

export default function Account() {
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                window.location.href = "/login";
                return;
            }

            // Redirect authorized admin accounts to admin page
            if (user.email && ALLOWED_ADMINS.includes(user.email)) {
                window.location.href = "/admin";
                return;
            }

            let name = user.displayName || "Frunch Forest customer";
            let phone = "—";

            try {
                const snap = await getDoc(doc(db, "users", user.uid));

                if (snap.exists()) {
                    const data = snap.data();

                    if (data.name) {
                        name = data.name;
                    }

                    if (data.phone) {
                        phone = data.phone;
                    }
                }
            } catch (e) {
                console.warn("Could not load profile doc:", e);
            }

            setProfile({
                name,
                email: user.email || "",
                phone,
                since: user.metadata?.creationTime
                    ? new Date(
                          user.metadata.creationTime
                      ).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                      })
                    : "—",
            });

            setLoading(false);
        });

        return () => unsub();
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            window.location.href = "/login";
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <>
            <Header />

            <main id="main">
                <section className="acc-section">
                    <div className="acc-bg" aria-hidden="true">
                        <div className="acc-glow g1"></div>
                        <div className="acc-glow g2"></div>
                    </div>

                    <div className="acc-wrap">
                        {loading || !profile ? (
                            <div id="accLoading" className="acc-loading">
                                Loading your account…
                            </div>
                        ) : (
                            <div id="accContent">
                                <div className="acc-header">
                                    <div className="acc-avatar">
                                        {profile.name?.trim().charAt(0).toUpperCase() ||
                                            "U"}
                                    </div>

                                    <div>
                                        <h1>{profile.name}</h1>
                                        <p>{profile.email}</p>
                                    </div>
                                </div>

                                <div className="acc-card">
                                    <h2>Profile details</h2>

                                    <div className="acc-grid">
                                        <div className="acc-field">
                                            <label>Full name</label>
                                            <div className="val">
                                                {profile.name}
                                            </div>
                                        </div>

                                        <div className="acc-field">
                                            <label>Phone number</label>
                                            <div className="val">
                                                {profile.phone}
                                            </div>
                                        </div>

                                        <div className="acc-field">
                                            <label>Email address</label>
                                            <div className="val">
                                                {profile.email || "—"}
                                            </div>
                                        </div>

                                        <div className="acc-field">
                                            <label>Member since</label>
                                            <div className="val">
                                                {profile.since}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="acc-card">
                                    <h2>Recent orders</h2>

                                    <p className="acc-empty">
                                        We're currently taking orders over
                                        WhatsApp while we finish integrating
                                        full online payments — that's coming
                                        soon. You haven't placed any orders
                                        yet; tap below to chat with us and
                                        place one.
                                    </p>

                                    <div
                                        className="acc-actions"
                                        style={{ marginTop: 16 }}
                                    >
                                        <a
                                            className="acc-btn acc-btn-gold"
                                            href="https://wa.me/919582122419?text=Hi%20Frunch%20Forest%2C%20I%27d%20like%20to%20place%20an%20order."
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <svg
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M3 21l1.65-4.95A9 9 0 1 1 8.05 19.35Z" />
                                                <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Zm0 0c0 2 2 4.5 4 5m1-.5a.5.5 0 0 1-.5.5H13" />
                                            </svg>

                                            Order on WhatsApp
                                        </a>
                                    </div>
                                </div>

                                <div className="acc-actions">
                                    <a
                                        className="acc-btn acc-btn-gold"
                                        href="/products"
                                    >
                                        Continue shopping
                                    </a>

                                    <button
                                        className="acc-btn acc-btn-outline"
                                        onClick={handleLogout}
                                    >
                                        Log out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}