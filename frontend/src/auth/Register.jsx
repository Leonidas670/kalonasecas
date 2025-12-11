import { useRef, useState, useEffect } from "react";
import { http } from "../services/api"; // ⭐ LÍNEA 2 CAMBIADA - Ajusta la ruta según tu estructura
import "./Register.css";
import TC from "../components/layouts/TC";

export function Register({ onLoginClick, onClose }) {
  const [form, setForm] = useState({
    name_user: "",
    lastname_user: "",
    number_document: "",
    id_type_document: "",
    date_birth: "",
    direction_user: "",
    id_role_user: 1,
    email_user: "",
    password: "",
    confirmEmail: "",
    confirmPassword: "",
  });

  const [documentTypes, setDocumentTypes] = useState([]);
  const [message, setMessage] = useState("");
  const [registerError, setRegisterError] = useState(""); // light error (autocloses)
  const [modalOpen, setModalOpen] = useState(false);      // "strong" error modal
  const [modalMessage, setModalMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [canCheck, setCanCheck] = useState(false);
  const [tcChecked, setTcChecked] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  const modalRef = useRef(null);

  // ⭐ LÍNEAS 27-28 CAMBIADAS - Removido /api del inicio
  const urlRegister = "/auth/register";
  const urlDocumentTypes = "/types-documents";

  useEffect(() => {
    const fetchDocumentTypes = async () => {
      try {
        // ⭐ LÍNEA 36 CAMBIADA - Usando http en lugar de axios
        const { data } = await http.get(urlDocumentTypes);
        setDocumentTypes(data || []);
      } catch (error) {
        console.error("Error fetching document types:", error);
        setRegisterError("Could not load document types. Please try again later.");
      }
    };
    fetchDocumentTypes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const getPasswordStrength = (password) => {
    if (!password) return { label: "", score: 0, color: "" };

    const hasLetters = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasSpecial = /[^a-zA-Z0-9]/.test(password);

    if ((hasLetters && !hasNumbers) || (!hasLetters && hasNumbers)) {
      return { label: "Weak", score: 25, color: "#e74c3c" };
    }

    if (hasLetters && hasNumbers && !hasUppercase && !hasSpecial) {
      return { label: "Medium", score: 50, color: "#f39c12" };
    }

    if (hasLetters && hasNumbers && hasUppercase && !hasSpecial) {
      return { label: "Good", score: 75, color: "#27ae60" };
    }

    if (hasLetters && hasNumbers && hasUppercase && hasSpecial) {
      return { label: "Excellent", score: 100, color: "#2980b9" };
    }

    return { label: "Weak", score: 25, color: "#e74c3c" };
  };

  const requiredFields = [
    "name_user",
    "lastname_user",
    "date_birth",
    "direction_user",
    "number_document",
    "id_type_document",
    "email_user",
    "confirmEmail",
    "password",
    "confirmPassword",
  ];

  const completedFields = requiredFields.filter(
    (field) => form[field]?.toString().trim() !== ""
  ).length;

  const totalCompleted = completedFields + (tcChecked ? 1 : 0);
  const totalRequired = requiredFields.length + 1;
  const progress = Math.round((totalCompleted / totalRequired) * 100);

  const passwordStrength = getPasswordStrength(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setRegisterError("");
    setModalMessage("");

    if (form.id_type_document === "") {
      setModalMessage("You must select a document type.");
      setModalOpen(true);
      return;
    }

    if (
      !form.name_user.trim() ||
      !form.email_user.trim() ||
      !form.confirmEmail.trim() ||
      !form.password.trim() ||
      !form.confirmPassword.trim() ||
      !form.number_document
    ) {
      setModalMessage("All credentials are required.");
      setModalOpen(true);
      return;
    }

    if (
      form.email_user.trim().toLowerCase() !==
      form.confirmEmail.trim().toLowerCase()
    ) {
      setModalMessage("The emails do not match.");
      setModalOpen(true);
      return;
    }

    if (form.password !== form.confirmPassword) {
      setModalMessage("The passwords do not match.");
      setModalOpen(true);
      return;
    }

    if (!tcChecked) {
      setRegisterError("You must accept the terms and conditions.");
      return;
    }

    const payload = {
      name_user: form.name_user.trim(),
      lastname_user: form.lastname_user?.trim() || undefined,
      number_document: Number(form.number_document),
      id_type_document: Number(form.id_type_document),
      date_birth: form.date_birth ? form.date_birth : undefined,
      direction_user: form.direction_user?.trim() || undefined,
      id_role_user: form.id_role_user ? Number(form.id_role_user) : 1,
      email_user: form.email_user.trim().toLowerCase(),
      password: form.password,
    };

    if (Number.isNaN(payload.number_document)) {
      setModalMessage("The document number is not valid.");
      setModalOpen(true);
      return;
    }
    if (Number.isNaN(payload.id_type_document)) {
      setModalMessage("The document type is not valid.");
      setModalOpen(true);
      return;
    }

    try {
      setLoading(true);
      // ⭐ LÍNEA 164 CAMBIADA - Usando http en lugar de axios
      const { data } = await http.post(urlRegister, payload);
      setMessage(
        data?.message ||
          "✅ Successful registration. Please check your email."
      );
      setForm({
        name_user: "",
        lastname_user: "",
        number_document: "",
        id_type_document: "",
        date_birth: "",
        direction_user: "",
        id_role_user: 1,
        email_user: "",
        password: "",
        confirmEmail: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error("Error in registration:", err);
      const errorData = err.response?.data;
      const errorMessage =
        errorData?.message || "An unexpected error occurred.";
      setModalMessage(errorMessage);
      setModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      const clickedOutside =
        modalRef.current &&
        !modalRef.current.contains(e.target) &&
        !e.target.closest(".modalOverlayTerms") &&
        !e.target.closest("#userIcon") &&
        !e.target.closest("#mobileUserIcon");

      // En móvil ignoramos toques en la pantalla táctil que sean scroll
      if (
        clickedOutside &&
        !(e.type === "touchstart" && e.target.closest(".modal"))
      ) {
        onClose?.();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = termsOpen ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [termsOpen]);

  useEffect(() => {
    if (registerError) {
      const t = setTimeout(() => setRegisterError(""), 3000);
      return () => clearTimeout(t);
    }
  }, [registerError]);


  return (
    <section className="Register" ref={modalRef} role="dialog" aria-modal="true">
      <h1>Register</h1>

      <div className="progressBarContainer">
        <div
          className="progressBarFill"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="progressText">{progress}% completed</p>

      <hr />

      <form id="register-form" className="formRegister" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name_user" className="labelRegister">Names</label>
          <div>
            <input
              type="text"
              id="name_user"
              name="name_user"
              onChange={handleChange}
              onInput={handleChange}
              className="inputRegister"
              value={form.name_user}
              autoFocus
              required
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label htmlFor="lastname_user">Last Names</label>
          <div>
            <input
              type="text"
              id="lastname_user"
              name="lastname_user"
              value={form.lastname_user}
              onChange={handleChange}
              onInput={handleChange}
              className="inputRegister"
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label htmlFor="id_type_document">Document Type</label>
          <div>
            <select
              id="id_type_document"
              name="id_type_document"
              className="selectTypeDocument"
              value={form.id_type_document}
              onChange={handleChange}
              onInput={handleChange}
              required
              disabled={loading || documentTypes.length === 0}
            >
              <option value="" disabled>Select a document type</option>
              {documentTypes.map((type) => (
                <option key={type.id_type_document} value={type.id_type_document}>
                  {type.document_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="number_document">Document Number</label>
          <div>
            <input
              type="number"
              id="number_document"
              name="number_document"
              className="inputRegister"
              value={form.number_document}
              onChange={handleChange}
              required
              min={10000000}
              max={9999999999}
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label htmlFor="date_birth">Date of birth</label>
          <div>
            <input
              type="date"
              id="date_birth"
              name="date_birth"
              className="inputDate"
              onInput={handleChange}
              value={form.date_birth}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label htmlFor="direction_user">Direction</label>
          <div>
            <input
              type="text"
              id="direction_user"
              name="direction_user"
              className="inputRegister"
              onInput={handleChange}
              value={form.direction_user}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label htmlFor="email_user">Email</label>
          <div>
            <input
              type="email"
              name="email_user"
              id="email_user"
              className="inputRegister"
              value={form.email_user}
              onChange={handleChange}
              onInput={handleChange}
              required
              autoComplete="email"
              inputMode="email"
              onCopy={(e) => e.preventDefault()}
              onCut={(e) => e.preventDefault()}
              placeholder="user@domain.com"
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label htmlFor="confirmEmail">Confirm Email</label>
          <div>
            <input
              type="email"
              name="confirmEmail"
              id="confirmEmail"
              className="inputRegister"
              value={form.confirmEmail}
              onChange={handleChange}
              required
              autoComplete="email"
              onInput={handleChange}
              inputMode="email"
              onCopy={(e) => e.preventDefault()}
              onCut={(e) => e.preventDefault()}
              placeholder="user@domain.com"
              disabled={loading}
            />
          </div>
          {form.confirmEmail &&
            form.email_user.trim().toLowerCase() !==
            form.confirmEmail.trim().toLowerCase() && (
              <p className="fieldError">Emails do not match</p>
            )}
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <div>
            <input
              type="password"
              name="password"
              id="password"
              className="inputRegister"
              onInput={handleChange}
              value={form.password}
              onChange={handleChange}
              required
              placeholder="minimum 8 characters"
              minLength={8}
              disabled={loading}
            />
          </div>

          {form.password && (
            <div className="passwordStrengthContainer">
              <div
                className="passwordStrengthBar"
                style={{
                  width: `${passwordStrength.score}%`,
                  backgroundColor: passwordStrength.color,
                }}
              />
              <p className="passwordStrengthLabel">
                {passwordStrength.label} password
              </p>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword">Confirm Password</label>
          <div>
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              className="inputRegister"
              value={form.confirmPassword}
              onInput={handleChange}
              onChange={handleChange}
              required
              placeholder="confirm your password"
              minLength={8}
              disabled={loading}
            />
          </div>
          {form.confirmPassword &&
            form.password !== form.confirmPassword && (
              <p className="fieldError">Passwords do not match</p>
            )}
        </div>

        <div className="formGroup termsGroup">
          <input
            type="checkbox"
            id="termsCheck"
            name="termsCheck"
            onInput={handleChange}
            disabled={!canCheck}
            checked={tcChecked}
            required
            onChange={(e) => setTcChecked(e.target.checked)}
          />
          <label htmlFor="termsCheck">
            I accept the{" "}
            
              href="#"
              className="aRegister"
              onClick={(e) => {
                e.preventDefault();
                setTermsOpen(true);
              }}
            >
              Terms and Conditions
            </a>
          </label>
        </div>

        {message && <div className="messageRegister">{message}</div>}
        {registerError && <div className="errorMessage">{registerError}</div>}
      </form>

      <div style={{ textAlign: "center" }}>
        <button
          type="submit"
          form="register-form"
          className="buttonRegister"
          disabled={loading}
        >
          {loading ? "Processing..." : "Sign Up"}
        </button>
        <div className="aPosition">
          
            href=""
            className="aRegister"
            onClick={(e) => {
              e.preventDefault();
              onLoginClick?.();
            }}
          >
            Do you already have an account?
          </a>
        </div>
      </div>

      {modalOpen && (
        <div className="modalOverlay" onClick={() => setModalOpen(false)}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <p>{modalMessage}</p>
            <button onClick={() => setModalOpen(false)}>Close</button>
          </div>
        </div>
      )}

      <TC
        isOpen={termsOpen}
        onClose={() => {
          setTermsOpen(false);
          setCanCheck(true);
        }}
      />
    </section>
  );
}
