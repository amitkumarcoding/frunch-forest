import { useEffect, useMemo, useRef, useState } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import {
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
import { ALLOWED_ADMINS } from "../../utils/admins";
import { isOutOfStock } from "../../utils/stock";
import { auth, db } from "../../services/firebase";

const KNOWN_FESTIVAL_KEYS = Object.keys(FESTIVE_THEMES);

const EMPTY_NEW_PRODUCT = {
  slug: "",
  name: "",
  hindi: "",
  tag: "",
  image: "",
  bestSeller: false,
  stock: "",
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

const EMPTY_NEW_OFFER = {
  title: "",
  description: "",
  discount: "",
  code: "",
  image: "",
  link: "",
  active: true,
  startDate: "",
  endDate: "",
  priority: 10,
};

const EMPTY_NEW_BLOG_POST = {
  no: "",
  label: "",
  title: "",
  lede: "",
  sources: "",
  note: "",
  order: 10,
  published: true,
};

// The 6 original Nutrient Almanac specimens, hardcoded as the fallback
// in Blog.jsx (DEFAULT_SPECIMENS). "Seed starter posts" below writes
// these into Firestore under fixed slug-style ids so they become real,
// editable/deletable docs instead of a read-only code fallback.
const STARTER_BLOG_POSTS = [
  {
    id: "protein", no: "NO. 01", label: "PROTEIN", title: "Protein",
    lede: "The building block your body uses to repair muscle and stay full for longer.",
    sources: ["Almonds", "Cashews"],
    note: "A small handful of almonds or cashews carries a meaningful dose of plant protein alongside fibre, which is why they curb hunger far better than a snack of refined carbs. Pair them with a fruit or yoghurt for a more complete amino acid profile.",
    order: 1,
  },
  {
    id: "healthy-fats", no: "NO. 02", label: "OMEGA-3 FATS", title: "Healthy Fats",
    lede: "Not all fat is equal — these are the kind that support heart and brain health.",
    sources: ["Walnuts"],
    note: "Walnuts are one of the few plant sources with a genuinely useful amount of alpha-linolenic acid, a plant-based omega-3. Regularly including a few walnuts in the diet is commonly associated with better cholesterol balance and steadier energy through the day.",
    order: 2,
  },
  {
    id: "fibre", no: "NO. 03", label: "DIETARY FIBRE", title: "Fibre",
    lede: "Keeps digestion moving and helps even out blood sugar swings after meals.",
    sources: ["Raisins", "Almonds"],
    note: "Because raisins concentrate the fibre of fresh grapes into a smaller bite, a small portion goes a long way toward daily fibre needs. Combined with almond skins, which carry their own fibre and antioxidants, this pairing is a simple way to support gut health.",
    order: 3,
  },
  {
    id: "iron", no: "NO. 04", label: "IRON", title: "Iron",
    lede: "Essential for carrying oxygen through the blood and staving off fatigue.",
    sources: ["Raisins", "Cashews"],
    note: "Raisins and cashews both carry non-heme iron, the plant-based form the body absorbs best when paired with vitamin C. A squeeze of lemon over a trail mix, or eating them alongside citrus, helps the body take up more of it.",
    order: 4,
  },
  {
    id: "magnesium", no: "NO. 05", label: "MAGNESIUM", title: "Magnesium",
    lede: "A quiet mineral behind muscle recovery, sleep quality and steady mood.",
    sources: ["Cashews", "Fox Nuts"],
    note: "Cashews are one of the more magnesium-dense nuts, and roasted fox nuts (makhana) add their own light, low-fat contribution. Together they make an easy evening snack that doesn't sit heavy before bed.",
    order: 5,
  },
  {
    id: "antioxidants", no: "NO. 06", label: "ANTIOXIDANTS", title: "Antioxidants",
    lede: "Plant compounds that help the body manage everyday cellular wear and tear.",
    sources: ["Walnuts", "Raisins"],
    note: "The thin brown skin on a walnut and the dark skin of a raisin both concentrate polyphenols — so resist the urge to peel them. Left whole, both snacks do double duty as flavour and quiet cellular support.",
    order: 6,
  },
];

function toBlogDraft(id, data) {
  return {
    id,
    no: data.no || "",
    label: data.label || "",
    title: data.title || "",
    lede: data.lede || "",
    sources: Array.isArray(data.sources) ? data.sources.join(", ") : (data.sources || ""),
    note: data.note || "",
    order: typeof data.order === "number" ? data.order : 10,
    published: data.published !== false,
  };
}

function packsSummary(packs) {
  return (packs || []).map((pk) => `${pk.size}:₹${pk.price}`).join(", ");
}

function toOriginalDraft(data) {
  return {
    name: data.name || "",
    tag: data.tag || "",
    inStock: data.inStock !== false,
    stock: typeof data.stock === "number" ? String(data.stock) : "",
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

  // ---- Festival offers & discounts (Home page promo cards) ----
  const [offers, setOffers] = useState([]); // [{id, title, description, discount, code, image, link, active, startDate, endDate, priority}]
  const [offerDrafts, setOfferDrafts] = useState({}); // id -> same shape
  const [offersLoading, setOffersLoading] = useState(false);
  const [offersError, setOffersError] = useState("");
  const [offerSavingId, setOfferSavingId] = useState(null);
  const [offerAddOpen, setOfferAddOpen] = useState(false);
  const [newOffer, setNewOffer] = useState(EMPTY_NEW_OFFER);

  // ---- Blog / Field notes (Nutrient Almanac specimen cards) ----
  const [blogPosts, setBlogPosts] = useState([]); // [{id, no, label, title, lede, sources, note, order}]
  const [blogDrafts, setBlogDrafts] = useState({}); // id -> same shape (sources as comma string)
  const [blogLoading, setBlogLoading] = useState(false);
  const [blogError, setBlogError] = useState("");
  const [blogSavingId, setBlogSavingId] = useState(null);
  const [blogSeeding, setBlogSeeding] = useState(false);
  const [blogAddOpen, setBlogAddOpen] = useState(false);
  const [newBlogPost, setNewBlogPost] = useState(EMPTY_NEW_BLOG_POST);

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
      loadOffers();
      loadBlogPosts();
    }
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
    return ["name", "tag", "inStock", "stock", "packs"].some((f) => fieldChanged(slug, f));
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
          stock: draft.stock === "" ? null : Number(draft.stock),
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
      stock: newProduct.stock === "" ? null : Number(newProduct.stock),
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

  // ---- Festival offers & discounts ----
  // Live in Firestore ("offers" collection) and are rendered as promo
  // cards on the Home page — see firebaseOffers.js / FestivalOffers.jsx.
  // `active` hides an offer without deleting it; `startDate`/`endDate`
  // (optional) limit when it shows.
  async function loadOffers() {
    setOffersLoading(true);
    setOffersError("");
    try {
      const snap = await getDocs(collection(db, "offers"));
      const list = [];
      const drafts = {};
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        const row = {
          id: docSnap.id,
          title: data.title || "",
          description: data.description || "",
          discount: data.discount || "",
          code: data.code || "",
          image: data.image || "",
          link: data.link || "",
          active: data.active !== false,
          startDate: data.startDate || "",
          endDate: data.endDate || "",
          priority: typeof data.priority === "number" ? data.priority : 10,
        };
        list.push(row);
        drafts[docSnap.id] = row;
      });
      list.sort((a, b) => b.priority - a.priority);
      setOffers(list);
      setOfferDrafts(drafts);
    } catch (e) {
      setOffersError(`Error loading offers: ${e.message}`);
    } finally {
      setOffersLoading(false);
    }
  }

  function updateOfferDraft(id, patch) {
    setOfferDrafts((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }

  function offerRowDirty(id) {
    const original = offers.find((o) => o.id === id);
    const draft = offerDrafts[id];
    if (!original || !draft) return false;
    return [
      "title",
      "description",
      "discount",
      "code",
      "image",
      "link",
      "active",
      "startDate",
      "endDate",
      "priority",
    ].some((field) => String(original[field]) !== String(draft[field]));
  }

  async function handleSaveOfferRow(id) {
    const draft = offerDrafts[id];
    if (!draft) return;
    if (!draft.title.trim()) return window.alert("Title is required.");
    setOfferSavingId(id);
    try {
      const cleaned = {
        title: draft.title.trim(),
        description: draft.description.trim(),
        discount: draft.discount.trim(),
        code: draft.code.trim(),
        image: draft.image.trim(),
        link: draft.link.trim(),
        active: !!draft.active,
        startDate: draft.startDate,
        endDate: draft.endDate,
        priority: Number(draft.priority) || 10,
      };
      await setDoc(doc(db, "offers", id), cleaned);
      setOffers((prev) => prev.map((o) => (o.id === id ? { id, ...cleaned } : o)));
      setOfferDrafts((prev) => ({ ...prev, [id]: { id, ...cleaned } }));
      setStatusMessage("Saved offer.");
    } catch (e) {
      setStatusMessage(`Save failed: ${e.message}`, false);
    } finally {
      setOfferSavingId(null);
    }
  }

  async function handleDeleteOffer(id, label) {
    if (!window.confirm(`Delete offer "${label}"? This cannot be undone.`)) return;
    try {
      await deleteDoc(doc(db, "offers", id));
      setOffers((prev) => prev.filter((o) => o.id !== id));
      setOfferDrafts((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setStatusMessage("Deleted offer.");
    } catch (e) {
      setStatusMessage(`Delete failed: ${e.message}`, false);
    }
  }

  function updateNewOffer(patch) {
    setNewOffer((prev) => ({ ...prev, ...patch }));
  }

  async function handleAddOffer() {
    if (!newOffer.title.trim()) return window.alert("Title is required.");
    if (!window.confirm(`Add offer "${newOffer.title.trim()}"?`)) return;
    try {
      await addDoc(collection(db, "offers"), {
        title: newOffer.title.trim(),
        description: newOffer.description.trim(),
        discount: newOffer.discount.trim(),
        code: newOffer.code.trim(),
        image: newOffer.image.trim(),
        link: newOffer.link.trim(),
        active: !!newOffer.active,
        startDate: newOffer.startDate,
        endDate: newOffer.endDate,
        priority: Number(newOffer.priority) || 10,
      });
      setOfferAddOpen(false);
      setNewOffer(EMPTY_NEW_OFFER);
      setStatusMessage("Offer added.");
      loadOffers();
    } catch (e) {
      setStatusMessage(`Add failed: ${e.message}`, false);
    }
  }

  // ---- Blog / Field notes ----
  // Live in Firestore ("blogPosts" collection) and render as the
  // specimen cards on the Blog page — see firebaseBlog.js / Blog.jsx.
  // `sources` is edited here as a comma-separated string and stored as
  // an array; names matching SOURCE_SLUGS in Blog.jsx link straight to
  // that product. `order` controls display order (ascending).
  async function loadBlogPosts() {
    setBlogLoading(true);
    setBlogError("");
    try {
      const snap = await getDocs(collection(db, "blogPosts"));
      const list = [];
      const drafts = {};
      snap.forEach((docSnap) => {
        const row = toBlogDraft(docSnap.id, docSnap.data());
        list.push(row);
        drafts[docSnap.id] = row;
      });
      list.sort((a, b) => a.order - b.order || a.no.localeCompare(b.no));
      setBlogPosts(list);
      setBlogDrafts(drafts);
    } catch (e) {
      setBlogError(`Error loading blog posts: ${e.message}`);
    } finally {
      setBlogLoading(false);
    }
  }

  function updateBlogDraft(id, patch) {
    setBlogDrafts((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }

  function blogRowDirty(id) {
    const original = blogPosts.find((b) => b.id === id);
    const draft = blogDrafts[id];
    if (!original || !draft) return false;
    return ["no", "label", "title", "lede", "sources", "note", "order", "published"].some(
      (field) => String(original[field]) !== String(draft[field])
    );
  }

  async function handleSaveBlogRow(id) {
    const draft = blogDrafts[id];
    if (!draft) return;
    if (!draft.title.trim()) return window.alert("Title is required.");
    setBlogSavingId(id);
    try {
      const cleaned = {
        no: draft.no.trim(),
        label: draft.label.trim(),
        title: draft.title.trim(),
        lede: draft.lede.trim(),
        sources: draft.sources.split(",").map((s) => s.trim()).filter(Boolean),
        note: draft.note.trim(),
        order: Number(draft.order) || 10,
        published: !!draft.published,
      };
      await setDoc(doc(db, "blogPosts", id), cleaned);
      const row = toBlogDraft(id, cleaned);
      setBlogPosts((prev) => prev.map((b) => (b.id === id ? row : b)));
      setBlogDrafts((prev) => ({ ...prev, [id]: row }));
      setStatusMessage("Saved blog post.");
    } catch (e) {
      setStatusMessage(`Save failed: ${e.message}`, false);
    } finally {
      setBlogSavingId(null);
    }
  }

  async function handleDeleteBlogPost(id, label) {
    if (!window.confirm(`Delete blog post "${label}"? This cannot be undone.`)) return;
    try {
      await deleteDoc(doc(db, "blogPosts", id));
      setBlogPosts((prev) => prev.filter((b) => b.id !== id));
      setBlogDrafts((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setStatusMessage("Deleted blog post.");
    } catch (e) {
      setStatusMessage(`Delete failed: ${e.message}`, false);
    }
  }

  function updateNewBlogPost(patch) {
    setNewBlogPost((prev) => ({ ...prev, ...patch }));
  }

  async function handleAddBlogPost() {
    if (!newBlogPost.title.trim()) return window.alert("Title is required.");
    if (!window.confirm(`Add blog post "${newBlogPost.title.trim()}"?`)) return;
    try {
      await addDoc(collection(db, "blogPosts"), {
        no: newBlogPost.no.trim(),
        label: newBlogPost.label.trim(),
        title: newBlogPost.title.trim(),
        lede: newBlogPost.lede.trim(),
        sources: newBlogPost.sources.split(",").map((s) => s.trim()).filter(Boolean),
        note: newBlogPost.note.trim(),
        order: Number(newBlogPost.order) || 10,
        published: !!newBlogPost.published,
      });
      setBlogAddOpen(false);
      setNewBlogPost(EMPTY_NEW_BLOG_POST);
      setStatusMessage("Blog post added.");
      loadBlogPosts();
    } catch (e) {
      setStatusMessage(`Add failed: ${e.message}`, false);
    }
  }

  // Writes the 6 original Nutrient Almanac specimens into Firestore
  // (fixed ids, so re-running this just overwrites them rather than
  // duplicating) — turns the Blog page's hardcoded fallback into real,
  // editable/deletable docs.
  async function handleSeedBlogPosts() {
    if (!window.confirm("Add the 6 starter blog posts (Protein, Healthy Fats, Fibre, Iron, Magnesium, Antioxidants)?")) return;
    setBlogSeeding(true);
    try {
      const batch = writeBatch(db);
      STARTER_BLOG_POSTS.forEach(({ id, ...post }) => {
        batch.set(doc(db, "blogPosts", id), post);
      });
      await batch.commit();
      setStatusMessage("Added the 6 starter blog posts.");
      loadBlogPosts();
    } catch (e) {
      setStatusMessage(`Seed failed: ${e.message}`, false);
    } finally {
      setBlogSeeding(false);
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
                placeholder="/image/products/x.png"
                value={newProduct.image}
                onChange={(e) => updateNewProduct({ image: e.target.value })}
              />
              <input
                type="number"
                placeholder="Stock qty (blank = untracked)"
                value={newProduct.stock}
                onChange={(e) => updateNewProduct({ stock: e.target.value })}
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
                  <th>Stock</th>
                  <th>In stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {productsLoading && (
                  <tr>
                    <td colSpan={8}>Loading…</td>
                  </tr>
                )}
                {!productsLoading && productsError && (
                  <tr>
                    <td colSpan={8}>{productsError}</td>
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
                        <td data-label="Stock">
                          <input
                            className={fieldChanged(p.slug, "stock") ? "changed" : ""}
                            type="number"
                            style={{ width: "80px" }}
                            placeholder="—"
                            value={draft.stock ?? ""}
                            onChange={(e) => updateDraft(p.slug, { stock: e.target.value })}
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
                        <td data-label="Status">
                          {isOutOfStock({ inStock: draft.inStock, stock: draft.stock === "" ? null : Number(draft.stock) })
                            ? <span className="status-out">Out of stock</span>
                            : <span className="status-in">In stock</span>}
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

          <div className="section-header">
            <div>
              <h2>Festival offers &amp; discounts</h2>
              <p className="hint">
                Promo cards shown on the Home page. Uncheck "Active" to hide an offer without deleting it; start/end dates are optional.
              </p>
            </div>
            <button type="button" className="btn-gold" onClick={() => setOfferAddOpen((v) => !v)}>
              + Add offer
            </button>
          </div>

          <div id="addOfferBox" className={offerAddOpen ? "open" : ""}>
            <div className="grid2">
              <label className="field-inline">
                <span className="field-label">Title</span>
                <input
                  placeholder="Diwali Dhamaka"
                  value={newOffer.title}
                  onChange={(e) => updateNewOffer({ title: e.target.value })}
                />
              </label>
              <label className="field-inline">
                <span className="field-label">Discount badge</span>
                <input
                  placeholder="20% OFF"
                  value={newOffer.discount}
                  onChange={(e) => updateNewOffer({ discount: e.target.value })}
                />
              </label>
              <label className="field-inline">
                <span className="field-label">Description</span>
                <input
                  placeholder="Flat 20% off on all gift boxes"
                  value={newOffer.description}
                  onChange={(e) => updateNewOffer({ description: e.target.value })}
                />
              </label>
              <label className="field-inline">
                <span className="field-label">Coupon code</span>
                <input
                  placeholder="DIWALI20"
                  value={newOffer.code}
                  onChange={(e) => updateNewOffer({ code: e.target.value })}
                />
              </label>
              <label className="field-inline">
                <span className="field-label">Image URL</span>
                <input
                  placeholder="/image/offers/diwali.jpg"
                  value={newOffer.image}
                  onChange={(e) => updateNewOffer({ image: e.target.value })}
                />
              </label>
              <label className="field-inline">
                <span className="field-label">Link</span>
                <input
                  placeholder="#products"
                  value={newOffer.link}
                  onChange={(e) => updateNewOffer({ link: e.target.value })}
                />
              </label>
              <label className="field-inline">
                <span className="field-label">Start date (optional)</span>
                <input
                  type="date"
                  value={newOffer.startDate}
                  onChange={(e) => updateNewOffer({ startDate: e.target.value })}
                />
              </label>
              <label className="field-inline">
                <span className="field-label">End date (optional)</span>
                <input
                  type="date"
                  value={newOffer.endDate}
                  onChange={(e) => updateNewOffer({ endDate: e.target.value })}
                />
              </label>
              <label className="field-inline">
                <span className="field-label">Priority (higher shows first)</span>
                <input
                  type="number"
                  value={newOffer.priority}
                  onChange={(e) => updateNewOffer({ priority: e.target.value })}
                />
              </label>
              <label className="check-inline">
                <input
                  type="checkbox"
                  style={{ width: "auto" }}
                  checked={newOffer.active}
                  onChange={(e) => updateNewOffer({ active: e.target.checked })}
                />{" "}
                Active
              </label>
            </div>
            <div className="row-actions" style={{ marginTop: "10px" }}>
              <button type="button" className="btn-gold" onClick={handleAddOffer}>
                Save offer
              </button>
              <button type="button" className="btn-outline" onClick={() => setOfferAddOpen(false)}>
                Cancel
              </button>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Discount</th>
                  <th>Code</th>
                  <th>Window</th>
                  <th>Active</th>
                  <th>Priority</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {offersLoading && (
                  <tr>
                    <td colSpan={7}>Loading…</td>
                  </tr>
                )}
                {!offersLoading && offersError && (
                  <tr>
                    <td colSpan={7}>{offersError}</td>
                  </tr>
                )}
                {!offersLoading && !offersError && offers.length === 0 && (
                  <tr>
                    <td colSpan={7}>No offers yet — add one to show a promo card on the Home page.</td>
                  </tr>
                )}
                {!offersLoading &&
                  !offersError &&
                  offers.map((o) => {
                    const draft = offerDrafts[o.id] || o;
                    const dirty = offerRowDirty(o.id);
                    return (
                      <tr key={o.id} className={dirty ? "dirty-row" : ""}>
                        <td data-label="Title">
                          {dirty && <span className="dirty-dot" title="Unsaved changes" />}
                          <input
                            value={draft.title}
                            onChange={(e) => updateOfferDraft(o.id, { title: e.target.value })}
                          />
                        </td>
                        <td data-label="Discount">
                          <input
                            value={draft.discount}
                            onChange={(e) => updateOfferDraft(o.id, { discount: e.target.value })}
                          />
                        </td>
                        <td data-label="Code">
                          <input
                            value={draft.code}
                            onChange={(e) => updateOfferDraft(o.id, { code: e.target.value })}
                          />
                        </td>
                        <td data-label="Window">
                          <div style={{ display: "flex", gap: "4px" }}>
                            <input
                              type="date"
                              value={draft.startDate}
                              onChange={(e) => updateOfferDraft(o.id, { startDate: e.target.value })}
                            />
                            <input
                              type="date"
                              value={draft.endDate}
                              onChange={(e) => updateOfferDraft(o.id, { endDate: e.target.value })}
                            />
                          </div>
                        </td>
                        <td data-label="Active">
                          <input
                            type="checkbox"
                            checked={!!draft.active}
                            onChange={(e) => updateOfferDraft(o.id, { active: e.target.checked })}
                          />
                        </td>
                        <td data-label="Priority">
                          <input
                            type="number"
                            style={{ width: "64px" }}
                            value={draft.priority}
                            onChange={(e) => updateOfferDraft(o.id, { priority: e.target.value })}
                          />
                        </td>
                        <td className="row-actions">
                          <button
                            type="button"
                            className="btn-gold"
                            disabled={!dirty || offerSavingId === o.id}
                            onClick={() => handleSaveOfferRow(o.id)}
                          >
                            {offerSavingId === o.id ? "Saving…" : "Save"}
                          </button>
                          <button
                            type="button"
                            className="btn-danger"
                            onClick={() => handleDeleteOffer(o.id, draft.title || o.id)}
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

          <div className="section-header">
            <div>
              <h2>Blog / Field notes</h2>
              <p className="hint">
                The specimen cards on the Blog (Nutrient Almanac) page. "Sources" is a comma-separated list of product names — a name matching a real product (e.g. Almonds, Cashews, Walnuts, Raisins) links straight to it. Lower "Order" values show first.
              </p>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              {!blogLoading && !blogError && blogPosts.length === 0 && (
                <button type="button" className="btn-outline" onClick={handleSeedBlogPosts} disabled={blogSeeding}>
                  {blogSeeding ? "Adding…" : "Seed starter posts"}
                </button>
              )}
              <button type="button" className="btn-gold" onClick={() => setBlogAddOpen((v) => !v)}>
                + Add post
              </button>
            </div>
          </div>

          <div id="addBlogBox" className={blogAddOpen ? "open" : ""}>
            <div className="grid2">
              <label className="field-inline">
                <span className="field-label">No. (display label)</span>
                <input
                  placeholder="NO. 07"
                  value={newBlogPost.no}
                  onChange={(e) => updateNewBlogPost({ no: e.target.value })}
                />
              </label>
              <label className="field-inline">
                <span className="field-label">Tag label</span>
                <input
                  placeholder="VITAMIN E"
                  value={newBlogPost.label}
                  onChange={(e) => updateNewBlogPost({ label: e.target.value })}
                />
              </label>
              <label className="field-inline">
                <span className="field-label">Title</span>
                <input
                  placeholder="Vitamin E"
                  value={newBlogPost.title}
                  onChange={(e) => updateNewBlogPost({ title: e.target.value })}
                />
              </label>
              <label className="field-inline">
                <span className="field-label">Order (lower shows first)</span>
                <input
                  type="number"
                  value={newBlogPost.order}
                  onChange={(e) => updateNewBlogPost({ order: e.target.value })}
                />
              </label>
              <label className="check-inline">
                <input
                  type="checkbox"
                  style={{ width: "auto" }}
                  checked={newBlogPost.published}
                  onChange={(e) => updateNewBlogPost({ published: e.target.checked })}
                />{" "}
                Published
              </label>
              <label className="field-inline" style={{ gridColumn: "1 / -1" }}>
                <span className="field-label">Lede (one-line hook)</span>
                <input
                  placeholder="A quiet antioxidant that protects cell membranes."
                  value={newBlogPost.lede}
                  onChange={(e) => updateNewBlogPost({ lede: e.target.value })}
                />
              </label>
              <label className="field-inline" style={{ gridColumn: "1 / -1" }}>
                <span className="field-label">Sources (comma-separated)</span>
                <input
                  placeholder="Almonds, Pistachios"
                  value={newBlogPost.sources}
                  onChange={(e) => updateNewBlogPost({ sources: e.target.value })}
                />
              </label>
            </div>
            <p className="field-label">Field note (full paragraph)</p>
            <textarea
              value={newBlogPost.note}
              onChange={(e) => updateNewBlogPost({ note: e.target.value })}
            />
            <div className="row-actions" style={{ marginTop: "10px" }}>
              <button type="button" className="btn-gold" onClick={handleAddBlogPost}>
                Save post
              </button>
              <button type="button" className="btn-outline" onClick={() => setBlogAddOpen(false)}>
                Cancel
              </button>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Label</th>
                  <th>Title</th>
                  <th>Lede</th>
                  <th>Sources</th>
                  <th>Note</th>
                  <th>Order</th>
                  <th>Published</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {blogLoading && (
                  <tr>
                    <td colSpan={9}>Loading…</td>
                  </tr>
                )}
                {!blogLoading && blogError && (
                  <tr>
                    <td colSpan={9}>{blogError}</td>
                  </tr>
                )}
                {!blogLoading && !blogError && blogPosts.length === 0 && (
                  <tr>
                    <td colSpan={9}>No blog posts yet — the Blog page is showing its built-in fallback list. Click "Seed starter posts" above to load those 6 into here so you can edit or delete them, or add your own with "+ Add post".</td>
                  </tr>
                )}
                {!blogLoading &&
                  !blogError &&
                  blogPosts.map((b) => {
                    const draft = blogDrafts[b.id] || b;
                    const dirty = blogRowDirty(b.id);
                    return (
                      <tr key={b.id} className={dirty ? "dirty-row" : ""}>
                        <td data-label="No.">
                          {dirty && <span className="dirty-dot" title="Unsaved changes" />}
                          <input
                            style={{ width: "84px" }}
                            value={draft.no}
                            onChange={(e) => updateBlogDraft(b.id, { no: e.target.value })}
                          />
                        </td>
                        <td data-label="Label">
                          <input
                            value={draft.label}
                            onChange={(e) => updateBlogDraft(b.id, { label: e.target.value })}
                          />
                        </td>
                        <td data-label="Title">
                          <input
                            value={draft.title}
                            onChange={(e) => updateBlogDraft(b.id, { title: e.target.value })}
                          />
                        </td>
                        <td data-label="Lede">
                          <input
                            value={draft.lede}
                            onChange={(e) => updateBlogDraft(b.id, { lede: e.target.value })}
                          />
                        </td>
                        <td data-label="Sources">
                          <input
                            placeholder="Almonds, Cashews"
                            value={draft.sources}
                            onChange={(e) => updateBlogDraft(b.id, { sources: e.target.value })}
                          />
                        </td>
                        <td data-label="Note">
                          <input
                            value={draft.note}
                            onChange={(e) => updateBlogDraft(b.id, { note: e.target.value })}
                          />
                        </td>
                        <td data-label="Order">
                          <input
                            type="number"
                            style={{ width: "64px" }}
                            value={draft.order}
                            onChange={(e) => updateBlogDraft(b.id, { order: e.target.value })}
                          />
                        </td>
                        <td data-label="Published">
                          <input
                            type="checkbox"
                            checked={!!draft.published}
                            onChange={(e) => updateBlogDraft(b.id, { published: e.target.checked })}
                          />
                        </td>
                        <td className="row-actions">
                          <button
                            type="button"
                            className="btn-gold"
                            disabled={!dirty || blogSavingId === b.id}
                            onClick={() => handleSaveBlogRow(b.id)}
                          >
                            {blogSavingId === b.id ? "Saving…" : "Save"}
                          </button>
                          <button
                            type="button"
                            className="btn-danger"
                            onClick={() => handleDeleteBlogPost(b.id, draft.title || b.id)}
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