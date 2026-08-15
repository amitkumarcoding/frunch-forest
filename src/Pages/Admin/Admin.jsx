import { useEffect, useMemo, useRef, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  writeBatch,
  deleteDoc,
  addDoc,
  setDoc,
} from "firebase/firestore";
import "./Admin.css";
import SEO from "../../components/SEO/SEO";
import { FESTIVE_THEMES } from "../../utils/festiveTheme";

const KNOWN_FESTIVAL_KEYS = Object.keys(FESTIVE_THEMES);

// Only these Google accounts may access the admin panel.
const ALLOWED_ADMINS = [
  "frunchforest@gmail.com",
  "amitaquarius13@gmail.com",
  "bhardwajakash78@gmail.com",
];

const firebaseConfig = {
  apiKey: "AIzaSyAJOYj9rbjeerHeIuRoi7mqKEUqebfEQT8",
  authDomain: "frunch-forest.firebaseapp.com",
  projectId: "frunch-forest",
  storageBucket: "frunch-forest.firebasestorage.app",
  messagingSenderId: "616838806867",
  appId: "1:616838806867:web:7397adccd51f3f41d5f5a6",
  measurementId: "G-HTK2QB1SWH",
};

// NOTE: if the rest of the app already has a shared Firebase app
// instance (e.g. the services/firebaseProducts.js used by Home.jsx),
// swap this out for that instead of initializing a second app here.
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const EMPTY_NEW_PRODUCT = {
  slug: "",
  name: "",
  hindi: "",
  tag: "",
  image: "",
  bestSeller: false,
  nutrition: '[{"label":"Protein","value":"18g"}]',
  bullets: '["Feature one","Feature two"]',
  packs: '[{"size":"200g","price":249,"mrp":299}]',
};

const EMPTY_NEW_FESTIVAL = {
  date: "",
  key: "",
  text: "",
  eyebrow: "",
  emoji: "🎉",
  priority: 10,
};

function packsSummary(packs) {
  return (packs || []).map((pk) => `${pk.size}:₹${pk.price}`).join(", ");
}

function toOriginalDraft(data) {
  return {
    name: data.name || "",
    tag: data.tag || "",
    inStock: data.inStock !== false,
    packs: data.packs || [],
  };
}

export default function Admin() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [loginError, setLoginError] = useState("");

  const [products, setProducts] = useState([]); // [{slug, ...data}]
  const [originals, setOriginals] = useState({}); // slug -> last-saved draft shape
  const [drafts, setDrafts] = useState({}); // slug -> { name, tag, inStock, packs }
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState("");
  const [saving, setSaving] = useState(false);

  const [status, setStatus] = useState({ text: "", ok: true });
  const statusTimer = useRef(null);

  const [addOpen, setAddOpen] = useState(false);
  const [newProduct, setNewProduct] = useState(EMPTY_NEW_PRODUCT);

  // ---- Festival calendar (hero greeting overrides) ----
  const [festivals, setFestivals] = useState([]); // [{id, date, key, text, eyebrow, emoji, priority}]
  const [festivalDrafts, setFestivalDrafts] = useState({}); // id -> same shape
  const [festivalsLoading, setFestivalsLoading] = useState(false);
  const [festivalsError, setFestivalsError] = useState("");
  const [festivalSavingId, setFestivalSavingId] = useState(null);
  const [festivalAddOpen, setFestivalAddOpen] = useState(false);
  const [newFestival, setNewFestival] = useState(EMPTY_NEW_FESTIVAL);

  const isAuthorized = !!user && ALLOWED_ADMINS.includes(user.email);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthChecked(true);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (isAuthorized) {
      loadProducts();
      loadFestivals();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthorized]);

  function setStatusMessage(text, ok = true) {
    setStatus({ text, ok });
    if (statusTimer.current) clearTimeout(statusTimer.current);
    if (text) {
      statusTimer.current = setTimeout(() => setStatus({ text: "", ok: true }), 3000);
    }
  }

  async function handleLogin() {
    setLoginError("");
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      if (!ALLOWED_ADMINS.includes(result.user.email)) {
        setLoginError("This Google account is not authorized.");
        await signOut(auth);
      }
    } catch (e) {
      setLoginError(e.message);
    }
  }

  async function handleLogout() {
    await signOut(auth);
    window.location.href = "./";
  }

  async function loadProducts() {
    setProductsLoading(true);
    setProductsError("");
    try {
      const snap = await getDocs(collection(db, "products"));
      const list = [];
      const nextDrafts = {};
      const nextOriginals = {};
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({ slug: docSnap.id, ...data });
        const shape = toOriginalDraft(data);
        nextDrafts[docSnap.id] = shape;
        nextOriginals[docSnap.id] = shape;
      });
      setProducts(list);
      setDrafts(nextDrafts);
      setOriginals(nextOriginals);
    } catch (e) {
      setProductsError(`Error loading products: ${e.message}`);
    } finally {
      setProductsLoading(false);
    }
  }

  function updateDraft(slug, patch) {
    setDrafts((prev) => ({ ...prev, [slug]: { ...prev[slug], ...patch } }));
  }

  function fieldChanged(slug, field) {
    const o = originals[slug]?.[field];
    const d = drafts[slug]?.[field];
    if (field === "packs") return JSON.stringify(o) !== JSON.stringify(d);
    return o !== d;
  }

  function isRowDirty(slug) {
    return ["name", "tag", "inStock", "packs"].some((f) => fieldChanged(slug, f));
  }

  const dirtySlugs = useMemo(
    () => products.map((p) => p.slug).filter((slug) => isRowDirty(slug)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [products, drafts, originals]
  );

  function handleDiscardAll() {
    if (!dirtySlugs.length) return;
    if (!window.confirm(`Discard changes to ${dirtySlugs.length} product(s)?`)) return;
    setDrafts((prev) => {
      const next = { ...prev };
      dirtySlugs.forEach((slug) => {
        next[slug] = originals[slug];
      });
      return next;
    });
  }

  async function handleSaveAll() {
    if (!dirtySlugs.length) return;
    if (!window.confirm(`Save changes to ${dirtySlugs.length} product(s)?`)) return;
    setSaving(true);
    try {
      const batch = writeBatch(db);
      dirtySlugs.forEach((slug) => {
        const original = products.find((p) => p.slug === slug) || {};
        const draft = drafts[slug] || {};
        const updated = {
          ...original,
          name: draft.name,
          tag: draft.tag,
          inStock: draft.inStock,
          packs: draft.packs,
        };
        delete updated.slug;
        batch.set(doc(db, "products", slug), updated);
      });
      await batch.commit();
      setOriginals((prev) => {
        const next = { ...prev };
        dirtySlugs.forEach((slug) => {
          next[slug] = drafts[slug];
        });
        return next;
      });
      setProducts((prev) =>
        prev.map((p) =>
          dirtySlugs.includes(p.slug) ? { ...p, ...drafts[p.slug] } : p
        )
      );
      setStatusMessage(`Saved ${dirtySlugs.length} product(s).`);
    } catch (e) {
      setStatusMessage(`Save failed: ${e.message}`, false);
    } finally {
      setSaving(false);
    }
  }

  function handleEditPacks(slug) {
    const current = drafts[slug]?.packs || [];
    const raw = window.prompt("Edit packs JSON:", JSON.stringify(current, null, 2));
    if (raw === null) return;
    try {
      const packs = JSON.parse(raw);
      updateDraft(slug, { packs });
    } catch {
      window.alert("Invalid JSON.");
    }
  }

  async function handleDeleteRow(slug) {
    if (!window.confirm(`Delete "${slug}"? This cannot be undone.`)) return;
    try {
      await deleteDoc(doc(db, "products", slug));
      setProducts((prev) => prev.filter((p) => p.slug !== slug));
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[slug];
        return next;
      });
      setOriginals((prev) => {
        const next = { ...prev };
        delete next[slug];
        return next;
      });
      setStatusMessage(`Deleted ${slug}.`);
    } catch (e) {
      setStatusMessage(`Delete failed: ${e.message}`, false);
    }
  }

  function updateNewProduct(patch) {
    setNewProduct((prev) => ({ ...prev, ...patch }));
  }

  async function handleAddProduct() {
    const slug = newProduct.slug.trim();
    if (!slug) return window.alert("Slug is required.");

    let nutrition, bullets, packs;
    try {
      nutrition = JSON.parse(newProduct.nutrition);
      bullets = JSON.parse(newProduct.bullets);
      packs = JSON.parse(newProduct.packs);
    } catch {
      return window.alert("One of the JSON fields is invalid.");
    }

    const product = {
      name: newProduct.name,
      hindi: newProduct.hindi,
      tag: newProduct.tag,
      image: newProduct.image,
      bestSeller: newProduct.bestSeller,
      nutrition,
      bullets,
      packs,
      inStock: true,
    };

    if (!window.confirm(`Add new product "${slug}"?`)) return;

    try {
      const batch = writeBatch(db);
      batch.set(doc(db, "products", slug), product);
      await batch.commit();
      setAddOpen(false);
      setNewProduct(EMPTY_NEW_PRODUCT);
      setStatusMessage(`Added ${slug}.`);
      loadProducts();
    } catch (e) {
      setStatusMessage(`Add failed: ${e.message}`, false);
    }
  }

  // ---- Festival calendar (hero greeting overrides) ----
  // These live in Firestore ("festivals" collection) and are merged on
  // top of the Google Calendar / local fallback list in Home.jsx — see
  // firebaseFestivals.js. `key` should match a festiveTheme.js /
  // festiveIcons.jsx entry to pick up that occasion's colours and icon;
  // any other value still works, it just falls back to the default
  // gold/forest theme and a sparkle icon.
  async function loadFestivals() {
    setFestivalsLoading(true);
    setFestivalsError("");
    try {
      const snap = await getDocs(collection(db, "festivals"));
      const list = [];
      const drafts = {};
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        const row = {
          id: docSnap.id,
          date: data.date || "",
          key: data.key || "",
          text: data.text || "",
          eyebrow: data.eyebrow || "",
          emoji: data.emoji || "🎉",
          priority: typeof data.priority === "number" ? data.priority : 10,
        };
        list.push(row);
        drafts[docSnap.id] = row;
      });
      list.sort((a, b) => (a.date || "").localeCompare(b.date || ""));
      setFestivals(list);
      setFestivalDrafts(drafts);
    } catch (e) {
      setFestivalsError(`Error loading festival calendar: ${e.message}`);
    } finally {
      setFestivalsLoading(false);
    }
  }

  function updateFestivalDraft(id, patch) {
    setFestivalDrafts((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }

  function festivalRowDirty(id) {
    const original = festivals.find((f) => f.id === id);
    const draft = festivalDrafts[id];
    if (!original || !draft) return false;
    return ["date", "key", "text", "eyebrow", "emoji", "priority"].some(
      (field) => String(original[field]) !== String(draft[field])
    );
  }

  async function handleSaveFestivalRow(id) {
    const draft = festivalDrafts[id];
    if (!draft) return;
    if (!draft.date || !draft.key.trim() || !draft.text.trim()) {
      return window.alert("Date, key and text are required.");
    }
    setFestivalSavingId(id);
    try {
      const cleaned = {
        date: draft.date,
        key: draft.key.trim(),
        text: draft.text.trim(),
        eyebrow: draft.eyebrow.trim(),
        emoji: draft.emoji.trim() || "🎉",
        priority: Number(draft.priority) || 10,
      };
      await setDoc(doc(db, "festivals", id), cleaned);
      setFestivals((prev) => prev.map((f) => (f.id === id ? { id, ...cleaned } : f)));
      setFestivalDrafts((prev) => ({ ...prev, [id]: { id, ...cleaned } }));
      setStatusMessage("Saved festival override.");
    } catch (e) {
      setStatusMessage(`Save failed: ${e.message}`, false);
    } finally {
      setFestivalSavingId(null);
    }
  }

  async function handleDeleteFestival(id, label) {
    if (!window.confirm(`Delete override "${label}"? This cannot be undone — the date falls back to Google Calendar / the default list.`)) return;
    try {
      await deleteDoc(doc(db, "festivals", id));
      setFestivals((prev) => prev.filter((f) => f.id !== id));
      setFestivalDrafts((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setStatusMessage("Deleted festival override.");
    } catch (e) {
      setStatusMessage(`Delete failed: ${e.message}`, false);
    }
  }

  function updateNewFestival(patch) {
    setNewFestival((prev) => ({ ...prev, ...patch }));
  }

  async function handleAddFestival() {
    const { date, key, text } = newFestival;
    if (!date || !key.trim() || !text.trim()) {
      return window.alert("Date, key and text are required.");
    }
    if (!window.confirm(`Add festival override for ${date}?`)) return;
    try {
      await addDoc(collection(db, "festivals"), {
        date,
        key: key.trim(),
        text: text.trim(),
        eyebrow: newFestival.eyebrow.trim(),
        emoji: newFestival.emoji.trim() || "🎉",
        priority: Number(newFestival.priority) || 10,
      });
      setFestivalAddOpen(false);
      setNewFestival(EMPTY_NEW_FESTIVAL);
      setStatusMessage("Festival override added.");
      loadFestivals();
    } catch (e) {
      setStatusMessage(`Add failed: ${e.message}`, false);
    }
  }

  return (
    <>
      <SEO
        title="Admin"
        description="Frunch Forest admin console."
        path="/admin"
        noindex
      />
      <div className="admin-page">
        <header>
          <div className="brand">
            <div className="brand-badge">FF</div>
            <div className="brand-text">
              <h1>Frunch Forest</h1>
              <span>Admin console</span>
            </div>
          </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {isAuthorized && (
            <a href="./" className="btn-outline" style={{ textDecoration: "none" }}>
              Home
            </a>
          )}
          {isAuthorized && (
            <button type="button" className="btn-outline" onClick={handleLogout}>
              Log out
            </button>
          )}
        </div>
      </header>

      {authChecked && !isAuthorized && (
        <div className="auth-wrap">
          <div id="loginView">
            <div className="login-mark">FF</div>
            <h2>Admin login</h2>
            <p className="sub">Sign in with an authorized Gmail account to manage products.</p>
            <button type="button" className="google-btn" onClick={handleLogin}>
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z" />
                <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18z" />
                <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.03l2.99-2.33z" />
                <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.97l2.99 2.33C4.66 5.17 6.65 3.58 9 3.58z" />
              </svg>
              Sign in with Google
            </button>
            <div id="err">{loginError}</div>
          </div>
        </div>
      )}

      {isAuthorized && (
        <main className={dirtySlugs.length ? "has-savebar" : ""}>
          <div className="toolbar">
            <div>
              <div className={`msg${status.text ? (status.ok ? " ok" : " err") : ""}`}>
                {status.text}
              </div>
              {!status.text && (
                <div className="hint">
                  {products.length} product{products.length === 1 ? "" : "s"} · edit fields, then save
                </div>
              )}
            </div>
            <button type="button" className="btn-gold" onClick={() => setAddOpen((v) => !v)}>
              + Add product
            </button>
          </div>

          <div id="addBox" className={addOpen ? "open" : ""}>
            <div className="grid2">
              <input
                placeholder="slug (e.g. cashews)"
                value={newProduct.slug}
                onChange={(e) => updateNewProduct({ slug: e.target.value })}
              />
              <input
                placeholder="Name"
                value={newProduct.name}
                onChange={(e) => updateNewProduct({ name: e.target.value })}
              />
              <input
                placeholder="Hindi name"
                value={newProduct.hindi}
                onChange={(e) => updateNewProduct({ hindi: e.target.value })}
              />
              <input
                placeholder="Tag"
                value={newProduct.tag}
                onChange={(e) => updateNewProduct({ tag: e.target.value })}
              />
              <input
                placeholder="./image/products/x.png"
                value={newProduct.image}
                onChange={(e) => updateNewProduct({ image: e.target.value })}
              />
              <label className="check-inline">
                <input
                  type="checkbox"
                  style={{ width: "auto" }}
                  checked={newProduct.bestSeller}
                  onChange={(e) => updateNewProduct({ bestSeller: e.target.checked })}
                />{" "}
                Best seller
              </label>
            </div>
            <p className="field-label">Nutrition (JSON array)</p>
            <textarea
              value={newProduct.nutrition}
              onChange={(e) => updateNewProduct({ nutrition: e.target.value })}
            />
            <p className="field-label">Bullets (JSON array of strings)</p>
            <textarea
              value={newProduct.bullets}
              onChange={(e) => updateNewProduct({ bullets: e.target.value })}
            />
            <p className="field-label">Packs (JSON array)</p>
            <textarea
              value={newProduct.packs}
              onChange={(e) => updateNewProduct({ packs: e.target.value })}
            />
            <div className="row-actions" style={{ marginTop: "10px" }}>
              <button type="button" className="btn-gold" onClick={handleAddProduct}>
                Save product
              </button>
              <button type="button" className="btn-outline" onClick={() => setAddOpen(false)}>
                Cancel
              </button>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Slug</th>
                  <th>Name</th>
                  <th>Tag</th>
                  <th>Packs (size:price)</th>
                  <th>In stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {productsLoading && (
                  <tr>
                    <td colSpan={6}>Loading…</td>
                  </tr>
                )}
                {!productsLoading && productsError && (
                  <tr>
                    <td colSpan={6}>{productsError}</td>
                  </tr>
                )}
                {!productsLoading &&
                  !productsError &&
                  products.map((p) => {
                    const draft = drafts[p.slug] || {};
                    const dirty = isRowDirty(p.slug);
                    return (
                      <tr key={p.slug} className={dirty ? "dirty-row" : ""}>
                        <td className="slug-cell" data-label="Slug">
                          {dirty && <span className="dirty-dot" title="Unsaved changes" />}
                          {p.slug}
                        </td>
                        <td data-label="Name">
                          <input
                            className={fieldChanged(p.slug, "name") ? "changed" : ""}
                            value={draft.name || ""}
                            onChange={(e) => updateDraft(p.slug, { name: e.target.value })}
                          />
                        </td>
                        <td data-label="Tag">
                          <input
                            className={fieldChanged(p.slug, "tag") ? "changed" : ""}
                            value={draft.tag || ""}
                            onChange={(e) => updateDraft(p.slug, { tag: e.target.value })}
                          />
                        </td>
                        <td data-label="Packs">
                          <input
                            className={fieldChanged(p.slug, "packs") ? "changed" : ""}
                            value={packsSummary(draft.packs)}
                            title="Edit packs JSON below"
                            readOnly
                          />
                        </td>
                        <td data-label="In stock">
                          <input
                            className={fieldChanged(p.slug, "inStock") ? "changed" : ""}
                            type="checkbox"
                            checked={!!draft.inStock}
                            onChange={(e) => updateDraft(p.slug, { inStock: e.target.checked })}
                          />
                        </td>
                        <td className="row-actions">
                          <button type="button" className="btn-outline" onClick={() => handleEditPacks(p.slug)}>
                            Edit packs
                          </button>
                          <button type="button" className="btn-danger" onClick={() => handleDeleteRow(p.slug)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          <div className="section-header">
            <div>
              <h2>Festival calendar</h2>
              <p className="hint">
                Overrides which festival (and hero theme) shows on a given date — takes priority over Google Calendar and the built-in default list. Add one whenever a festival's date changes or you want to schedule a one-off occasion ahead of time.
              </p>
            </div>
            <button type="button" className="btn-gold" onClick={() => setFestivalAddOpen((v) => !v)}>
              + Add override
            </button>
          </div>

          <div id="addFestivalBox" className={festivalAddOpen ? "open" : ""}>
            <div className="grid2">
              <label className="field-inline">
                <span className="field-label">Date</span>
                <input
                  type="date"
                  value={newFestival.date}
                  onChange={(e) => updateNewFestival({ date: e.target.value })}
                />
              </label>
              <label className="field-inline">
                <span className="field-label">Key (matches theme/icon)</span>
                <input
                  list="festival-keys"
                  placeholder="e.g. diwali"
                  value={newFestival.key}
                  onChange={(e) => updateNewFestival({ key: e.target.value })}
                />
              </label>
              <label className="field-inline">
                <span className="field-label">Banner text</span>
                <input
                  placeholder="Happy Diwali"
                  value={newFestival.text}
                  onChange={(e) => updateNewFestival({ text: e.target.value })}
                />
              </label>
              <label className="field-inline">
                <span className="field-label">Eyebrow</span>
                <input
                  placeholder="Celebrating the festival of lights"
                  value={newFestival.eyebrow}
                  onChange={(e) => updateNewFestival({ eyebrow: e.target.value })}
                />
              </label>
              <label className="field-inline">
                <span className="field-label">Emoji</span>
                <input
                  placeholder="🪔"
                  value={newFestival.emoji}
                  onChange={(e) => updateNewFestival({ emoji: e.target.value })}
                />
              </label>
              <label className="field-inline">
                <span className="field-label">Priority (higher wins on a shared date)</span>
                <input
                  type="number"
                  value={newFestival.priority}
                  onChange={(e) => updateNewFestival({ priority: e.target.value })}
                />
              </label>
            </div>
            <div className="row-actions" style={{ marginTop: "10px" }}>
              <button type="button" className="btn-gold" onClick={handleAddFestival}>
                Save override
              </button>
              <button type="button" className="btn-outline" onClick={() => setFestivalAddOpen(false)}>
                Cancel
              </button>
            </div>
          </div>

          <datalist id="festival-keys">
            {KNOWN_FESTIVAL_KEYS.map((k) => (
              <option key={k} value={k} />
            ))}
          </datalist>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Key</th>
                  <th>Banner text</th>
                  <th>Eyebrow</th>
                  <th>Emoji</th>
                  <th>Priority</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {festivalsLoading && (
                  <tr>
                    <td colSpan={7}>Loading…</td>
                  </tr>
                )}
                {!festivalsLoading && festivalsError && (
                  <tr>
                    <td colSpan={7}>{festivalsError}</td>
                  </tr>
                )}
                {!festivalsLoading && !festivalsError && festivals.length === 0 && (
                  <tr>
                    <td colSpan={7}>No overrides yet — dates fall back to Google Calendar / the default list.</td>
                  </tr>
                )}
                {!festivalsLoading &&
                  !festivalsError &&
                  festivals.map((f) => {
                    const draft = festivalDrafts[f.id] || f;
                    const dirty = festivalRowDirty(f.id);
                    return (
                      <tr key={f.id} className={dirty ? "dirty-row" : ""}>
                        <td data-label="Date">
                          {dirty && <span className="dirty-dot" title="Unsaved changes" />}
                          <input
                            type="date"
                            value={draft.date}
                            onChange={(e) => updateFestivalDraft(f.id, { date: e.target.value })}
                          />
                        </td>
                        <td data-label="Key">
                          <input
                            list="festival-keys"
                            value={draft.key}
                            onChange={(e) => updateFestivalDraft(f.id, { key: e.target.value })}
                          />
                        </td>
                        <td data-label="Banner text">
                          <input
                            value={draft.text}
                            onChange={(e) => updateFestivalDraft(f.id, { text: e.target.value })}
                          />
                        </td>
                        <td data-label="Eyebrow">
                          <input
                            value={draft.eyebrow}
                            onChange={(e) => updateFestivalDraft(f.id, { eyebrow: e.target.value })}
                          />
                        </td>
                        <td data-label="Emoji">
                          <input
                            style={{ width: "56px" }}
                            value={draft.emoji}
                            onChange={(e) => updateFestivalDraft(f.id, { emoji: e.target.value })}
                          />
                        </td>
                        <td data-label="Priority">
                          <input
                            type="number"
                            style={{ width: "64px" }}
                            value={draft.priority}
                            onChange={(e) => updateFestivalDraft(f.id, { priority: e.target.value })}
                          />
                        </td>
                        <td className="row-actions">
                          <button
                            type="button"
                            className="btn-gold"
                            disabled={!dirty || festivalSavingId === f.id}
                            onClick={() => handleSaveFestivalRow(f.id)}
                          >
                            {festivalSavingId === f.id ? "Saving…" : "Save"}
                          </button>
                          <button
                            type="button"
                            className="btn-danger"
                            onClick={() => handleDeleteFestival(f.id, draft.text || f.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </main>
      )}

      {isAuthorized && dirtySlugs.length > 0 && (
        <div className="savebar">
          <span className="savebar-text">
            {dirtySlugs.length} product{dirtySlugs.length === 1 ? "" : "s"} changed
          </span>
          <div className="savebar-actions">
            <button type="button" className="btn-outline" onClick={handleDiscardAll} disabled={saving}>
              Discard
            </button>
            <button type="button" className="btn-gold" onClick={handleSaveAll} disabled={saving}>
              {saving ? "Saving…" : `Save changes (${dirtySlugs.length})`}
            </button>
          </div>
        </div>
      )}
      </div>
    </>
  );
}