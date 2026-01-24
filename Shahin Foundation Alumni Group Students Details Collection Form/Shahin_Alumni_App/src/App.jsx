import { useState } from "react";
import "./App.css";

function App() {
  // Form state
  const [name, setName] = useState("");
  const [occupation, setOccupation] = useState("");
  const [qualification, setQualification] = useState("");
  const [code] = useState("+91");
  const [mobile, setMobile] = useState("");

  // UI state
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Dropdown options
  const qualificationOptions = [
    "B.E",
    "B.Ed",
    "CA",
    "CA Intern",
    "LLB",
    "MBBS",
    "Nursing",
    "B.Com",
    "M.Com",
    "PTC",
    "BCA",
    "MCA",
    "MBA",
    "LLM",
    "B.sc",
    "M.sc",
    "BHMS",
    "Pharmacy",
    "Pshycologist",
    "10th",
    "11th",
    "12th",
    "Ph.D",
    "B.A",
    "M.A",
  ];

  const occupationOptions = [
    "Businessman",
    "Teacher",
    "Software Engineer",
    "Civil Engineer",
    "Architect",
    "HR",
    "Counselor",
    "Student",
    "Army",
    "Police",
    "Advocate",
    "Sales Worker",
    "Marketting",
    "House Wife",
    "No Work",
    "FreeLancing",
  ];

  // Validation
  function validate() {
    const newErrors = {};

    if (!name.trim()) newErrors.name = "Name is required";
    if (!occupation) newErrors.occupation = "Occupation is required";
    if (!qualification) newErrors.qualification = "Qualification is required";

    if (!mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^[6-9]\d{9}$/.test(mobile)) {
      newErrors.mobile = "Enter a valid 10-digit Indian mobile number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // Submit handler
  async function handleSubmit(event) {
    event.preventDefault();

    if (!validate()) return;

    setLoading(true);
    setSuccess(false);

    try {
      const response = await fetch("http://localhost:5000/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          occupation,
          qualification,
          code,
          mobile,
        }),
      });

      if (!response.ok) throw new Error("API Error");

      setSuccess(true);
      clearAll(true);
    } catch (error) {
      console.log("Error :: ", error);
      alert("Failed to submit data. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Clear form
  function clearAll(keepSuccess = false) {
    setName("");
    setOccupation("");
    setQualification("");
    setMobile("");
    setErrors({});
    if (!keepSuccess) setSuccess(false);
  }

  return (
    <div className="app-container">
      <h1>Shahin Foundation</h1>
      <h2>Alumni Student Entry Form</h2>

      <form onSubmit={handleSubmit} className="form-card">
        {/* Name */}
        Student Name ::
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {errors.name && <p className="error">{errors.name}</p>}
        {/* Occupation */}
        Current Occupation ::
        <select
          value={occupation}
          onChange={(e) => setOccupation(e.target.value)}
        >
          <option value="">-- Select Occupation --</option>
          {occupationOptions.map((item, index) => (
            <option key={index} value={item}>
              {item}
            </option>
          ))}
        </select>
        {errors.occupation && <p className="error">{errors.occupation}</p>}
        {/* Qualification */}
        Qualification ::
        <select
          value={qualification}
          onChange={(e) => setQualification(e.target.value)}
        >
          <option value="">-- Select Qualification --</option>
          {qualificationOptions.map((item, index) => (
            <option key={index} value={item}>
              {item}
            </option>
          ))}
        </select>
        {errors.qualification && (
          <p className="error">{errors.qualification}</p>
        )}
        {/* Mobile */}
        Mobile Number ::
        <div className="mobile-row">
          <input type="text" value={code} readOnly />
          <input
            type="number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="Enter mobile number"
          />
        </div>
        {errors.mobile && <p className="error">{errors.mobile}</p>}
        {success && <p className="success">Data submitted successfully!</p>}
        {/* Buttons */}
        <div className="button-row">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => clearAll()}
            disabled={loading}
          >
            Cancel
          </button>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default App;
